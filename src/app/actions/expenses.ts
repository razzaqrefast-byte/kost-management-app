'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExpense(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const propertyId = formData.get('propertyId') as string
    const category = formData.get('category') as string
    const amount = parseFloat(formData.get('amount') as string)
    const expenseDate = formData.get('expenseDate') as string
    const description = formData.get('description') as string

    if (!category || !amount || !expenseDate) {
        return { error: 'Kategori, Jumlah, dan Tanggal wajib diisi.' }
    }

    const { error } = await supabase.from('expenses').insert({
        owner_id: user.id,
        property_id: propertyId || null,
        category,
        amount,
        expense_date: expenseDate,
        description: description || null
    })

    if (error) {
        console.error('Create expense error:', error)
        return { error: 'Gagal menyimpan pengeluaran: ' + error.message }
    }

    revalidatePath('/owner/analytics')
    return { success: true }
}

export async function getExpenses() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            properties (name)
        `)
        .eq('owner_id', user.id)
        .order('expense_date', { ascending: false })

    if (error) {
        console.error('Fetch expenses error:', error)
        return { data: [], error: error.message }
    }

    return { data }
}
