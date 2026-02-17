import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ChatBox from '@/components/ChatBox'

export const dynamic = 'force-dynamic'

export default async function TenantBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch booking details
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            *,
            rooms (
                name,
                price_per_month,
                properties (
                    id,
                    name,
                    address,
                    owner_id,
                    profiles:owner_id (
                        full_name,
                        phone,
                        avatar_url
                    )
                )
            )
        `)
        .eq('id', id)
        .eq('tenant_id', user.id)
        .single()

    if (error || !booking) {
        console.error('Fetch booking detail error:', error)
        return notFound()
    }

    // 3. Fetch messages
    const { data: messagesData } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles(full_name, avatar_url)
        `)
        .eq('booking_id', id)
        .order('created_at', { ascending: true })

    const initialMessages = messagesData || []

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link href="/tenant/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Daftar Booking
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detail Booking</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                                <p className="text-sm font-medium">
                                    {booking.status === 'pending' ? 'Menunggu Persetujuan' :
                                        booking.status === 'approved' ? 'Disetujui' :
                                            booking.status === 'active' ? 'Aktif' :
                                                booking.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Properti & Kamar</h3>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {booking.rooms.properties.name} - {booking.rooms.name}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Periode</h3>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Harga</h3>
                                <p className="text-sm font-bold text-blue-600">
                                    Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Pemilik</h2>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                                {booking.rooms.properties.profiles.full_name?.charAt(0) || 'O'}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">{booking.rooms.properties.profiles.full_name}</p>
                                <p className="text-sm text-gray-500">WhatsApp: {booking.rooms.properties.profiles.phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Column */}
                <div className="lg:col-span-1">
                    <ChatBox
                        bookingId={id}
                        currentUserId={user.id}
                        initialMessages={initialMessages as any}
                    />
                </div>
            </div>
        </div>
    )
}
