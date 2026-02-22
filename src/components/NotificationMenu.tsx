'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { getNotifications, getUnreadCount, markAsRead } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'

interface Notification {
    id: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export default function NotificationMenu() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchInitial = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
        }
        fetchInitial()

        // Optional: Polling or Supabase Realtime here
        const interval = setInterval(fetchInitial, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    const toggleMenu = async () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            setLoading(true)
            const { data } = await getNotifications(5)
            if (data) setNotifications(data)
            setLoading(false)
        }
    }

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [dropdownRef])

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n))
        }

        setIsOpen(false)
        if (notification.link) {
            router.push(notification.link)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleMenu}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Notifikasi"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi Terbaru</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-8 text-gray-400">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                            {new Date(notification.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                Belum ada notifikasi.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
