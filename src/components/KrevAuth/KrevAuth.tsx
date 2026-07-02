import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface KrevAuthProps {
  children: ReactNode
}

function KrevAuth({ children }: KrevAuthProps) {
  const { erInnlogget } = useAuth()
  if (!erInnlogget) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default KrevAuth
