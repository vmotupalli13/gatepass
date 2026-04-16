import { useNavigate } from 'react-router-dom'
import { Shield, Home, Eye, ChevronLeft } from 'lucide-react'

const roles = [
  { key: 'admin', label: 'Admin', desc: 'Manage the entire community', icon: Shield, color: 'purple' },
  { key: 'owner', label: 'House Owner', desc: 'Monitor your home visitors', icon: Home, color: 'blue' },
  { key: 'security', label: 'Security Guard', desc: 'Manage entry & exit', icon: Eye, color: 'green' },
]

const colorMap = {
  purple: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-50',
  blue: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-50',
  green: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-50',
}

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Select your role</h1>
        <p className="text-gray-500 text-sm mb-8">Choose the role that matches your account type.</p>

        <div className="space-y-3">
          {roles.map(role => {
            const Icon = role.icon
            return (
              <button
                key={role.key}
                onClick={() => navigate(`/login?role=${role.key}`)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${colorMap[role.color]}`}
              >
                <div className="p-2.5 rounded-lg bg-white/70">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{role.label}</div>
                  <div className="text-sm text-gray-500">{role.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline font-medium">
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}
