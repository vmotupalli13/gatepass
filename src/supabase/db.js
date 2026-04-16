import { supabase } from './config'
import { v4 as uuidv4 } from 'uuid'

// ── Houses ────────────────────────────────────────────────────────────────────
export async function getHouses() {
  const { data, error } = await supabase.from('houses').select('*').order('house_number')
  if (error) throw error
  return data
}

export async function getHouseById(houseId) {
  const { data, error } = await supabase.from('houses').select('*').eq('id', houseId).single()
  if (error) throw error
  return data
}

// ── Visitors ──────────────────────────────────────────────────────────────────
export async function createVisitor(visitorData) {
  const id = uuidv4()
  const qrToken = uuidv4()

  let photoUrl = null
  if (visitorData.photoFile) {
    const ext = visitorData.photoFile.name.split('.').pop()
    const path = `visitors/${id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('visitor-photos')
      .upload(path, visitorData.photoFile)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('visitor-photos').getPublicUrl(path)
      photoUrl = urlData.publicUrl
    }
  }

  const { data, error } = await supabase.from('visitors').insert({
    id,
    name: visitorData.name,
    phone: visitorData.phone,
    photo_url: photoUrl,
    purpose: visitorData.purpose,
    house_id: visitorData.houseId,
    is_frequent: false,
    qr_token: qrToken,
    created_at: new Date().toISOString(),
  }).select().single()
  if (error) throw error
  return data
}

export async function getVisitorById(visitorId) {
  const { data, error } = await supabase
    .from('visitors')
    .select('*, houses(house_number, block)')
    .eq('id', visitorId)
    .single()
  if (error) throw error
  return data
}

export async function markVisitorFrequent(visitorId, isFrequent) {
  const { error } = await supabase
    .from('visitors')
    .update({ is_frequent: isFrequent })
    .eq('id', visitorId)
  if (error) throw error
}

export async function getFrequentVisitorsForHouse(houseId) {
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .eq('house_id', houseId)
    .eq('is_frequent', true)
  if (error) throw error
  return data
}

// ── Visits ────────────────────────────────────────────────────────────────────
export async function checkIn(visitorId, houseId, shift, securityId) {
  const { data, error } = await supabase.from('visits').insert({
    id: uuidv4(),
    visitor_id: visitorId,
    house_id: houseId,
    in_time: new Date().toISOString(),
    out_time: null,
    shift,
    security_id: securityId,
    status: 'active',
  }).select().single()
  if (error) throw error
  return data
}

export async function checkOut(visitId) {
  const { data, error } = await supabase
    .from('visits')
    .update({ out_time: new Date().toISOString(), status: 'completed' })
    .eq('id', visitId)
    .select().single()
  if (error) throw error
  return data
}

export async function getActiveVisitForVisitor(visitorId) {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('visitor_id', visitorId)
    .eq('status', 'active')
    .order('in_time', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getVisitsForShift(shiftStart, shiftEnd) {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visitors(name, phone, photo_url, purpose), houses(house_number, block), users!visits_security_id_fkey(name)')
    .gte('in_time', shiftStart)
    .lte('in_time', shiftEnd)
    .order('in_time', { ascending: false })
  if (error) throw error
  return data
}

export async function getVisitsForHouse(houseId) {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visitors(name, phone, photo_url, purpose)')
    .eq('house_id', houseId)
    .order('in_time', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllVisitsAdmin({ from, to, houseId, shift } = {}) {
  let query = supabase
    .from('visits')
    .select('*, visitors(name, phone, purpose), houses(house_number, block), users!visits_security_id_fkey(name)')
    .order('in_time', { ascending: false })

  if (from) query = query.gte('in_time', from)
  if (to) query = query.lte('in_time', to)
  if (houseId) query = query.eq('house_id', houseId)
  if (shift) query = query.eq('shift', shift)

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function sendNotification(toOwnerId, fromAdminId, message) {
  const { data, error } = await supabase.from('notifications').insert({
    id: uuidv4(),
    to_owner_id: toOwnerId,
    from_admin_id: fromAdminId,
    message,
    read: false,
    created_at: new Date().toISOString(),
  }).select().single()
  if (error) throw error
  return data
}

export async function getNotificationsForOwner(ownerId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('to_owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)
  if (error) throw error
}

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*, houses(house_number, block)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateUserRole(uid, role) {
  const { error } = await supabase.from('users').update({ role }).eq('id', uid)
  if (error) throw error
}

export async function getAllOwners() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, house_id, houses(house_number, block)')
    .eq('role', 'owner')
  if (error) throw error
  return data
}
