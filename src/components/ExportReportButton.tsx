'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PaymentItem {
    id: string
    amount: number
    status: string
    period_month: string
    period_year: string
    property_name: string
}

interface ExportReportButtonProps {
    verifiedRevenue: number
    pendingRevenue: number
    totalProjected: number
    payments: PaymentItem[]
}

export default function ExportReportButton({
    verifiedRevenue,
    pendingRevenue,
    totalProjected,
    payments
}: ExportReportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const doc = new jsPDF()
            const dateStr = new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            // Title and Header
            doc.setFontSize(20)
            doc.setTextColor(37, 99, 235) // Blue color
            doc.text('KostKu - Laporan Keuangan', 14, 22)

            doc.setFontSize(10)
            doc.setTextColor(107, 114, 128)
            doc.text(`Dicetak pada: ${dateStr}`, 14, 30)

            // Summary Section
            doc.setFontSize(14)
            doc.setTextColor(31, 41, 55)
            doc.text('Ringkasan Keuangan', 14, 45)

            const formatIDR = (amount: number) => {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(amount)
            }

            const summaryData = [
                ['Total Pendapatan (Terverifikasi)', formatIDR(verifiedRevenue)],
                ['Menunggu Verifikasi', formatIDR(pendingRevenue)],
                ['Proyeksi Total Pendapatan', formatIDR(totalProjected)]
            ]

            autoTable(doc, {
                startY: 50,
                head: [['Kategori', 'Jumlah']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            })

            // Detailed Transactions
            const lastY = (doc as any).lastAutoTable.finalY || 80
            const finalY = lastY + 15
            doc.setFontSize(14)
            doc.setTextColor(31, 41, 55)
            doc.text('Rincian Transaksi', 14, finalY)

            const tableData = payments.map(p => [
                p.property_name,
                `${p.period_month} ${p.period_year}`,
                formatIDR(p.amount),
                p.status === 'verified' ? 'Terverifikasi' : 'Menunggu'
            ])

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Properti', 'Periode', 'Jumlah', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            })

            // Footer
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(156, 163, 175)
                doc.text(
                    `Halaman ${i} dari ${pageCount} - KostKu Management App`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                )
            }

            doc.save(`Laporan_Keuangan_KostKu_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('Export PDF error:', error)
            alert('Terjadi kesalahan saat mengekspor laporan: ' + (error instanceof Error ? error.message : String(error)))
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95"
        >
            <FileDown className="h-4 w-4" />
            Cetak PDF
        </button>
    )
}
