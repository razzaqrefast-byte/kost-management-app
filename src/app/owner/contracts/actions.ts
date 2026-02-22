'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/actions/notifications'

export async function createContract(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const bookingId = formData.get('booking_id') as string
    const tenantId = formData.get('tenant_id') as string
    const propertyName = formData.get('property_name') as string
    const roomName = formData.get('room_name') as string
    const monthlyRent = parseFloat(formData.get('monthly_rent') as string)
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const notes = formData.get('notes') as string

    if (!bookingId || !tenantId || !startDate || !endDate) {
        return { error: 'Data kontrak tidak lengkap.' }
    }

    const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
            booking_id: bookingId,
            owner_id: user.id,
            tenant_id: tenantId,
            property_name: propertyName,
            room_name: roomName,
            monthly_rent: monthlyRent,
            start_date: startDate,
            end_date: endDate,
            notes: notes || null,
            status: 'active'
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // Notify tenant
    await createNotification({
        userId: tenantId,
        title: 'Kontrak Sewa Baru 📄',
        message: `Kontrak sewa Anda untuk ${roomName} di ${propertyName} telah dibuat. Periode: ${startDate} - ${endDate}.`,
        link: '/tenant/contracts'
    })

    revalidatePath('/owner/contracts')
    return { success: true, contract }
}

export async function getContracts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { contracts: [] }

    // Auto-update expired contracts
    const today = new Date().toISOString().split('T')[0]
    await supabase
        .from('contracts')
        .update({ status: 'expired' })
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .lt('end_date', today)

    const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { contracts: [], error: error.message }
    return { contracts: contracts || [] }
}

export async function terminateContract(contractId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: contract } = await supabase
        .from('contracts')
        .update({ status: 'terminated' })
        .eq('id', contractId)
        .eq('owner_id', user.id)
        .select()
        .single()

    if (contract) {
        await createNotification({
            userId: contract.tenant_id,
            title: 'Kontrak Diakhiri ⚠️',
            message: `Kontrak sewa Anda untuk ${contract.room_name} di ${contract.property_name} telah diakhiri lebih awal.`,
            link: '/tenant/contracts'
        })
    }

    revalidatePath('/owner/contracts')
    return { success: true }
}

export async function getActiveBookingsForContract() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { bookings: [] }

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id,
            tenant_id,
            start_date,
            end_date,
            total_price,
            tenant:profiles!tenant_id(full_name),
            rooms(
                name,
                price_monthly,
                properties!inner(name, owner_id)
            )
        `)
        .eq('rooms.properties.owner_id', user.id)
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false })

    return { bookings: bookings || [] }
}
