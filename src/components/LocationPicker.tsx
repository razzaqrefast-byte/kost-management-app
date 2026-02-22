'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationPickerProps {
    initialLat?: number | null
    initialLng?: number | null
    onLocationSelect: (lat: number, lng: number) => void
}

function MapEvents({ onLocationSelect, setPosition }: {
    onLocationSelect: (lat: number, lng: number) => void,
    setPosition: (pos: [number, number]) => void
}) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPosition([lat, lng])
            onLocationSelect(lat, lng)
        },
    })
    return null
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    const defaultCenter: [number, number] = [-6.2088, 106.8456] // Jakarta
    const [position, setPosition] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
    )

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng])
        }
    }, [initialLat, initialLng])

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mt-2">
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
                <MapEvents onLocationSelect={onLocationSelect} setPosition={setPosition} />
            </MapContainer>
            <p className="text-xs text-gray-500 mt-1 italic">
                Klik pada peta untuk menentukan lokasi tepat properti Anda.
            </p>
        </div>
    )
}
