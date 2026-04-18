import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn } from '../api/auth'
import { ChevronLeft, Eye, EyeOff, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (profile) {
      const map = { admin: '/admin', owner: '/owner', security: '/security' }
      navigate(map[profile.role] || '/', { replace: true })
    }
  }, [profile, navigate])

  function validate() {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await signIn(form.email, form.password)
      await refreshProfile()
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: '' })) }
  const roleLabel = params.get('role')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/role-select')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-2xl p-3">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Sign in</h1>
          {roleLabel && (
            <p className="text-center text-sm text-gray-500 mb-6">
              Signing in as <span className="font-medium capitalize text-blue-600">{roleLabel}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Your password"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            New here?{' '}
            <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline font-medium">Create account</button>
          </p>
        </div>
      </div>
    </div>
  )
}
