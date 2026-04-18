import api from './config'

export async function signUp(email, password, userData) {
  const { data } = await api.post('/api/auth/register', {
    name: userData.name,
    email,
    password,
    role: userData.role,
    houseId: userData.houseId || null,
  })
  localStorage.setItem('gatepass_token', data.token)
  return data
}

export async function signIn(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  localStorage.setItem('gatepass_token', data.token)
  return data
}

export function signOut() {
  localStorage.removeItem('gatepass_token')
}

export async function getUserProfile() {
  const { data } = await api.get('/api/auth/me')
  return data
}
