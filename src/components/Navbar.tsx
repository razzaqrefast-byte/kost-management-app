'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

interface NavLink {
    href: string
    label: string
    badge?: number
}

export default function Navbar({
    brand,
    links,
    onLogout
}: {
    brand: string,
    links: NavLink[],
    onLogout: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href={links[0]?.href || '#'} className="font-bold text-xl text-blue-600">
                                {brand}
                            </Link>
                        </div>
                        {/* Desktop Links */}
                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 relative ${pathname === link.href
                                        ? 'border-blue-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                    {link.badge && link.badge > 0 && (
                                        <span className="absolute top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Logout & Mobile Menu Toggle */}
                    <div className="flex items-center">
                        <div className="hidden sm:flex items-center gap-x-4">
                            <ThemeToggle />
                            <button
                                onClick={onLogout}
                                className="rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                            >
                                Keluar
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state. */}
            <div className={`sm:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-1 pb-3 pt-2 px-4 shadow-inner bg-gray-50 dark:bg-gray-900">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between rounded-md px-3 py-2 text-base font-medium ${pathname === link.href
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>{link.label}</span>
                            {link.badge && link.badge > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {link.badge > 99 ? '99+' : link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false)
                            onLogout()
                        }}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </nav>
    )
}
