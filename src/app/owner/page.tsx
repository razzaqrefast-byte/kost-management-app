export default function OwnerDashboard() {
    return (
        <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Properti */}
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
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">0 Unit</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700">
                        <div className="text-sm">
                            <a href="/owner/properties" className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400">
                                Lihat semua
                            </a>
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
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">0 Kamar</div>
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
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">0</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700">
                        <div className="text-sm">
                            <a href="/owner/bookings" className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400">
                                Kelola booking
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700">
                                Selamat datang! Anda belum menambahkan properti kost. Mulai sewakan kost Anda sekarang.
                            </p>
                            <p className="mt-3 text-sm md:ml-6 md:mt-0">
                                <a href="/owner/properties/new" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                                    Tambah Kost Baru <span aria-hidden="true">&rarr;</span>
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
