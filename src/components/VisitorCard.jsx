import { User, Phone, Home, Clock, CheckCircle, Star } from 'lucide-react'

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function VisitorCard({ visitor, visit, onMarkFrequent, showActions = false }) {
  const statusColor = visit?.status === 'active'
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        {visitor.photo_url ? (
          <img src={visitor.photo_url} alt={visitor.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-7 h-7 text-blue-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              {visitor.name}
              {visitor.is_frequent && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </h3>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{visitor.phone}</span>
              <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />House {visitor.houses?.house_number}</span>
            </div>
          </div>
          {visit && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor} flex-shrink-0`}>
              {visit.status === 'active' ? 'Inside' : 'Left'}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-1">Purpose: <span className="font-medium">{visitor.purpose}</span></p>

        {visit && (
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />In: {formatTime(visit.in_time)}</span>
            {visit.out_time && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Out: {formatTime(visit.out_time)}</span>}
          </div>
        )}

        {showActions && onMarkFrequent && !visitor.is_frequent && (
          <button
            onClick={() => onMarkFrequent(visitor.id)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Star className="w-3.5 h-3.5" />
            Mark as Frequent Visitor
          </button>
        )}
      </div>
    </div>
  )
}
