import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditPropertyForm from './EditPropertyForm'

export default async function EditPropertyPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch property and verify ownership
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

    if (error || !property) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Edit Properti: {property.name}
                    </h2>
                </div>
            </div>

            <EditPropertyForm property={property} />
        </div>
    )
}
