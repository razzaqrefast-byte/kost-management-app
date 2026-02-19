'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

export default function ReviewForm({ bookingId, propertyId }: { bookingId: string, propertyId: string }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hover, setHover] = useState(0)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (rating === 0) {
            setError('Silakan pilih rating bintang terlebih dahulu')
            return
        }
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('bookingId', bookingId)
        formData.append('propertyId', propertyId)
        formData.append('rating', rating.toString())
        formData.append('comment', comment)

        const result = await submitReview(formData)
        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Success will be handled by revalidatePath and page refresh automatically
            // or we could show a success message if we want to stay on the page.
            window.location.reload()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <svg
                                className={`h-8 w-8 ${star <= (hover || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ulasan</label>
                <textarea
                    id="comment"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
                    placeholder="Ceritakan pengalaman menginap Anda..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
        </form>
    )
}
