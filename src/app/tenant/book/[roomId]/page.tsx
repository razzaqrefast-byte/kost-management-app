import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookingForm from './booking-form'

export default async function BookingPage({
    params,
}: {
    params: Promise<{ roomId: string }>
}) {
    const supabase = await createClient()
    const { roomId } = await params

    // Fetch room details including property name
    const { data: room, error } = await supabase
        .from('rooms')
        .select(`
            *,
            properties (
                name,
                address
            )
        `)
        .eq('id', roomId)
        .single()

    if (error || !room) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link
                    href={`/tenant/properties/${room.property_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                    &larr; Kembali ke detail kost
                </Link>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Konfirmasi Sewa</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{room.properties.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{room.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Harga per Bulan</p>
                            <p className="text-lg font-bold text-blue-600">Rp {Number(room.price_monthly).toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <BookingForm roomId={roomId} priceMonthly={Number(room.price_monthly)} />
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    Dengan menekan tombol "Konfirmasi Booking", Anda menyetujui syarat & ketentuan sewa di KostKu.
                </p>
            </div>
        </div>
    )
}
