import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/api/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false) // empêche les appels simultanés

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setRole(null)
      setLoading(false)
      return
    }

    // Évite les appels simultanés
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error('Erreur chargement profil:', error)
        setLoading(false)
        loadingRef.current = false
        return
      }

      if (data) {
        setProfile(data)
        setRole(data.role)
      } else {
        // Profil absent — crée-le
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          role: 'patient',
        }
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()
        setProfile(created)
        setRole(created?.role || 'patient')
      }
    } catch (err) {
      console.error('Erreur loadProfile:', err)
    }

    setLoading(false)
    loadingRef.current = false
  }, [])

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })

    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore les events INITIAL_SESSION — déjà géré au-dessus
      if (event === 'INITIAL_SESSION') return

      const u = session?.user ?? null
      setUser(u)

      // Reset le verrou pour les vrais changements d'auth
      loadingRef.current = false
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRole(null)
    loadingRef.current = false
  }

  const refreshProfile = useCallback(async () => {
    if (user) {
      loadingRef.current = false
      await loadProfile(user)
    }
  }, [user, loadProfile])

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
