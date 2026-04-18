import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllVisitsAdmin, getAllUsers, getAllOwners, updateUserRole, sendNotification, getHouses } from '../api/db'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import {
  Users, Home, Shield, Bell, Filter, Search, ChevronDown,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react'

const tabs = [
  { key: 'visits', label: 'All Visitors', icon: Users },
  { key: 'houses', label: 'Houses & Owners', icon: Home },
  { key: 'users', label: 'User Management', icon: Shield },
  { key: 'notify', label: 'Contact Owner', icon: Bell },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('visits')
  const [visits, setVisits] = useState([])
  const [users, setUsers] = useState([])
  const [owners, setOwners] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filters, setFilters] = useState({ from: '', to: '', house: '', shift: '' })
  const [search, setSearch] = useState('')

  // Notify form
  const [notifyForm, setNotifyForm] = useState({ ownerId: '', message: '' })
  const [notifySending, setNotifySending] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [v, u, o, h] = await Promise.all([
        getAllVisitsAdmin(),
        getAllUsers(),
        getAllOwners(),
        getHouses(),
      ])
      setVisits(v || [])
      setUsers(u || [])
      setOwners(o || [])
      setHouses(h || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleRoleChange(uid, newRole) {
    try {
      await updateUserRole(uid, newRole)
      toast.success('Role updated successfully')
      fetchAll()
    } catch {
      toast.error('Failed to update role')
    }
  }

  async function handleNotify(e) {
    e.preventDefault()
    if (!notifyForm.ownerId || !notifyForm.message.trim()) {
      toast.error('Select an owner and enter a message')
      return
    }
    setNotifySending(true)
    try {
      await sendNotification(notifyForm.ownerId, notifyForm.message)
      toast.success('Notification sent!')
      setNotifyForm({ ownerId: '', message: '' })
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setNotifySending(false)
    }
  }

  // Filter visits
  const filteredVisits = visits.filter(v => {
    const matchSearch = !search ||
      v.visitors?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.visitors?.phone?.includes(search) ||
      v.houses?.house_number?.includes(search)
    const matchShift = !filters.shift || v.shift === filters.shift
    const matchHouse = !filters.house || v.house_id === filters.house
    const matchFrom = !filters.from || new Date(v.in_time) >= new Date(filters.from)
    const matchTo = !filters.to || new Date(v.in_time) <= new Date(filters.to + 'T23:59:59')
    return matchSearch && matchShift && matchHouse && matchFrom && matchTo
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Full community oversight</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Visits', val: visits.length, color: 'blue', icon: Users },
            { label: 'Active Now', val: visits.filter(v => v.status === 'active').length, color: 'green', icon: CheckCircle },
            { label: 'Houses', val: houses.length, color: 'purple', icon: Home },
            { label: 'Registered Users', val: users.length, color: 'orange', icon: Shield },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <Icon className={`w-4 h-4 ${
                    s.color === 'blue' ? 'text-blue-400' :
                    s.color === 'green' ? 'text-green-400' :
                    s.color === 'purple' ? 'text-purple-400' : 'text-orange-400'
                  }`} />
                </div>
                <p className={`text-2xl font-bold ${
                  s.color === 'blue' ? 'text-blue-600' :
                  s.color === 'green' ? 'text-green-600' :
                  s.color === 'purple' ? 'text-purple-600' : 'text-orange-500'
                }`}>{s.val}</p>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* All Visits Tab */}
            {activeTab === 'visits' && (
              <div>
                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search name, phone, house..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input type="date" value={filters.from} onChange={e => setFilters(f => ({...f, from: e.target.value}))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="date" value={filters.to} onChange={e => setFilters(f => ({...f, to: e.target.value}))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={filters.shift} onChange={e => setFilters(f => ({...f, shift: e.target.value}))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">All Shifts</option>
                      <option value="morning">Morning</option>
                      <option value="night">Night</option>
                    </select>
                    <select value={filters.house} onChange={e => setFilters(f => ({...f, house: e.target.value}))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">All Houses</option>
                      {houses.map(h => <option key={h.id} value={h.id}>B{h.block}-{h.house_number}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {filteredVisits.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-gray-400">
                      <AlertCircle className="w-10 h-10 mb-2" />
                      <p className="text-sm">No visits match your filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {['Visitor', 'Phone', 'House', 'Purpose', 'In Time', 'Out Time', 'Shift', 'Security', 'Status'].map(h => (
                              <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredVisits.map(v => (
                            <tr key={v.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{v.visitors?.name || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{v.visitors?.phone || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{v.houses ? `B${v.houses.block}-${v.houses.house_number}` : '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{v.visitors?.purpose || '—'}</td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {new Date(v.in_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {v.out_time ? new Date(v.out_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.shift === 'morning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {v.shift}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{v.users?.name || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${v.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                  {v.status === 'active' ? 'Inside' : 'Left'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Houses Tab */}
            {activeTab === 'houses' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {houses.map(h => {
                  const owner = owners.find(o => o.house_id === h.id)
                  return (
                    <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 rounded-lg p-2.5">
                          <Home className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">House {h.house_number}</p>
                          <p className="text-xs text-gray-500">Block {h.block}</p>
                        </div>
                      </div>
                      {owner ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium text-gray-800">{owner.name}</p>
                          <p className="text-gray-500">{owner.email}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No owner registered</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Name', 'Email', 'Role', 'House', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {u.houses ? `B${u.houses.block}-${u.houses.house_number}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(u.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            {u.id !== profile?.id && (
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="admin">admin</option>
                                <option value="owner">owner</option>
                                <option value="security">security</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notify Tab */}
            {activeTab === 'notify' && (
              <div className="max-w-lg">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-1">Send Notification to Owner</h2>
                  <p className="text-sm text-gray-500 mb-5">Message will appear on the owner's dashboard</p>

                  <form onSubmit={handleNotify} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Owner</label>
                      <select
                        value={notifyForm.ownerId}
                        onChange={e => setNotifyForm(f => ({...f, ownerId: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose an owner...</option>
                        {owners.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.name} — {o.houses ? `B${o.houses.block}-${o.houses.house_number}` : 'No house'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        rows={4}
                        value={notifyForm.message}
                        onChange={e => setNotifyForm(f => ({...f, message: e.target.value}))}
                        placeholder="Type your message to the owner..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={notifySending}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
                    >
                      {notifySending ? <LoadingSpinner size="sm" /> : <Bell className="w-4 h-4" />}
                      {notifySending ? 'Sending...' : 'Send Notification'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
