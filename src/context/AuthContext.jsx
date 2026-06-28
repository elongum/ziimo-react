import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function tokenErGyldig(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]))
    return exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function lesLagretAuth() {
  try {
    const token  = localStorage.getItem('ziimo-token')
    const bruker = localStorage.getItem('ziimo-bruker')
    if (token && tokenErGyldig(token) && bruker) {
      return { token, bruker: JSON.parse(bruker) }
    }
  } catch { /* ignore */ }
  return { token: null, bruker: null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(lesLagretAuth)

  const loggInn = useCallback((token, bruker) => {
    localStorage.setItem('ziimo-token', token)
    localStorage.setItem('ziimo-bruker', JSON.stringify(bruker))
    setAuth({ token, bruker })
  }, [])

  const loggUt = useCallback(() => {
    localStorage.removeItem('ziimo-token')
    localStorage.removeItem('ziimo-bruker')
    setAuth({ token: null, bruker: null })
  }, [])

  return (
    <AuthContext.Provider value={{
      bruker:      auth.bruker,
      token:       auth.token,
      erInnlogget: Boolean(auth.token && tokenErGyldig(auth.token)),
      loggInn,
      loggUt,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth må brukes innenfor AuthProvider')
  return ctx
}
