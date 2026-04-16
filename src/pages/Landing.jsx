import { useNavigate } from 'react-router-dom'
import { Shield, UserCheck, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  useEffect(() => {
    if (profile) {
      const map = { admin: '/admin', owner: '/owner', security: '/security' }
      if (map[profile.role]) navigate(map[profile.role], { replace: true })
    }
  }, [profile, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">GatePass</h1>
        <p className="text-blue-300 text-lg max-w-md mx-auto">Smart visitor management for gated communities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() => navigate('/role-select')}
          className="flex-1 group bg-white hover:bg-blue-50 border-2 border-white/20 rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 rounded-xl p-3 group-hover:bg-blue-200 transition-colors">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-1">Register / Login</h2>
          <p className="text-gray-500 text-sm">Admin, Owner, or Security</p>
        </button>

        <button
          onClick={() => navigate('/visitor-form')}
          className="flex-1 group bg-blue-600 hover:bg-blue-500 border-2 border-blue-500/50 rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
        >
          <div className="flex justify-center mb-3">
            <div className="bg-blue-500/30 rounded-xl p-3 group-hover:bg-blue-400/30 transition-colors">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-white text-lg mb-1">I'm a Visitor</h2>
          <p className="text-blue-200 text-sm">No login required</p>
        </button>
      </div>

      <p className="mt-8 text-blue-400/60 text-xs">Secure · Fast · Reliable</p>
    </div>
  )
}
