import { createClient } from '@/lib/supabase/server'
import PropertySearch from './PropertySearch'

export default async function TenantDashboard() {
    const supabase = await createClient()

    // 1. Fetch properties
    const { data: propertiesRaw, error: propError } = await supabase
        .from('properties')
        .select('id, name, address, description, image_url, latitude, longitude')
        .order('created_at', { ascending: false })

    if (propError) {
        console.error('Fetch properties error:', propError)
    }

    // 2. Fetch all rooms for these properties
    const { data: roomsData } = await supabase
        .from('rooms')
        .select('property_id, price_monthly')

    // 3. Fetch all reviews for these properties
    const { data: reviewsData } = await supabase
        .from('reviews')
        .select('property_id, rating')

    // Fetch user wishlists to set initial state
    const { data: { user } } = await supabase.auth.getUser()
    const { data: wishlistData } = user
        ? await supabase.from('wishlists').select('property_id').eq('tenant_id', user.id)
        : { data: [] }
    const savedPropertyIds = new Set(wishlistData?.map(w => w.property_id) || [])

    // 4. Combine data
    const properties = propertiesRaw?.map(prop => ({
        ...prop,
        rooms: roomsData?.filter(r => r.property_id === prop.id) || [],
        reviews: reviewsData?.filter(rv => rv.property_id === prop.id) || [],
        isSaved: savedPropertyIds.has(prop.id)
    })) || []

    const error = propError

    if (error) {
        console.error('Fetch properties error:', error)
    }

    return (
        <div>
            <div className="text-center py-6 sm:py-10">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Cari Kost Impianmu
                </h1>
                <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-500">
                    Temukan kost yang nyaman, aman, dan strategis.
                </p>
            </div>

            {error ? (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg border-2 border-dashed border-red-300 p-12 text-center text-red-500 bg-red-50">
                        <p className="font-bold">Terjadi kesalahan database:</p>
                        <p className="text-sm mb-4">{error.message}</p>
                    </div>
                </div>
            ) : (
                <PropertySearch initialProperties={(properties as any) || []} />
            )}
        </div>
    )
}
