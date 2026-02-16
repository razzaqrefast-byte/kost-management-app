import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewMaintenanceForm from './NewMaintenanceForm'

export default async function NewMaintenancePage() {
    const supabase = await createClient()

    // 1. Get current tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch properties where the user has bookings
    // This allows them to choose which property they want to report an issue for.
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            id,
            room_id,
            rooms (
                id,
                name,
                property_id,
                properties (
                    id,
                    name
                )
            )
        `)
        .eq('tenant_id', user.id)
        .in('status', ['approved', 'active'])

    if (error) {
        console.error('Fetch bookings error:', error)
    }

    // Process data to get unique properties and their rooms
    const propertiesMap = new Map()
    bookings?.forEach((b: any) => {
        const p = b.rooms.properties
        const r = { id: b.rooms.id, name: b.rooms.name }

        if (!propertiesMap.has(p.id)) {
            propertiesMap.set(p.id, { ...p, rooms: [r] })
        } else {
            const existing = propertiesMap.get(p.id)
            if (!existing.rooms.some((room: any) => room.id === r.id)) {
                existing.rooms.push(r)
            }
        }
    })

    const properties = Array.from(propertiesMap.values())

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Laporkan Keluhan
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Ada masalah di kost? Beritahu kami agar segera diperbaiki.</p>
                </div>
            </div>

            <NewMaintenanceForm properties={properties} />
        </div>
    )
}
