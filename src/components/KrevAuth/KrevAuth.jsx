import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function KrevAuth({ children }) {
  const { erInnlogget } = useAuth()
  if (!erInnlogget) return <Navigate to="/login" replace />
  return children
}

export default KrevAuth
