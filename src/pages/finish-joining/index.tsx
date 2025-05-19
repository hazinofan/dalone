// pages/finish-joining.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function FinishSignup() {
  const router = useRouter()
  const { token: queryToken } = router.query as { token?: string }
  const [token, setToken] = useState<string | null>(null)
  const [chosenRole, setChosenRole] = useState<'client' | 'professional'>()

  // 1) Au montage, on essaie query→localStorage
  useEffect(() => {
    if (queryToken) {
      setToken(queryToken)
    } else {
      const stored = localStorage.getItem('dalone:token')
      if (stored) setToken(stored)
    }
  }, [queryToken])

  // 2) Une fois qu'on a token + chosenRole, on patch & redirect
  useEffect(() => {
    if (!token || !chosenRole) return
    const doPatch = async () => {
      if (chosenRole === 'professional') {
        await fetch('http://localhost:3001/users/me/role', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: 'professional' }),
        })
      }
      router.replace(chosenRole === 'professional' ? '/dashboard/pro' : '/dashboard')
    }
    doPatch()
  }, [token, chosenRole, router])

  if (!token) {
    return <div style={{ textAlign: 'center', padding: 40 }}>
      <h2>Token manquant…</h2>
    </div>
  }

  // Si on n'a pas encore choisi, on affiche deux cartes
  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2>Token manquant…</h2>
      </div>
    )
  }
  if (!chosenRole) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <h1 className="text-2xl mb-6">Presque fini ! Quel type de compte ?</h1>
        <div className="flex gap-6 justify-center">
          <div
            className="border rounded-lg p-8 cursor-pointer hover:shadow-lg"
            onClick={() => setChosenRole('client')}
            style={{ flex: 1 }}
          >
            <h2 className="text-xl mb-4">Devenir Client</h2>
            <p>Accès aux services, réservations instantanées, notes et avis.</p>
          </div>
          <div
            className="border rounded-lg p-8 cursor-pointer hover:shadow-lg"
            onClick={() => setChosenRole('professional')}
            style={{ flex: 1 }}
          >
            <h2 className="text-xl mb-4">Devenir Professionnel</h2>
            <p>Gérez vos prestations, portfolio, réservations et paiements.</p>
          </div>
        </div>
      </div>
    )
  }
  // Pas de UI supplémentaire après choix : on attend la redirection
  return null
}
