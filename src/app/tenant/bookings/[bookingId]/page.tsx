import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ChatBox from '@/components/ChatBox'
import { submitReview } from '@/app/actions/reviews'
import ReviewForm from '@/components/ReviewForm'

export const dynamic = 'force-dynamic'

export default async function TenantBookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
    const supabase = await createClient()
    const { bookingId } = await params

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
                price_monthly,
                properties (
                    id,
                    name,
                    address,
                    owner_id
                )
            )
        `)
        .eq('id', bookingId)
        .eq('tenant_id', user.id)
        .single()

    if (error || !booking) {
        console.error('Fetch tenant booking detail error:', error)
        console.error('Booking ID attempted:', bookingId)
        console.error('User ID:', user.id)
        // Temporary: show error instead of 404 to debug
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-xl font-bold">Booking Tidak Ditemukan (Error {error?.code || '404'})</h1>
                <p className="mt-2">{error?.message || 'Data booking mungkin tidak ada atau Anda tidak memiliki akses.'}</p>
                <Link href="/tenant/bookings" className="mt-4 inline-block text-blue-600 underline">Kembali ke Daftar</Link>
            </div>
        )
    }

    // 4. Fetch owner profile separately to be safe
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', booking.rooms.properties.owner_id)
        .single()

    // 3. Fetch messages
    const { data: messagesData } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles(full_name, avatar_url)
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })

    const initialMessages = messagesData || []

    // 5. Fetch existing review if any
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

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
                                {ownerProfile?.full_name?.charAt(0) || 'O'}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {ownerProfile?.full_name || 'Owner Properti'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    WhatsApp: {ownerProfile?.phone || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    {booking.status === 'completed' && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ulasan Anda</h2>
                            </div>
                            <div className="p-6">
                                {existingReview ? (
                                    <div>
                                        <div className="flex items-center gap-1 mb-2 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`h-5 w-5 ${i < existingReview.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{existingReview.comment}"</p>
                                    </div>
                                ) : (
                                    <ReviewForm bookingId={bookingId} propertyId={booking.rooms.properties.id} />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Column */}
                <div className="lg:col-span-1">
                    <ChatBox
                        bookingId={bookingId}
                        currentUserId={user.id}
                        initialMessages={initialMessages as any}
                    />
                </div>
            </div>
        </div>
    )
}
