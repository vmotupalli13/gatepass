import { Router } from 'express'
import Visit, { shapeVisit } from '../models/Visit.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/visits/checkin  — security
router.post('/checkin', protect, requireRole('security', 'admin'), async (req, res) => {
  try {
    const { visitorId, houseId, shift } = req.body
    const visit = await Visit.create({
      visitor_id: visitorId,
      house_id: houseId,
      shift,
      security_id: req.user._id,
      status: 'active',
    })
    const populated = await Visit.findById(visit._id)
      .populate('visitor_id', 'name phone photo_url purpose is_frequent')
      .populate('house_id', 'house_number block')
      .populate('security_id', 'name')

    const shaped = shapeVisit(populated)

    // Real-time: emit to all security clients and the specific house room
    req.app.get('io').emit('visit:new', shaped)
    req.app.get('io').to(`house:${houseId}`).emit('visit:new', shaped)

    res.status(201).json(shaped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/visits/:id/checkout  — security
router.patch('/:id/checkout', protect, requireRole('security', 'admin'), async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { out_time: new Date(), status: 'completed' },
      { new: true }
    )
      .populate('visitor_id', 'name phone photo_url purpose is_frequent')
      .populate('house_id', 'house_number block')
      .populate('security_id', 'name')

    if (!visit) return res.status(404).json({ error: 'Visit not found' })

    const shaped = shapeVisit(visit)
    req.app.get('io').emit('visit:updated', shaped)
    req.app.get('io').to(`house:${visit.house_id?._id}`).emit('visit:updated', shaped)

    res.json(shaped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visits/active/:visitorId  — get active visit for a visitor
router.get('/active/:visitorId', protect, async (req, res) => {
  try {
    const visit = await Visit.findOne({ visitor_id: req.params.visitorId, status: 'active' })
      .sort({ in_time: -1 })
      .populate('visitor_id', 'name phone photo_url purpose is_frequent')
      .populate('house_id', 'house_number block')
    res.json(visit ? shapeVisit(visit) : null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visits/today  — security dashboard (today's visits)
router.get('/today', protect, requireRole('security', 'admin'), async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end   = new Date(); end.setHours(23, 59, 59, 999)
    const visits = await Visit.findPopulated({ in_time: { $gte: start, $lte: end } })
    res.json(visits.map(shapeVisit))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visits/house/:houseId  — owner dashboard
router.get('/house/:houseId', protect, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const visits = await Visit.findPopulated({ house_id: req.params.houseId })
    res.json(visits.map(shapeVisit))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/visits  — admin: all visits with optional filters
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { from, to, houseId, shift } = req.query
    const query = {}
    if (from || to) query.in_time = {}
    if (from) query.in_time.$gte = new Date(from)
    if (to)   query.in_time.$lte = new Date(to + 'T23:59:59')
    if (houseId) query.house_id = houseId
    if (shift)   query.shift = shift

    const visits = await Visit.findPopulated(query)
    res.json(visits.map(shapeVisit))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
