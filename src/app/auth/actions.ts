'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return { error: error.message }
        }

        if (!user) {
            return { error: 'Login failed' }
        }

        // Fetch user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'tenant' // Default fallback

        revalidatePath('/', 'layout')

        if (role === 'owner') {
            redirect('/owner')
        } else {
            redirect('/tenant')
        }
    } catch (error: any) {
        // If it's a redirect error from Next.js, we MUST rethrow it
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Login error:', error)
        return { error: error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.' }
    }
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as string
        const phone = formData.get('phone') as string

        // 1. Sign up the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            return { error: authError.message }
        }

        if (!authData.user) {
            return { error: 'User creation failed' }
        }

        // 2. Create the profile record in public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                role: role,
                phone: phone,
                avatar_url: '',
            })

        if (profileError) {
            return { error: 'Failed to create user profile: ' + profileError.message }
        }

        revalidatePath('/', 'layout')

        if (role === 'owner') {
            redirect('/owner')
        } else {
            redirect('/tenant')
        }
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Signup error:', error)
        return { error: error.message || 'Terjadi kesalahan sistem pendaftaran.' }
    }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
