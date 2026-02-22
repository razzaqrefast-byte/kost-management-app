import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import WishlistButton from '@/components/WishlistButton'

export default async function WishlistPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Fetch user's wishlisted property IDs
    const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('property_id')
        .eq('tenant_id', user.id)

    const propertyIds = wishlistData?.map(w => w.property_id) || []

    let properties: any[] = []

    if (propertyIds.length > 0) {
        // 2. Fetch properties
        const { data: propertiesRaw } = await supabase
            .from('properties')
            .select('id, name, address, description, image_url')
            .in('id', propertyIds)

        // 3. Fetch rooms for prices
        const { data: roomsData } = await supabase
            .from('rooms')
            .select('property_id, price_monthly')
            .in('property_id', propertyIds)

        // 4. Fetch reviews for ratings
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select('property_id, rating')
            .in('property_id', propertyIds)

        // Combine
        properties = propertiesRaw?.map(prop => ({
            ...prop,
            rooms: roomsData?.filter(r => r.property_id === prop.id) || [],
            reviews: reviewsData?.filter(rv => rv.property_id === prop.id) || [],
            isSaved: true
        })) || []
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Kost Tersimpan
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Daftar properti kost yang telah Anda simpan ke wishlist.
                    </p>
                </div>
            </div>

            {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {properties.map((property) => {
                        const roomPrices = property.rooms.map((r: any) => r.price_monthly)
                        const minRoomPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : 0

                        return (
                            <div key={property.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-90 lg:h-56 relative">
                                    {property.image_url ? (
                                        <img
                                            src={property.image_url}
                                            alt={property.name}
                                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <svg className="h-16 w-16 opacity-50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-gray-900/90 px-2.5 py-0.5 text-xs font-bold text-gray-900 dark:text-white shadow-sm backdrop-blur-sm">
                                            {property.rooms.length} Tipe Kamar
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3 z-10">
                                        <WishlistButton propertyId={property.id} initialIsSaved={property.isSaved} />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                            <Link href={`/tenant/properties/${property.id}`}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {property.name}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center text-yellow-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="ml-1 text-sm font-bold text-gray-900 dark:text-white">
                                                {property.reviews && property.reviews.length > 0
                                                    ? (property.reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0) / property.reviews.length).toFixed(1)
                                                    : '4.5'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">{property.address}</p>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold mb-0.5">Mulai dari</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {minRoomPrice > 0 ? formatPrice(minRoomPrice) : 'Harga tidak tersedia'}
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ bulan</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Belum ada properti tersimpan</h3>
                    <p className="mt-1 text-sm text-gray-500">Mulai menjelajah dan simpan kost impian Anda di sini.</p>
                    <div className="mt-6">
                        <Link
                            href="/tenant"
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Cari Kost
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
