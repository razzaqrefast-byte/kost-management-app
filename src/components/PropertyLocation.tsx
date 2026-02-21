'use client'

import dynamic from 'next/dynamic'

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center text-gray-400 text-sm">Memuat peta...</div>
})

interface PropertyLocationProps {
    property: {
        id: string
        name: string
        latitude: number | null
        longitude: number | null
    }
}

export default function PropertyLocation({ property }: PropertyLocationProps) {
    if (!property.latitude || !property.longitude) return null

    return (
        <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Lokasi</h3>
            <div className="h-64 rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                <MapWrapper properties={[property as any]} />
            </div>
        </div>
    )
}
