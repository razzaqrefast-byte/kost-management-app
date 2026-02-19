'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { signout } from '@/app/auth/actions'
import { getUnreadCount } from '@/app/actions/messages'

export default function TenantNavbar() {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchCount = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
        }
        fetchCount()

        // Refresh count every 30 seconds
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const links = [
        { href: '/tenant', label: 'Cari Kost' },
        { href: '/tenant/bookings', label: 'Booking Saya', badge: unreadCount },
        { href: '/tenant/payments', label: 'Pembayaran' },
        { href: '/tenant/maintenance', label: 'Keluhan' },
        { href: '/tenant/profile', label: 'Profil' },
    ]

    return (
        <Navbar
            brand="KostKu"
            links={links}
            onLogout={() => signout()}
        />
    )
}
