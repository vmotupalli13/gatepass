// Run once: node server/seeds/houses.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import House from '../models/House.js'

dotenv.config()

const HOUSES = [
  { block: 'A', house_number: '101' }, { block: 'A', house_number: '102' },
  { block: 'A', house_number: '103' }, { block: 'B', house_number: '201' },
  { block: 'B', house_number: '202' }, { block: 'B', house_number: '203' },
  { block: 'C', house_number: '301' }, { block: 'C', house_number: '302' },
  { block: 'C', house_number: '303' }, { block: 'D', house_number: '401' },
  { block: 'D', house_number: '402' }, { block: 'D', house_number: '403' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  const existing = await House.countDocuments()
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} houses already exist.`)
  } else {
    await House.insertMany(HOUSES)
    console.log(`Seeded ${HOUSES.length} houses.`)
  }
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
