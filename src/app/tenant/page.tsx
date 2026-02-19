import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TenantDashboard() {
    const supabase = await createClient()

    // Fetch properties (and maybe single representative image later)
    // For now, simple fetch
    const { data: properties } = await supabase
        .from('properties')
        .select('*, rooms(count), reviews(rating)')
        .order('created_at', { ascending: false })

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

            {/* Search Bar Placeholder */}
            <div className="mx-auto max-w-2xl px-4 pb-12">
                <div className="relative">
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Cari lokasi, nama kost, atau fasilitas..."
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                        <button className="inline-flex items-center rounded border border-gray-200 px-2 font-sans text-xs font-medium text-gray-400">
                            Cari
                        </button>
                    </div>
                </div>
            </div>

            {/* Property List */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Rekomendasi Kost</h2>

                {properties && properties.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {properties.map((property) => (
                            <div key={property.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-48">
                                    {property.image_url ? (
                                        <img
                                            src={property.image_url}
                                            alt={property.name}
                                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500">
                                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        <Link href={`/tenant/properties/${property.id}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {property.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {property.description}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5">
                                        <div className="flex items-center text-yellow-400">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="ml-1 text-sm font-bold text-gray-900 dark:text-white">
                                                {property.reviews && property.reviews.length > 0
                                                    ? (property.reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0) / property.reviews.length).toFixed(1)
                                                    : 'New'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            ({property.reviews?.length || 0} Ulasan)
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-blue-600 font-medium hover:text-blue-500">Lihat Detail &rarr;</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
                        <p>Belum ada kost yang tersedia saat ini.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
