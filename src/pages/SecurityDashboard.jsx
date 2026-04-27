import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { getVisitorById, checkIn, checkOut, getActiveVisitForVisitor, getTodayVisits } from '../api/db'
import Navbar from '../components/Navbar'
import ShiftFilter from '../components/ShiftFilter'
import QRScanner from '../components/QRScanner'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import { QrCode, LogIn, LogOut, X, User, Phone, Briefcase, Home, Clock, Sun, Moon, AlertCircle } from 'lucide-react'

function detectShift() {
  const h = new Date().getHours()
  return h >= 6 && h < 18 ? 'morning' : 'night'
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      status === 'active'
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-gray-100 text-gray-500 border-gray-200'
    }`}>
      {status === 'active' ? 'Inside' : 'Left'}
    </span>
  )
}

export default function SecurityDashboard() {
  const { profile } = useAuth()
  const [shift, setShift] = useState(detectShift())
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [shiftFilter, setShiftFilter] = useState('all')
  const [scanning, setScanning] = useState(false)
  const [modal, setModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const socketRef = useRef(null)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTodayVisits()
      setVisits(data)
    } catch {
      toast.error('Failed to load visits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisits()

    // Socket.io real-time
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin)
    socketRef.current = socket
    socket.emit('join:security')

    socket.on('visit:new', newVisit => {
      setVisits(prev => [newVisit, ...prev])
    })
    socket.on('visit:updated', updated => {
      setVisits(prev => prev.map(v => v.id === updated.id ? updated : v))
    })

    return () => socket.disconnect()
  }, [fetchVisits])

  async function handleScan(visitorId) {
    setScanning(false)
    try {
      const visitor = await getVisitorById(visitorId.trim())
      const activeVisit = await getActiveVisitForVisitor(visitor.id)
      setModal({ visitor, activeVisit })
    } catch {
      toast.error('QR code not recognized. Visitor not found.')
    }
  }

  async function handleCheckIn() {
    if (!modal?.visitor) return
    setActionLoading(true)
    try {
      await checkIn(modal.visitor.id, modal.visitor.house_id, shift)
      toast.success(`${modal.visitor.name} checked in`)
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!modal?.activeVisit) return
    setActionLoading(true)
    try {
      await checkOut(modal.activeVisit.id)
      toast.success(`${modal.visitor.name} checked out`)
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredVisits = shiftFilter === 'all' ? visits : visits.filter(v => v.shift === shiftFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome, {profile?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              {shift === 'morning' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
              <select value={shift} onChange={e => setShift(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none">
                <option value="morning">Morning Shift</option>
                <option value="night">Night Shift</option>
              </select>
            </div>
            <button onClick={() => setScanning(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Today', val: visits.length, color: 'text-blue-600' },
            { label: 'Currently Inside', val: visits.filter(v => v.status === 'active').length, color: 'text-green-600' },
            { label: 'Completed', val: visits.filter(v => v.status === 'completed').length, color: 'text-gray-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <ShiftFilter active={shiftFilter} onChange={setShiftFilter} />
        </div>

        {/* Visits Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? <LoadingSpinner /> : filteredVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p className="text-sm">No visitors logged for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Visitor', 'House', 'Purpose', 'In Time', 'Out Time', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredVisits.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.visitors?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{v.houses ? `B${v.houses.block}-${v.houses.house_number}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{v.visitors?.purpose || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />
                          {new Date(v.in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {v.out_time ? new Date(v.out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {scanning && <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />}

      {/* Visitor Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Visitor Details</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                {modal.visitor.photo_url ? (
                  <img src={modal.visitor.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-lg">{modal.visitor.name}</p>
                  {modal.activeVisit && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Currently Inside</span>}
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{modal.visitor.phone}</span></div>
                <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{modal.visitor.purpose}</span></div>
                <div className="flex items-center gap-3"><Home className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Block {modal.visitor.houses?.block} — House {modal.visitor.houses?.house_number}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {!modal.activeVisit ? (
                  <button onClick={handleCheckIn} disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {actionLoading ? <LoadingSpinner size="sm" /> : <LogIn className="w-4 h-4" />} Check In
                  </button>
                ) : (
                  <button onClick={handleCheckOut} disabled={actionLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {actionLoading ? <LoadingSpinner size="sm" /> : <LogOut className="w-4 h-4" />} Check Out
                  </button>
                )}
                <button onClick={() => setModal(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
