'use client'

import Navbar from '@/components/Navbar'
import { signout } from '@/app/auth/actions'

export default function TenantNavbar() {
    const links = [
        { href: '/tenant', label: 'Cari Kost' },
        { href: '/tenant/bookings', label: 'Booking Saya' },
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
