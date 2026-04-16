import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/config'
import { getUserProfile } from '../supabase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(authUser) {
    if (!authUser) {
      setProfile(null)
      return
    }
    try {
      const p = await getUserProfile(authUser.id)
      setProfile(p)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = { user, profile, loading, refreshProfile: () => loadProfile(user) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
