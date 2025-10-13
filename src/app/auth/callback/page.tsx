'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('🔹 Starting email verification callback...')

                const hash = window.location.hash.substring(1)
                const params = new URLSearchParams(hash)
                const access_token = params.get('access_token')
                const refresh_token = params.get('refresh_token')

                if (!access_token || !refresh_token) {
                    console.error('❌ No access or refresh token found in URL hash')
                    setStatus('error')
                    return
                }

                const { error: setSessionError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token
                })

                if (setSessionError) {
                    console.error('❌ Error setting session:', setSessionError.message)
                    setStatus('error')
                    return
                }

                const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !sessionData?.session) {
                    console.error('❌ No session found after setSession', sessionError)
                    setStatus('error')
                    router.push('/signin')
                    return
                }

                const user = sessionData.session.user

                if (!user) {
                    console.error('❌ No user in session')
                    setStatus('error')
                    router.push('/signin')
                    return
                }

                console.log('🔹 Supabase user:', user)

                const registerPayload = {
                    first_name: user.user_metadata?.first_name || '',
                    email: user.email,
                    supabase_id: user.id
                }

                console.log('✅ Backend registration success — redirecting...')
                setStatus('success')

                setTimeout(() => router.push('/crm-dashboard'))
            } catch (err) {
                console.error('❌ Exception during callback:', err)
                setStatus('error')
            }
        }

        handleCallback()
    }, [router, API_BASE_URL])

    return (
        <div className="flex items-center justify-center h-screen text-white">
            {status === 'loading' && (
                <div className="text-center">
                    <Loader2 className="animate-spin w-8 h-8 mx-auto mb-3 text-primary" />
                    <h2 className="text-2xl font-semibold mb-2">Verifying your account...</h2>
                    <p className="text-gray-400">Please wait a moment while we confirm your email.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center text-green-400">
                    <h2 className="text-2xl font-semibold mb-2">✅ Email verified!</h2>
                    <p>You’re being redirected to your dashboard...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center text-red-400">
                    <h2 className="text-2xl font-semibold mb-2">❌ Verification failed</h2>
                    <p>Something went wrong. Please try signing in again.</p>
                </div>
            )}
        </div>
    )
}
