import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { SK } from '../utils/storage-keys'

export interface Bruker {
  id: number
  navn: string
  rolle: string
  epost?: string
}

interface AuthState {
  token: string | null
  bruker: Bruker | null
}

interface AuthContextValue {
  bruker: Bruker | null
  token: string | null
  erInnlogget: boolean
  loggInn: (token: string, bruker: Bruker) => void
  loggUt: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function tokenErGyldig(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1])) as { exp: number }
    return exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function lesLagretAuth(): AuthState {
  try {
    const token  = localStorage.getItem(SK.token)
    const bruker = localStorage.getItem(SK.bruker)
    if (token && tokenErGyldig(token) && bruker) {
      return { token, bruker: JSON.parse(bruker) as Bruker }
    }
  } catch { /* ignore */ }
  return { token: null, bruker: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(lesLagretAuth)

  const loggInn = useCallback((token: string, bruker: Bruker) => {
    localStorage.setItem(SK.token, token)
    localStorage.setItem(SK.bruker, JSON.stringify(bruker))
    setAuth({ token, bruker })
  }, [])

  const loggUt = useCallback(() => {
    localStorage.removeItem(SK.token)
    localStorage.removeItem(SK.bruker)
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth må brukes innenfor AuthProvider')
  return ctx
}
