import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/client'
import { fetchMe } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Comprobamos si hay sesión activa al cargar la aplicación
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchMe()
          .then(profile => {
            setUser(profile)
            setIsLoading(false)
          })
          .catch(() => {
            setIsLoading(false)
          })
      } else {
        setIsLoading(false)
      }
    })

    // Escuchamos cambios en la sesión (cierre de sesión, refresco de token...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isAuthenticated: user !== null, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
