import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditRoomForm from './EditRoomForm'

export default async function EditRoomPage({
    params,
}: {
    params: Promise<{ id: string, roomId: string }>
}) {
    const supabase = await createClient()
    const { id: propertyId, roomId } = await params

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch room and verify property ownership via join
    const { data: room, error } = await supabase
        .from('rooms')
        .select(`
            *,
            properties (
                owner_id
            )
        `)
        .eq('id', roomId)
        .eq('property_id', propertyId)
        .single()

    if (error || !room) {
        notFound()
    }

    // Double check ownership
    if (room.properties.owner_id !== user.id) {
        redirect('/owner')
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Edit Kamar: {room.name}
                    </h2>
                </div>
            </div>

            <EditRoomForm propertyId={propertyId} room={room} />
        </div>
    )
}
