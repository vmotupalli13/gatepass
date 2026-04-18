import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const visitorSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true },
  photo_url:   { type: String, default: null },
  purpose:     { type: String, required: true },
  house_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  is_frequent: { type: Boolean, default: false },
  qr_token:    { type: String, default: uuidv4 },
}, { timestamps: true })

export default mongoose.model('Visitor', visitorSchema)
