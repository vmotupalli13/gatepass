import { Router } from 'express'
import Notification from '../models/Notification.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/notifications  — admin only
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { toOwnerId, message } = req.body
    const notif = await Notification.create({
      to_owner_id: toOwnerId,
      from_admin_id: req.user._id,
      message,
    })
    // Real-time: push to owner's socket room
    req.app.get('io').to(`owner:${toOwnerId}`).emit('notification:new', {
      id: notif._id.toString(),
      message: notif.message,
      read: notif.read,
      created_at: notif.createdAt,
    })
    res.status(201).json({ id: notif._id.toString(), ...notif.toObject() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/notifications/mine  — owner: get own notifications
router.get('/mine', protect, requireRole('owner'), async (req, res) => {
  try {
    const notifs = await Notification.find({ to_owner_id: req.user._id }).sort({ createdAt: -1 })
    res.json(notifs.map(n => ({
      id: n._id.toString(),
      to_owner_id: n.to_owner_id.toString(),
      message: n.message,
      read: n.read,
      created_at: n.createdAt,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/notifications/:id/read  — owner
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
