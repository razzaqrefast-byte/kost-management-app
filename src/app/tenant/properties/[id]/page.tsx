import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TenantPropertyDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Property Details
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !property) {
        notFound()
    }

    // 2. Fetch Available Rooms for this property
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', id)
        .eq('is_occupied', false)
        .order('name', { ascending: true })

    return (
        <div className="max-w-7xl mx-auto py-8">
            <Link
                href="/tenant"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-6 inline-block"
            >
                &larr; Kembali ke daftar
            </Link>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                {/* Image Gallery Placeholder */}
                <div className="aspect-h-3 aspect-w-4 rounded-lg bg-gray-100 overflow-hidden">
                    {property.image_url ? (
                        <img
                            src={property.image_url}
                            alt={property.name}
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Property info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{property.name}</h1>

                    <div className="mt-3">
                        <h2 className="sr-only">Alamat</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300">{property.address}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Deskripsi</h3>
                        <div className="mt-4 prose prose-sm text-gray-500 dark:text-gray-400">
                            {property.description || 'Tidak ada deskripsi.'}
                        </div>
                    </div>

                    <section aria-labelledby="rooms-heading" className="mt-10">
                        <h2 id="rooms-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pilih Kamar</h2>

                        {rooms && rooms.length > 0 ? (
                            <div className="space-y-4">
                                {rooms.map((room) => (
                                    <div key={room.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex gap-x-4 bg-white dark:bg-gray-800">
                                        {room.images?.[0] ? (
                                            <div className="h-24 w-32 flex-none overflow-hidden rounded-md bg-gray-100">
                                                <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-24 w-32 flex-none flex items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{room.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Fasilitas: {room.facilities || '-'}</p>
                                            <p className="text-blue-600 font-bold mt-1">Rp {Number(room.price_monthly).toLocaleString('id-ID')} / bulan</p>
                                        </div>
                                        <div className="flex-none self-center">
                                            <Link
                                                href={`/tenant/book/${room.id}`}
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                            >
                                                Sewa
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Maaf, saat ini tidak ada kamar tersedia di kost ini.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
