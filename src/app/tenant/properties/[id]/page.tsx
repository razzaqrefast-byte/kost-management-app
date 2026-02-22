import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyAddressButton from '@/components/CopyAddressButton'
import PropertyLocation from '@/components/PropertyLocation'
import WishlistButton from '@/components/WishlistButton'
import { getWishlistStatus } from '@/app/tenant/wishlist/actions'

export default async function TenantPropertyDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Property Details with Reviews
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            latitude,
            longitude,
            reviews (
                rating,
                comment,
                created_at,
                tenant:profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
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

    // 3. Fetch Wishlist Status
    const isSaved = await getWishlistStatus(id)

    const reviews = property.reviews || []
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : null

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Link
                href="/tenant"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-6 inline-block"
            >
                &larr; Kembali ke daftar
            </Link>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                {/* Image Gallery Placeholder */}
                <div className="relative aspect-h-3 aspect-w-4 rounded-lg bg-gray-100 overflow-hidden">
                    <div className="absolute top-4 right-4 z-10">
                        <WishlistButton propertyId={id} initialIsSaved={isSaved} />
                    </div>
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
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{property.name}</h1>
                        {averageRating && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                <svg className="h-4 w-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-bold text-yellow-700">{averageRating}</span>
                                <span className="text-xs text-yellow-600">({reviews.length})</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="sr-only">Alamat</h2>
                            <p className="text-xl text-gray-700 dark:text-gray-300">{property.address}</p>
                        </div>
                        <CopyAddressButton address={property.address} />
                    </div>

                    <PropertyLocation property={property as any} />

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

            {/* Reviews Section */}
            <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Ulasan dari Penghuni</h2>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.map((review: any, index: number) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{review.comment}"</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                        {review.tenant?.full_name?.charAt(0) || 'T'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {review.tenant?.full_name || 'Anonim'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 italic">Belum ada ulasan untuk properti ini.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
