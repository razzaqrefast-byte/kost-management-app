'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Map as MapIcon, List as ListIcon } from 'lucide-react'

// Dynamically import the MapWrapper
const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">Memuat peta...</div>
})

interface Room {
    count: number
    price_monthly: number
}

interface Property {
    id: string
    name: string
    address: string
    description: string | null
    image_url: string | null
    latitude: number | null
    longitude: number | null
    rooms: Room[]
    reviews: { rating: number }[]
}

export default function PropertySearch({ initialProperties }: { initialProperties: Property[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [minPrice, setMinPrice] = useState<number | ''>('')
    const [maxPrice, setMaxPrice] = useState<number | ''>('')
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    const filteredProperties = useMemo(() => {
        return initialProperties.filter((property) => {
            // Search filter
            const matchesSearch =
                property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.address.toLowerCase().includes(searchQuery.toLowerCase())

            if (!matchesSearch) return false

            // Price filter calculation
            const roomPrices = property.rooms.map(r => r.price_monthly)
            const minRoomPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : 0
            const maxRoomPrice = roomPrices.length > 0 ? Math.max(...roomPrices) : 0

            if (minPrice !== '' && maxRoomPrice < minPrice) return false
            if (maxPrice !== '' && minRoomPrice > maxPrice) return false

            return true
        })
    }, [searchQuery, minPrice, maxPrice, initialProperties])

    // Helper to format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    return (
        <div>
            {/* Search & Filter Bar */}
            <div className="mx-auto max-w-4xl px-4 pb-12">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pencarian</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2.5 pl-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Cari nama atau lokasi..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Harga Min</label>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full rounded-lg border-0 py-2.5 pl-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Contoh: 500000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Harga Max</label>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full rounded-lg border-0 py-2.5 pl-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Contoh: 2000000"
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <ListIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Daftar</span>
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'map'
                                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <MapIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Peta</span>
                            </button>
                        </div>
                        {(searchQuery || minPrice || maxPrice) && (
                            <button
                                onClick={() => { setSearchQuery(''); setMinPrice(''); setMaxPrice(''); }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Property Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {searchQuery || minPrice || maxPrice
                            ? `Hasil Pencarian (${filteredProperties.length})`
                            : 'Rekomendasi Kost'}
                    </h2>
                </div>

                {viewMode === 'map' ? (
                    <div className="mb-12">
                        <MapWrapper properties={filteredProperties} />
                    </div>
                ) : (
                    filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                            {filteredProperties.map((property) => {
                                const roomPrices = property.rooms.map(r => r.price_monthly)
                                const minRoomPrice = Math.min(...roomPrices)

                                return (
                                    <div key={property.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-90 lg:h-56">
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
                                                        {formatPrice(minRoomPrice)}
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
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-16 text-center text-gray-400">
                            <svg className="h-16 w-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-lg font-medium">Kost tidak ditemukan</p>
                            <p className="text-sm">Silakan ubah kriteria pencarian Anda.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
