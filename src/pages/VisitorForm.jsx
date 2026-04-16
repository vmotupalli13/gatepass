import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVisitor } from '../supabase/db'
import { getHouses } from '../supabase/db'
import { ChevronLeft, Upload, X } from 'lucide-react'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'

export default function VisitorForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [houses, setHouses] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', houseId: '', photoFile: null })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getHouses().then(setHouses).catch(() => toast.error('Could not load houses'))
  }, [])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!/^[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Valid phone number required (10-15 digits)'
    if (!form.purpose.trim()) e.purpose = 'Purpose of visit is required'
    if (!form.houseId) e.houseId = 'Select the house you are visiting'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const visitor = await createVisitor(form)
      toast.success('Visitor registered! Your QR code is ready.')
      navigate('/visitor-qr', { state: { visitorId: visitor.id, visitorName: visitor.name } })
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return }
    setForm(f => ({ ...f, photoFile: file }))
    setPhotoPreview(URL.createObjectURL(file))
  }

  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: '' })) }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Visitor Entry</h1>
          <p className="text-gray-500 text-sm mb-6">Fill in your details to get a QR entry pass</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your full name"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="10-digit mobile number"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit *</label>
              <input
                type="text"
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                placeholder="e.g. Meeting family, Delivery, Maintenance"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.purpose ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House to Visit *</label>
              <select
                value={form.houseId}
                onChange={e => set('houseId', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.houseId ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Select a house...</option>
                {houses.map(h => (
                  <option key={h.id} value={h.id}>Block {h.block} — House {h.house_number}</option>
                ))}
              </select>
              {errors.houseId && <p className="text-red-500 text-xs mt-1">{errors.houseId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo <span className="text-gray-400 font-normal">(optional)</span></label>
              {photoPreview ? (
                <div className="relative w-24 h-24">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photoFile: null })) }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload a photo (max 5MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Generating QR pass...' : 'Get My QR Pass'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
