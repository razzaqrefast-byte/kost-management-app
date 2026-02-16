import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PropertyDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const supabase = await createClient()
    const paramsAwaited = await params
    const { id } = paramsAwaited

    // 1. Fetch Property Details
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !property) {
        notFound()
    }

    // 2. Fetch Rooms for this property
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', id)
        .order('name', { ascending: true })

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        {property.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {property.address}
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/owner/properties"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                    >
                        Kembali
                    </Link>
                    <Link
                        href={`/owner/properties/${id}/edit`}
                        className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                    >
                        Edit Properti
                    </Link>
                    <Link
                        href={`/owner/properties/${id}/rooms/new`}
                        className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Tambah Kamar
                    </Link>
                </div>
            </div>

            {/* Property Image & Description */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                {property.image_url && (
                    <div className="aspect-h-9 aspect-w-16 w-full overflow-hidden">
                        <img
                            src={property.image_url}
                            alt={property.name}
                            className="h-64 w-full object-cover"
                        />
                    </div>
                )}
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Detail Properti</h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{property.description || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Rooms List */}
            <div className="mt-10">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4">Daftar Kamar</h3>

                {rooms && rooms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {rooms.map((room) => (
                            <div key={room.id} className="relative flex rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                                {room.images?.[0] ? (
                                    <div className="h-full w-24 flex-none overflow-hidden">
                                        <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-full w-24 flex-none flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 px-4 py-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{room.name}</p>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${room.is_occupied ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                                            {room.is_occupied ? 'Terisi' : 'Kosong'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                                        Rp {Number(room.price_monthly).toLocaleString('id-ID')}
                                    </p>
                                    <div className="flex justify-end pt-1">
                                        <Link
                                            href={`/owner/properties/${id}/rooms/${room.id}/edit`}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            Edit Kamar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Belum ada kamar</h3>
                        <p className="mt-1 text-sm text-gray-500">Mulai tambahkan kamar untuk kost ini.</p>
                        <div className="mt-6">
                            <Link
                                href={`/owner/properties/${id}/rooms/new`}
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Tambah Kamar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
