import TenantNavbar from '@/components/TenantNavbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TenantLayout({
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

    if (profile?.role !== 'tenant') {
        redirect('/') // Or some unauthorized page
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <TenantNavbar />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
