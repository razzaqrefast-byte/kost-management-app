'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/app/tenant/wishlist/actions'
import { useRouter } from 'next/navigation'

export default function WishlistButton({
    propertyId,
    initialIsSaved = false,
    className = ''
}: {
    propertyId: string,
    initialIsSaved?: boolean,
    className?: string
}) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isPending) return

        const previousState = isSaved
        // Optimistic UI update
        setIsSaved(!isSaved)

        startTransition(async () => {
            const result = await toggleWishlist(propertyId)

            if (result?.error) {
                // Revert on error
                setIsSaved(previousState)
            } else if (result?.success) {
                // Refresh to update server components that rely on this state
                router.refresh()
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 rounded-full backdrop-blur-sm transition-all shadow-sm ${isSaved
                    ? 'bg-white/90 text-red-500 hover:bg-white'
                    : 'bg-black/30 text-white hover:bg-black/50'
                } ${className} disabled:opacity-75`}
            aria-label={isSaved ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
            title={isSaved ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
        >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : 'stroke-2'}`} />
        </button>
    )
}
