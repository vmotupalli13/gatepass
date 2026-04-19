import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import Visitor from '../models/Visitor.js'
import { protect } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })
const router = Router()

function shapeVisitor(v) {
  return {
    id:          v._id.toString(),
    name:        v.name,
    phone:       v.phone,
    photo_url:   v.photo_url,
    purpose:     v.purpose,
    house_id:    v.house_id?._id?.toString() ?? v.house_id?.toString(),
    is_frequent: v.is_frequent,
    qr_token:    v.qr_token,
    created_at:  v.createdAt,
    houses: v.house_id?._id ? {
      id:           v.house_id._id.toString(),
      house_number: v.house_id.house_number,
      block:        v.house_id.block,
    } : null,
  }
}

// POST /api/visitors  — public (no login required)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone, purpose, houseId } = req.body
    if (!name || !phone || !purpose || !houseId)
      return res.status(400).json({ error: 'All fields required' })

    let photo_url = null
    if (req.file) {
      photo_url = `${process.env.SERVER_URL || 'http://localhost:5001'}/uploads/${req.file.filename}`
    }

    const visitor = await Visitor.create({ name, phone, purpose, house_id: houseId, photo_url })
    const populated = await visitor.populate('house_id', 'house_number block')
    res.status(201).json(shapeVisitor(populated))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visitors/:id  — public (security scans QR)
router.get('/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('house_id', 'house_number block')
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' })
    res.json(shapeVisitor(visitor))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visitors/house/:houseId/frequent  — owner/admin
router.get('/house/:houseId/frequent', protect, async (req, res) => {
  try {
    const visitors = await Visitor.find({ house_id: req.params.houseId, is_frequent: true })
      .populate('house_id', 'house_number block')
    res.json(visitors.map(shapeVisitor))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/visitors/:id/frequent  — owner/admin
router.patch('/:id/frequent', protect, async (req, res) => {
  try {
    await Visitor.findByIdAndUpdate(req.params.id, { is_frequent: req.body.is_frequent })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
