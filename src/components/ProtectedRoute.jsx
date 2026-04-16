import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  if (!user || !profile) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const redirectMap = { admin: '/admin', owner: '/owner', security: '/security' }
    return <Navigate to={redirectMap[profile.role] || '/login'} replace />
  }

  return children
}
