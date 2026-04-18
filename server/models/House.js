import mongoose from 'mongoose'

const houseSchema = new mongoose.Schema({
  house_number: { type: String, required: true },
  block:        { type: String, required: true },
  owner_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  owner_name:   { type: String, default: null },
}, { timestamps: true })

export default mongoose.model('House', houseSchema)
