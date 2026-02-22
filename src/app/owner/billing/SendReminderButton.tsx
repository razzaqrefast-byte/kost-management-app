'use client'

import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { createNotification } from '@/app/actions/notifications'

interface TenantEntry {
    id: string
    tenant_id: string
    tenant_name: string
    room_name: string
    property_name: string
    monthly_rent: number
}

interface Props {
    tenants: TenantEntry[]
    single?: boolean
}

export default function SendReminderButton({ tenants, single = false }: Props) {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSend = async () => {
        setLoading(true)
        try {
            await Promise.all(tenants.map(t =>
                createNotification({
                    userId: t.tenant_id,
                    title: 'Pengingat Tagihan Sewa 🔔',
                    message: `Halo! Pembayaran sewa untuk ${t.room_name} di ${t.property_name} bulan ini belum kami terima. Mohon segera lakukan pembayaran.`,
                    link: '/tenant/payments'
                })
            ))
            setSent(true)
            setTimeout(() => setSent(false), 3000)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md">
                ✅ Terkirim
            </span>
        )
    }

    return (
        <button
            onClick={handleSend}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${single
                    ? 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100'
                    : 'text-white bg-orange-500 hover:bg-orange-600'
                }`}
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            {single ? 'Kirim Pengingat' : `Kirim ke Semua (${tenants.length})`}
        </button>
    )
}
