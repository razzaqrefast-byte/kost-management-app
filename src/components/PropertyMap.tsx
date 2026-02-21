'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface Property {
    id: string
    name: string
    address: string
    latitude: number | null
    longitude: number | null
    image_url: string | null
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
    // Default center to Jakarta if no properties or no valid coordinates
    const defaultCenter: [number, number] = [-6.2088, 106.8456]

    // Filter properties that have valid coordinates
    const validProperties = properties.filter(p => p.latitude !== null && p.longitude !== null && p.latitude !== undefined && p.longitude !== undefined)

    const mapCenter: [number, number] = validProperties.length > 0
        ? [validProperties[0].latitude!, validProperties[0].longitude!]
        : defaultCenter

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validProperties.map((property) => (
                    <Marker key={property.id} position={[property.latitude!, property.longitude!]}>
                        <Popup>
                            <div className="p-1">
                                {property.image_url && (
                                    <img
                                        src={property.image_url}
                                        alt={property.name}
                                        className="w-full h-24 object-cover rounded-md mb-2"
                                    />
                                )}
                                <h3 className="font-bold text-sm text-gray-900">{property.name}</h3>
                                <p className="text-xs text-gray-600 mb-2 truncate">{property.address}</p>
                                <Link
                                    href={`/tenant/properties/${property.id}`}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-500"
                                >
                                    Lihat Detail &rarr;
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
