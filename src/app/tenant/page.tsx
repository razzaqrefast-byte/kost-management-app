import { createClient } from '@/lib/supabase/server'
import PropertySearch from './PropertySearch'

export default async function TenantDashboard() {
    const supabase = await createClient()

    // Fetch properties with room counts, prices, and review ratings
    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            *,
            rooms (
                count,
                price_monthly
            ),
            reviews (
                rating
            )
        `)
        .order('created_at', { ascending: false })

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
