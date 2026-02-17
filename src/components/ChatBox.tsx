'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage, getMessages } from '@/app/actions/messages'

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
    sender: {
        full_name: string | null
        avatar_url: string | null
    }
}

export default function ChatBox({
    bookingId,
    currentUserId,
    initialMessages = []
}: {
    bookingId: string,
    currentUserId: string,
    initialMessages?: Message[]
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Poll for new messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            const result = await getMessages(bookingId)
            if (result.messages) {
                setMessages(result.messages)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [bookingId])

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim() || loading) return

        setLoading(true)
        const result = await sendMessage(bookingId, content)
        if (result.success) {
            setContent('')
            // Refresh local state immediately
            const fetchResult = await getMessages(bookingId)
            if (fetchResult.messages) {
                setMessages(fetchResult.messages)
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pesan & Koordinasi</h3>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 italic text-sm">
                        Belum ada pesan. Silakan mulai percakapan.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.sender_id === currentUserId
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                }`}>
                                <div className="flex justify-between items-baseline gap-4 mb-1">
                                    <span className="text-[10px] font-bold uppercase opacity-75">
                                        {msg.sender_id === currentUserId ? 'Saya' : (msg.sender?.full_name || 'User')}
                                    </span>
                                    <span className="text-[9px] opacity-60">
                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    )
}
