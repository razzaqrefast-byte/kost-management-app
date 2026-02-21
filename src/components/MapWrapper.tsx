'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component with SSR disabled
// Leaflet requires the 'window' object which is only available in the browser
const PropertyMap = dynamic(() => import('./PropertyMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">
            Memuat peta...
        </div>
    )
})

export default PropertyMap
