import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../supabase/auth'
import { Shield, LogOut, Home } from 'lucide-react'
import NotificationBadge from './NotificationBadge'
import { toast } from 'react-toastify'

const roleColors = {
  admin: 'bg-purple-600',
  owner: 'bg-blue-600',
  security: 'bg-green-600',
}

const roleLabels = {
  admin: 'Admin',
  owner: 'Owner',
  security: 'Security',
}

export default function Navbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  if (!profile) return null

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <Link to="/" className="font-bold text-gray-900 text-lg">GatePass</Link>
          </div>

          <div className="flex items-center gap-3">
            {profile.role === 'owner' && <NotificationBadge />}

            <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${roleColors[profile.role]}`}>
              {roleLabels[profile.role]}
            </span>

            <span className="hidden sm:block text-sm text-gray-700 font-medium">{profile.name}</span>

            <Link to="/" className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Home className="w-5 h-5" />
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
