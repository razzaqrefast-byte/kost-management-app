'use client'

export default function PaymentFilter({ currentFilter }: { currentFilter: string }) {
    return (
        <select
            defaultValue={currentFilter}
            onChange={(e) => {
                window.location.href = `/owner/payments?status=${e.target.value}`
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
