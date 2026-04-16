import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getVisitorById } from '../supabase/db'
import QRCodeDisplay from '../components/QRCodeDisplay'
import { CheckCircle, Home, Phone, Briefcase, QrCode } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function VisitorQR() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(true)

  const visitorId = state?.visitorId

  useEffect(() => {
    if (!visitorId) { navigate('/visitor-form'); return }
    getVisitorById(visitorId)
      .then(setVisitor)
      .catch(() => navigate('/visitor-form'))
      .finally(() => setLoading(false))
  }, [visitorId, navigate])

  if (loading) return <LoadingSpinner fullScreen />

  if (!visitor) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <CheckCircle className="w-4 h-4" />
            Entry Pass Ready
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your QR Code</h1>
          <p className="text-gray-500 text-sm mt-1">Show this to the security guard at the gate</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-3">
            <QRCodeDisplay value={visitor.id} size={220} />
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <QrCode className="w-3.5 h-3.5" />
              ID: {visitor.id.slice(0, 8)}...
            </div>
          </div>

          <div className="w-full border-t border-gray-100 pt-4 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">{visitor.name[0]}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Visitor</p>
                <p className="font-semibold text-gray-900 text-sm">{visitor.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-semibold text-gray-900 text-sm">{visitor.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Purpose</p>
                <p className="font-semibold text-gray-900 text-sm">{visitor.purpose}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Visiting</p>
                <p className="font-semibold text-gray-900 text-sm">
                  Block {visitor.houses?.block} — House {visitor.houses?.house_number}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 px-4">
          This QR code is linked to your visit record. The security guard will scan it to check you in.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-sm text-blue-600 hover:underline font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
