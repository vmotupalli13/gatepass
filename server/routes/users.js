import { Router } from 'express'
import User from '../models/User.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

function shapeUser(u) {
  return {
    id:         u._id.toString(),
    name:       u.name,
    email:      u.email,
    role:       u.role,
    house_id:   u.house_id?._id?.toString() ?? u.house_id?.toString() ?? null,
    created_at: u.createdAt,
    houses: u.house_id?._id ? {
      id:           u.house_id._id.toString(),
      house_number: u.house_id.house_number,
      block:        u.house_id.block,
    } : null,
  }
}

// GET /api/users  — admin: all users
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().populate('house_id', 'house_number block').sort({ createdAt: -1 })
    res.json(users.map(shapeUser))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/owners  — admin: all owners
router.get('/owners', protect, requireRole('admin'), async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' }).populate('house_id', 'house_number block')
    res.json(owners.map(shapeUser))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/users/:id/role  — admin
router.patch('/:id/role', protect, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
