import mongoose from 'mongoose'

const visitSchema = new mongoose.Schema({
  visitor_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  house_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'House',   required: true },
  in_time:     { type: Date, default: Date.now },
  out_time:    { type: Date, default: null },
  shift:       { type: String, enum: ['morning', 'night'], required: true },
  security_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true })

// Helper: populate all refs and return a shape that matches existing frontend
visitSchema.statics.findPopulated = function (query = {}) {
  return this.find(query)
    .populate('visitor_id', 'name phone photo_url purpose is_frequent')
    .populate('house_id', 'house_number block')
    .populate('security_id', 'name')
    .sort({ in_time: -1 })
}

export function shapeVisit(v) {
  return {
    id:          v._id.toString(),
    visitor_id:  v.visitor_id?._id?.toString() ?? v.visitor_id?.toString(),
    house_id:    v.house_id?._id?.toString()   ?? v.house_id?.toString(),
    security_id: v.security_id?._id?.toString() ?? v.security_id?.toString(),
    in_time:     v.in_time,
    out_time:    v.out_time,
    shift:       v.shift,
    status:      v.status,
    // nested visitor details — full object embedded in every visit record
    visitors: v.visitor_id ? {
      id:          v.visitor_id._id.toString(),
      name:        v.visitor_id.name,
      phone:       v.visitor_id.phone,
      photo_url:   v.visitor_id.photo_url,
      purpose:     v.visitor_id.purpose,
      is_frequent: v.visitor_id.is_frequent,
    } : null,
    houses: v.house_id ? {
      id:           v.house_id._id.toString(),
      house_number: v.house_id.house_number,
      block:        v.house_id.block,
    } : null,
    users: v.security_id ? {
      id:   v.security_id._id.toString(),
      name: v.security_id.name,
    } : null,
  }
}

export default mongoose.model('Visit', visitSchema)
