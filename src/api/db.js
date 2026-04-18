import api from './config'

// ── Houses ────────────────────────────────────────────────────────────────────
export async function getHouses() {
  const { data } = await api.get('/api/houses')
  return data
}

export async function getHouseById(id) {
  const { data } = await api.get(`/api/houses/${id}`)
  return data
}

// ── Visitors ──────────────────────────────────────────────────────────────────
export async function createVisitor(visitorData) {
  const form = new FormData()
  form.append('name', visitorData.name)
  form.append('phone', visitorData.phone)
  form.append('purpose', visitorData.purpose)
  form.append('houseId', visitorData.houseId)
  if (visitorData.photoFile) form.append('photo', visitorData.photoFile)

  const { data } = await api.post('/api/visitors', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getVisitorById(id) {
  const { data } = await api.get(`/api/visitors/${id}`)
  return data
}

export async function markVisitorFrequent(id, isFrequent) {
  await api.patch(`/api/visitors/${id}/frequent`, { is_frequent: isFrequent })
}

export async function getFrequentVisitorsForHouse(houseId) {
  const { data } = await api.get(`/api/visitors/house/${houseId}/frequent`)
  return data
}

// ── Visits ────────────────────────────────────────────────────────────────────
export async function checkIn(visitorId, houseId, shift) {
  const { data } = await api.post('/api/visits/checkin', { visitorId, houseId, shift })
  return data
}

export async function checkOut(visitId) {
  const { data } = await api.patch(`/api/visits/${visitId}/checkout`)
  return data
}

export async function getActiveVisitForVisitor(visitorId) {
  const { data } = await api.get(`/api/visits/active/${visitorId}`)
  return data
}

export async function getTodayVisits() {
  const { data } = await api.get('/api/visits/today')
  return data
}

export async function getVisitsForHouse(houseId) {
  const { data } = await api.get(`/api/visits/house/${houseId}`)
  return data
}

export async function getAllVisitsAdmin({ from, to, houseId, shift } = {}) {
  const params = {}
  if (from) params.from = from
  if (to)   params.to = to
  if (houseId) params.houseId = houseId
  if (shift)   params.shift = shift
  const { data } = await api.get('/api/visits', { params })
  return data
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function sendNotification(toOwnerId, message) {
  const { data } = await api.post('/api/notifications', { toOwnerId, message })
  return data
}

export async function getNotificationsForOwner() {
  const { data } = await api.get('/api/notifications/mine')
  return data
}

export async function markNotificationRead(id) {
  await api.patch(`/api/notifications/${id}/read`)
}

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const { data } = await api.get('/api/users')
  return data
}

export async function updateUserRole(uid, role) {
  await api.patch(`/api/users/${uid}/role`, { role })
}

export async function getAllOwners() {
  const { data } = await api.get('/api/users/owners')
  return data
}
