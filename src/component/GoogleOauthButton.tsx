import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

declare global {
    interface Window { google: any }
}

export function GoogleButton() {
    const router = useRouter()
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!window.google || !container.current) return

        // 1) Initialize the library with your client ID
        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (resp: { credential: string }) => {
                console.log('[GSI] callback data:', resp)
                const idToken = resp.credential
                try {
                    const r = await fetch('http://localhost:3001/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    })
                    console.log('[back] status:', r.status)
                    const data = await r.json()
                    console.log('[back] json:', data)

                    if (!r.ok) {
                        throw new Error(data.message || 'Error from back')
                    }

                    // stocke le JWT
                    localStorage.setItem('dalone:token', data.access_token)

                    // enfin : navigation
                    console.log('-> router.push("/finish-joining?token=", data.access_token)')
                    router.push({
                        pathname: '/finish-joining',
                        query: { token: data.access_token },
                    })

                } catch (err) {
                    console.error('Google login failed:', err)
                }
            },
        })


        // 4) Render the official “Sign in with Google” button
        window.google.accounts.id.renderButton(
            container.current,
            { theme: 'outline', size: 'large', width: '100%' }
        )
    }, [])

    return <div ref={container} style={{ width: '100%', marginTop: 16 }} />
}
