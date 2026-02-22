'use client'

import { useState } from 'react'
import { Printer, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'

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
            // Dynamically import jspdf-autotable to avoid SSR issues
            await import('jspdf-autotable')
            const doc = new jsPDF()

            // Define variables
            const propertyName = payment.bookings?.rooms?.properties?.name || 'Kost Management'
            const roomName = payment.bookings?.rooms?.name || 'Kamar'
            const amountStr = formatIDR(payment.amount)
            const dateStr = new Date(payment.updated_at || payment.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
            const periodStr = `${new Date(payment.period_year, payment.period_month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
            const receiptNumber = `INV-${payment.id.split('-')[0].toUpperCase()}`

            // Colors
            const primaryColor = [37, 99, 235] // blue-600
            const textColor = [55, 65, 81] // gray-700
            const lightGray = [243, 244, 246] // gray-100

            // Base Layout
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
            doc.rect(0, 0, 210, 30, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont("helvetica", "bold")
            doc.text("KWITANSI PEMBAYARAN", 105, 20, { align: "center" })

            // Company & Receipt Info
            doc.setTextColor(textColor[0], textColor[1], textColor[2])
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text(`Properti: ${propertyName}`, 20, 45)
            doc.text(`Kamar: ${roomName}`, 20, 52)

            doc.setFont("helvetica", "bold")
            doc.text(`No. Kwitansi: ${receiptNumber}`, 140, 45)
            doc.setFont("helvetica", "normal")
            doc.text(`Tanggal: ${dateStr}`, 140, 52)
            doc.text(`Status: LUNAS`, 140, 59)

            // Line Separator
            doc.setDrawColor(200, 200, 200)
            doc.line(20, 65, 190, 65)

            // Billing Details
            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            doc.text("Diterima Dari:", 20, 75)
            doc.setFont("helvetica", "normal")
            doc.text(tenantName, 20, 82)

            // Table for Items
            const tableData = [
                ['Pembayaran Sewa Kost', `Periode ${periodStr}`, amountStr]
            ]

            const autoTable = (doc as any).autoTable
            autoTable({
                startY: 95,
                head: [['Deskripsi', 'Keterangan', 'Total']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: 255 },
                styles: { fontSize: 10, cellPadding: 6 },
                columnStyles: {
                    0: { cellWidth: 70 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 40, halign: 'right' },
                }
            })

            const finalY = (doc as any).lastAutoTable.finalY || 135

            // Total Amount Summary
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
            doc.rect(120, finalY + 5, 70, 15, 'F')
            doc.setFont("helvetica", "bold")
            doc.setFontSize(12)
            doc.text("TOTAL DIBAYAR:", 125, finalY + 15)
            doc.text(amountStr, 185, finalY + 15, { align: 'right' })

            // Footer / Signature area
            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            doc.text("Terima kasih atas pembayaran Anda.", 105, finalY + 40, { align: 'center' })
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text("Kwitansi ini dihasilkan secara otomatis oleh sistem KostKu dan sah sebagai bukti pembayaran.", 105, finalY + 48, { align: 'center' })

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
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
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
