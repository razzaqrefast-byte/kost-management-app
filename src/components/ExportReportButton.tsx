'use client'

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

            // Dynamic import for jsPDF only - no autotable to avoid production bundling issues
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            const formatIDR = (amount: number) => {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(amount)
            }

            const dateStr = new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            // --- Header ---
            doc.setFontSize(22)
            doc.setTextColor(37, 99, 235) // Blue-600
            doc.text('KostKu', 14, 20)

            doc.setFontSize(14)
            doc.setTextColor(31, 41, 55) // Gray-800
            doc.text('Laporan Keuangan', 14, 28)

            doc.setFontSize(9)
            doc.setTextColor(107, 114, 128) // Gray-500
            doc.text(`Dicetak pada: ${dateStr}`, 14, 34)

            doc.setDrawColor(229, 231, 235) // Gray-200
            doc.line(14, 38, 196, 38)

            // --- Summary Section ---
            doc.setFontSize(12)
            doc.setTextColor(31, 41, 55)
            doc.text('Ringkasan Pendapatan', 14, 48)

            // Table Header Background
            doc.setFillColor(249, 250, 251) // Gray-50
            doc.rect(14, 52, 182, 8, 'F')

            doc.setFontSize(10)
            doc.setTextColor(75, 85, 99) // Gray-600
            doc.text('Kategori', 18, 57)
            doc.text('Jumlah', 140, 57)

            // Rows
            let currentY = 66
            const summaryRows = [
                { label: 'Total Pendapatan (Terverifikasi)', value: formatIDR(verifiedRevenue), color: [22, 163, 74] }, // Green
                { label: 'Menunggu Verifikasi', value: formatIDR(pendingRevenue), color: [202, 138, 4] }, // Yellow
                { label: 'Proyeksi Total Pendapatan', value: formatIDR(totalProjected), color: [37, 99, 235] } // Blue
            ]

            summaryRows.forEach((row) => {
                doc.setTextColor(75, 85, 99)
                doc.text(row.label, 18, currentY)
                doc.setTextColor(row.color[0], row.color[1], row.color[2])
                doc.text(row.value, 140, currentY)

                doc.setDrawColor(243, 244, 246)
                doc.line(14, currentY + 3, 196, currentY + 3)
                currentY += 10
            })

            // --- Transactions Section ---
            currentY += 10
            if (currentY > 250) {
                doc.addPage()
                currentY = 20
            }

            doc.setFontSize(12)
            doc.setTextColor(31, 41, 55)
            doc.text('Rincian Transaksi', 14, currentY)
            currentY += 5

            // Table Header
            doc.setFillColor(37, 99, 235) // Blue-600
            doc.rect(14, currentY, 182, 10, 'F')

            doc.setFontSize(9)
            doc.setTextColor(255, 255, 255)
            doc.text('Properti', 18, currentY + 6)
            doc.text('Periode', 80, currentY + 6)
            doc.text('Jumlah', 130, currentY + 6)
            doc.text('Status', 170, currentY + 6)
            currentY += 10

            // Transaction Rows
            doc.setTextColor(55, 65, 81)
            payments.forEach((p, index) => {
                // Page break check
                if (currentY > 275) {
                    doc.addPage()
                    currentY = 20
                    // Redraw header on new page
                    doc.setFillColor(37, 99, 235)
                    doc.rect(14, currentY, 182, 10, 'F')
                    doc.setTextColor(255, 255, 255)
                    doc.text('Properti', 18, currentY + 6)
                    doc.text('Periode', 80, currentY + 6)
                    doc.text('Jumlah', 130, currentY + 6)
                    doc.text('Status', 170, currentY + 6)
                    currentY += 10
                    doc.setTextColor(55, 65, 81)
                }

                // Striped background
                if (index % 2 === 1) {
                    doc.setFillColor(249, 250, 251)
                    doc.rect(14, currentY, 182, 8, 'F')
                }

                doc.text((p.property_name || 'Properti').substring(0, 30), 18, currentY + 5)
                doc.text(`${p.period_month} ${p.period_year}`, 80, currentY + 5)
                doc.text(formatIDR(p.amount), 130, currentY + 5)
                doc.text(p.status === 'verified' ? 'Sukses' : 'Pending', 170, currentY + 5)

                currentY += 8
            })

            // --- Footer ---
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(156, 163, 175)
                doc.text(
                    `Halaman ${i} dari ${pageCount} - KostKu Management App`,
                    105,
                    285,
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
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="h-4 w-4" />
            )}
            {isExporting ? 'Memproses...' : 'Cetak PDF'}
        </button>
    )
}
