import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function TenantProfilePage() {
    const supabase = await createClient()

    // 1. Get current tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Fetch profile error:', error)
    }

    // 3. Generate signed URL for avatar if it exists and is private
    let signedAvatarUrl = null
    if (profile?.avatar_url) {
        if (profile.avatar_url.startsWith('http')) {
            signedAvatarUrl = profile.avatar_url
        } else {
            const { data } = await supabase.storage
                .from('avatars')
                .createSignedUrl(profile.avatar_url, 3600)
            signedAvatarUrl = data?.signedUrl || null
        }
    }

    const initialProfile = {
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
        email: user.email || '',
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Profil Saya
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Kelola informasi pribadi dan foto profil Anda.</p>
                </div>
            </div>

            <ProfileForm initialProfile={initialProfile} signedAvatarUrl={signedAvatarUrl} />
        </div>
    )
}
