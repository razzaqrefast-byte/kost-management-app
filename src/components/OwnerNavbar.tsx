'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { signout } from '@/app/auth/actions'
import { getUnreadCount } from '@/app/actions/messages'

export default function OwnerNavbar() {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchCount = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
        }
        fetchCount()

        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const links = [
        { href: '/owner', label: 'Dashboard' },
        { href: '/owner/properties', label: 'Properti Saya' },
        { href: '/owner/bookings', label: 'Booking Masuk', badge: unreadCount },
        { href: '/owner/payments', label: 'Pembayaran' },
        { href: '/owner/contracts', label: 'Kontrak' },
        { href: '/owner/billing', label: 'Tagihan' },
        { href: '/owner/occupants', label: 'Penghuni' },
        { href: '/owner/maintenance', label: 'Komplain' },
        { href: '/owner/analytics', label: 'Laporan' },
        { href: '/owner/profile', label: 'Profil' },
    ]

    return (
        <Navbar
            brand="KostKu Owner"
            links={links}
            onLogout={() => signout()}
        />
    )
}
