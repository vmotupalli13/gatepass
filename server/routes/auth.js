import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import House from '../models/House.js'
import { protect } from '../middleware/auth.js'

const router = Router()

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function safeUser(user) {
  return {
    id:       user._id.toString(),
    name:     user.name,
    email:    user.email,
    role:     user.role,
    house_id: user.house_id?.toString() ?? null,
    created_at: user.createdAt,
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, houseId } = req.body
  try {
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'All fields are required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password, role, house_id: houseId || null })

    // Link house to owner
    if (role === 'owner' && houseId) {
      await House.findByIdAndUpdate(houseId, { owner_id: user._id, owner_name: name })
    }

    const token = signToken(user._id)
    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user._id)
    res.json({ token, user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(safeUser(req.user))
})

export default router
