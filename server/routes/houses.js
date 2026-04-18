import { Router } from 'express'
import House from '../models/House.js'

const router = Router()

// GET /api/houses  — public (visitor form needs this without login)
router.get('/', async (req, res) => {
  try {
    const houses = await House.find().sort({ block: 1, house_number: 1 })
    res.json(houses.map(h => ({
      id: h._id.toString(),
      house_number: h.house_number,
      block: h.block,
      owner_id: h.owner_id?.toString() ?? null,
      owner_name: h.owner_name,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/houses/:id
router.get('/:id', async (req, res) => {
  try {
    const h = await House.findById(req.params.id)
    if (!h) return res.status(404).json({ error: 'House not found' })
    res.json({ id: h._id.toString(), house_number: h.house_number, block: h.block })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
