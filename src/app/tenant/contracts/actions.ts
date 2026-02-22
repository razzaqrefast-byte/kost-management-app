'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTenantContracts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { contracts: [] }

    const today = new Date().toISOString().split('T')[0]

    const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { contracts: [] }
    return { contracts: contracts || [] }
}
