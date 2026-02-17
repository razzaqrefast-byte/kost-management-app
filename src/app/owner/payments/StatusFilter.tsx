'use client'

import { useRouter } from 'next/navigation'

export default function StatusFilter({ defaultValue }: { defaultValue: string }) {
    const router = useRouter()

    return (
        <select
            defaultValue={defaultValue}
            onChange={(e) => {
                router.push(`/owner/payments?status=${e.target.value}`)
            }}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
        </select>
    )
}
