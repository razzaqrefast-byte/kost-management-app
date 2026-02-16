'use client'

import Navbar from '@/components/Navbar'
import { signout } from '@/app/auth/actions'

export default function OwnerNavbar() {
    const links = [
        { href: '/owner', label: 'Dashboard' },
        { href: '/owner/properties', label: 'Properti Saya' },
        { href: '/owner/bookings', label: 'Booking Masuk' },
        { href: '/owner/maintenance', label: 'Komplain' },
    ]

    return (
        <Navbar
            brand="KostKu Owner"
            links={links}
            onLogout={() => signout()}
        />
    )
}
