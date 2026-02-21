'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyAddressButton({ address }: { address: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-md transition-all active:scale-95"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    Tersalin!
                </>
            ) : (
                <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Alamat
                </>
            )}
        </button>
    )
}
