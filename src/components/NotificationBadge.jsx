import { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { getNotificationsForOwner, markNotificationRead } from '../api/db'

export default function NotificationBadge() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!profile?.id) return

    // Initial fetch
    getNotificationsForOwner().then(setNotifications).catch(() => {})

    // Socket.io for real-time new notifications
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
    socketRef.current = socket
    socket.emit('join:owner', profile.id)
    socket.on('notification:new', notif => {
      setNotifications(prev => [notif, ...prev])
    })

    return () => socket.disconnect()
  }, [profile?.id])

  const unread = notifications.filter(n => !n.read).length

  async function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      await Promise.all(unreadIds.map(markNotificationRead))
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">Notifications</div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
