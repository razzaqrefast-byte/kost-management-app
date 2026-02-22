'use client'

import { useState } from 'react'
import { Printer, Loader2 } from 'lucide-react'

interface DownloadInvoiceButtonProps {
    payment: any
    tenantName?: string
}

export default function DownloadInvoiceButton({ payment, tenantName = 'Penghuni' }: DownloadInvoiceButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            // Dynamically import jsPDF only on click (client-side)
            const { default: jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            // ── Variables ──────────────────────────────────────────────
            const propertyName = payment.bookings?.rooms?.properties?.name || 'Kost Management'
            const roomName = payment.bookings?.rooms?.name || 'Kamar'
            const amount = Number(payment.amount)
            const amountStr = formatIDR(amount)
            const dateStr = new Date(payment.updated_at || payment.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
            const periodStr = new Date(payment.period_year, payment.period_month - 1)
                .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            const receiptNumber = `INV-${payment.id.split('-')[0].toUpperCase()}`

            // ── Header bar ─────────────────────────────────────────────
            doc.setFillColor(37, 99, 235)
            doc.rect(0, 0, 210, 35, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.text('KWITANSI PEMBAYARAN', 105, 15, { align: 'center' })

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('KostKu – Smart Kost Management', 105, 24, { align: 'center' })

            // ── Company & Receipt info ─────────────────────────────────
            doc.setTextColor(55, 65, 81)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Properti : ${propertyName}`, 20, 50)
            doc.text(`Kamar    : ${roomName}`, 20, 57)

            doc.setFont('helvetica', 'bold')
            doc.text(`No. Kwitansi : ${receiptNumber}`, 130, 50)
            doc.setFont('helvetica', 'normal')
            doc.text(`Tanggal      : ${dateStr}`, 130, 57)

            // Status badge (green)
            doc.setFillColor(220, 252, 231)
            doc.roundedRect(130, 61, 34, 8, 2, 2, 'F')
            doc.setTextColor(22, 101, 52)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.text('✓ LUNAS', 147, 67, { align: 'center' })

            // ── Divider ────────────────────────────────────────────────
            doc.setDrawColor(200, 200, 200)
            doc.line(20, 75, 190, 75)

            // ── Diterima dari ─────────────────────────────────────────
            doc.setTextColor(55, 65, 81)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Diterima Dari:', 20, 85)
            doc.setFont('helvetica', 'normal')
            doc.text(tenantName, 20, 92)

            // ── Table header ───────────────────────────────────────────
            const tableTop = 102
            doc.setFillColor(37, 99, 235)
            doc.rect(20, tableTop, 170, 9, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.text('Deskripsi', 25, tableTop + 6)
            doc.text('Keterangan', 100, tableTop + 6)
            doc.text('Jumlah', 185, tableTop + 6, { align: 'right' })

            // ── Table row ──────────────────────────────────────────────
            const rowTop = tableTop + 9
            doc.setFillColor(249, 250, 251)
            doc.rect(20, rowTop, 170, 10, 'F')
            doc.setDrawColor(229, 231, 235)
            doc.rect(20, rowTop, 170, 10, 'S')

            doc.setTextColor(55, 65, 81)
            doc.setFont('helvetica', 'normal')
            doc.text('Pembayaran Sewa Kost', 25, rowTop + 6.5)
            doc.text(`Periode ${periodStr}`, 100, rowTop + 6.5)
            doc.text(amountStr, 185, rowTop + 6.5, { align: 'right' })

            // ── Total box ──────────────────────────────────────────────
            const totalTop = rowTop + 18
            doc.setFillColor(239, 246, 255)
            doc.rect(120, totalTop, 70, 14, 'F')
            doc.setDrawColor(147, 197, 253)
            doc.rect(120, totalTop, 70, 14, 'S')

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(30, 64, 175)
            doc.text('TOTAL DIBAYAR :', 125, totalTop + 9)
            doc.text(amountStr, 185, totalTop + 9, { align: 'right' })

            // ── Footer ─────────────────────────────────────────────────
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(107, 114, 128)
            doc.text('Terima kasih atas kepercayaan Anda.', 105, totalTop + 30, { align: 'center' })
            doc.setFontSize(7.5)
            doc.text(
                'Kwitansi ini diterbitkan secara digital oleh sistem KostKu dan sah sebagai bukti pembayaran resmi.',
                105, totalTop + 37, { align: 'center' }
            )

            // ── Save ───────────────────────────────────────────────────
            doc.save(`Kwitansi_${receiptNumber}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Gagal mendownload kwitansi. Silakan coba lagi nanti.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            title="Download Kwitansi PDF"
        >
            {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <Printer className="w-3.5 h-3.5" />
            )}
            Cetak
        </button>
    )
}
