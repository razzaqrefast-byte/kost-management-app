import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OwnerDashboard() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch statistics
    // Total Kost (properties owned by this user)
    const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

    // Kamar Kosong (rooms in properties owned by this user that are 'available')
    // First get all property IDs for this owner
    const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)

    const propertyIds = properties?.map(p => p.id) || []

    let roomCount = 0
    if (propertyIds.length > 0) {
        const { count } = await supabase
            .from('rooms')
            .select('*', { count: 'exact', head: true })
            .in('property_id', propertyIds)
            .eq('is_occupied', false)
        roomCount = count || 0
    }

    // Permintaan Booking (pending bookings for rooms belonging to owner properties)
    let bookingCount = 0
    if (propertyIds.length > 0) {
        // Fetch room IDs first for these properties
        const { data: roomIdsData } = await supabase
            .from('rooms')
            .select('id')
            .in('property_id', propertyIds)

        const roomIds = roomIdsData?.map(r => r.id) || []

        if (roomIds.length > 0) {
            const { count } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .in('room_id', roomIds)
                .eq('status', 'pending')
            bookingCount = count || 0
        }
    }

    return (
        <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Kost */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Icon Building */}
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Kost</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">{propertyCount || 0} Unit</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700">
                        <div className="text-sm">
                            <Link href="/owner/properties" className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400">
                                Lihat semua
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Card 2: Kamar Kosong */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Icon Key */}
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11 11.536 11l-3-3 3-3 3-3m0 6a1 1 0 001-1v-3a1 1 0 00-1-1H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Kamar Kosong</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">{roomCount} Kamar</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Booking Pending */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Icon Inbox */}
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Permintaan Booking</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">{bookingCount}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700">
                        <div className="text-sm">
                            <Link href="/owner/bookings" className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400">
                                Kelola booking
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {propertyCount === 0
                                    ? "Selamat datang! Anda belum menambahkan properti kost. Mulai sewakan kost Anda sekarang."
                                    : `Anda memiliki ${propertyCount} properti terdaftar. Kelola properti Anda untuk mendapatkan tenant baru.`
                                }
                            </p>
                            <p className="mt-3 text-sm md:ml-6 md:mt-0">
                                <Link href="/owner/properties/new" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600 dark:text-blue-400">
                                    Tambah Kost Baru <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
