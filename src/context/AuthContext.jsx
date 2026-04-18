import { createContext, useContext, useEffect, useState } from 'react'
import { getUserProfile } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)   // raw JWT user payload
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile() {
    const token = localStorage.getItem('gatepass_token')
    if (!token) {
      setUser(null); setProfile(null); setLoading(false); return
    }
    try {
      const p = await getUserProfile()
      setUser({ id: p.id, email: p.email })
      setProfile(p)
    } catch {
      // Token invalid / expired
      localStorage.removeItem('gatepass_token')
      setUser(null); setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  const value = { user, profile, loading, refreshProfile: loadProfile }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
