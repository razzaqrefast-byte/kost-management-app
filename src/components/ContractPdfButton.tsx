'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

interface Contract {
    id: string
    property_name: string
    room_name: string
    tenant_id: string
    monthly_rent: number
    start_date: string
    end_date: string
    notes?: string
    status: string
}

export default function ContractPdfButton({ contract }: { contract: Contract }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            const { default: jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            const receiptNum = `KTR-${contract.id.split('-')[0].toUpperCase()}`
            const startStr = new Date(contract.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            const endStr = new Date(contract.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            const rentStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(contract.monthly_rent)

            // Header
            doc.setFillColor(30, 64, 175)
            doc.rect(0, 0, 210, 30, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('PERJANJIAN SEWA MENYEWA', 105, 13, { align: 'center' })
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`No: ${receiptNum}`, 105, 23, { align: 'center' })

            // Body
            doc.setTextColor(30, 30, 30)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')

            const lines = [
                '',
                'Perjanjian ini dibuat antara PIHAK PERTAMA (Pemilik Kost) dan PIHAK KEDUA (Penyewa),',
                'yang keduanya sepakat untuk mengadakan perjanjian sewa-menyewa dengan ketentuan:',
                '',
            ]

            let y = 42
            for (const line of lines) {
                doc.text(line, 20, y)
                y += 6
            }

            // Contract details table
            const details = [
                ['Properti', contract.property_name],
                ['Nama Kamar', contract.room_name],
                ['Harga Sewa', `${rentStr} / bulan`],
                ['Tanggal Mulai', startStr],
                ['Tanggal Selesai', endStr],
                ['Status Kontrak', contract.status === 'active' ? 'Aktif' : contract.status],
            ]

            for (const [label, value] of details) {
                doc.setFillColor(248, 250, 252)
                doc.rect(20, y - 5, 170, 9, 'F')
                doc.setDrawColor(229, 231, 235)
                doc.rect(20, y - 5, 170, 9, 'S')

                doc.setFont('helvetica', 'bold')
                doc.setTextColor(55, 65, 81)
                doc.text(label, 25, y + 1)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(17, 24, 39)
                doc.text(String(value), 90, y + 1)
                y += 11
            }

            y += 6

            // Pasal-pasal
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(11)
            doc.setTextColor(30, 64, 175)
            doc.text('PASAL 1 — KEWAJIBAN PENYEWA', 20, y)
            y += 8
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setTextColor(55, 65, 81)
            const kewajiban = [
                '1. Membayar uang sewa tepat waktu setiap bulan.',
                '2. Menjaga kebersihan dan ketertiban kamar serta lingkungan kost.',
                '3. Tidak diperbolehkan memindahtangankan hak sewa kepada pihak lain.',
                '4. Melapor kepada pemilik jika ada kerusakan fasilitas.',
            ]
            for (const k of kewajiban) {
                doc.text(k, 25, y)
                y += 6
            }

            y += 4
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(11)
            doc.setTextColor(30, 64, 175)
            doc.text('PASAL 2 — KEWAJIBAN PEMILIK', 20, y)
            y += 8
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setTextColor(55, 65, 81)
            const kewajibanOwner = [
                '1. Menyediakan kamar dalam kondisi layak dan bersih.',
                '2. Melakukan perbaikan fasilitas yang rusak bukan karena kelalaian penyewa.',
                '3. Memberikan tanda terima atas setiap pembayaran sewa.',
            ]
            for (const k of kewajibanOwner) {
                doc.text(k, 25, y)
                y += 6
            }

            if (contract.notes) {
                y += 4
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(11)
                doc.setTextColor(30, 64, 175)
                doc.text('CATATAN TAMBAHAN', 20, y)
                y += 8
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(10)
                doc.setTextColor(55, 65, 81)
                const noteLines = doc.splitTextToSize(contract.notes, 160)
                doc.text(noteLines, 20, y)
                y += noteLines.length * 6
            }

            // Signature area
            y += 12
            doc.setDrawColor(200, 200, 200)
            doc.line(20, y, 190, y)
            y += 10
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(107, 114, 128)
            doc.text('Pihak Pertama (Pemilik)', 45, y, { align: 'center' })
            doc.text('Pihak Kedua (Penyewa)', 165, y, { align: 'center' })

            y += 25
            doc.line(25, y, 70, y)
            doc.line(130, y, 175, y)

            doc.save(`Kontrak_${receiptNum}.pdf`)
        } catch (err) {
            console.error(err)
            alert('Gagal membuat PDF kontrak. Coba lagi nanti.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
            title="Download Kontrak PDF"
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            PDF
        </button>
    )
}
