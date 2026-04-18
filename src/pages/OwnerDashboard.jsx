import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVisitsForHouse, getFrequentVisitorsForHouse, markVisitorFrequent } from '../api/db'
import Navbar from '../components/Navbar'
import VisitorCard from '../components/VisitorCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import { Users, History, Star } from 'lucide-react'

const tabs = [
  { key: 'inside',   label: 'Currently Inside', icon: Users },
  { key: 'history',  label: 'Visit History',    icon: History },
  { key: 'frequent', label: 'Frequent Visitors', icon: Star },
]

export default function OwnerDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('inside')
  const [visits, setVisits] = useState([])
  const [frequentVisitors, setFrequentVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const houseId = profile?.house_id

  const fetchData = useCallback(async (silent = false) => {
    if (!houseId) return
    if (!silent) setLoading(true)
    try {
      const [visitsData, freqData] = await Promise.all([
        getVisitsForHouse(houseId),
        getFrequentVisitorsForHouse(houseId),
      ])
      setVisits(visitsData || [])
      setFrequentVisitors(freqData || [])
    } catch {
      if (!silent) toast.error('Failed to load visitor data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [houseId])

  useEffect(() => {
    fetchData()
    // Poll every 10 seconds for live updates
    pollRef.current = setInterval(() => fetchData(true), 10000)
    return () => clearInterval(pollRef.current)
  }, [fetchData])

  async function handleMarkFrequent(visitorId) {
    try {
      await markVisitorFrequent(visitorId, true)
      toast.success('Marked as frequent visitor')
      fetchData(true)
    } catch {
      toast.error('Failed to update visitor')
    }
  }

  const activeVisits   = visits.filter(v => v.status === 'active')
  const historyVisits  = visits.filter(v => v.status === 'completed')

  function buildCards(visitList) {
    return visitList.map(v => ({
      visitor: { ...v.visitors, id: v.visitor_id, house_id: v.house_id, houses: { house_number: '', block: '' } },
      visit: v,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome, {profile?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{activeVisits.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Inside Now</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{historyVisits.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Visits</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-500">{frequentVisitors.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Frequent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            )
          })}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {activeTab === 'inside' && (
              <div className="space-y-3">
                {buildCards(activeVisits).length === 0
                  ? <EmptyState icon={Users} text="No visitors inside right now" />
                  : buildCards(activeVisits).map(({ visitor, visit }) => (
                    <VisitorCard key={visit.id} visitor={visitor} visit={visit} showActions onMarkFrequent={handleMarkFrequent} />
                  ))}
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {buildCards(historyVisits).length === 0
                  ? <EmptyState icon={History} text="No visit history yet" />
                  : buildCards(historyVisits).map(({ visitor, visit }) => (
                    <VisitorCard key={visit.id} visitor={visitor} visit={visit} showActions onMarkFrequent={handleMarkFrequent} />
                  ))}
              </div>
            )}
            {activeTab === 'frequent' && (
              <div className="space-y-3">
                {frequentVisitors.length === 0
                  ? <EmptyState icon={Star} text="No frequent visitors yet. Mark visitors from the history tab." />
                  : frequentVisitors.map(v => (
                    <VisitorCard key={v.id} visitor={{ ...v, houses: { house_number: '' } }} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
      <Icon className="w-10 h-10 mb-3" /><p className="text-sm text-center px-4">{text}</p>
    </div>
  )
}
