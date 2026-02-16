import OwnerNavbar from '@/components/OwnerNavbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'owner') {
        redirect('/') // Or some unauthorized page
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <OwnerNavbar />

            <div className="py-6 sm:py-10">
                <header className="mb-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                            Dashboard Pemilik
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </div>
    )
}
