import { supabase } from './config'

export async function signUp(email, password, userData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  if (authError) throw authError

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    name: userData.name,
    email,
    role: userData.role,
    house_id: userData.houseId || null,
    created_at: new Date().toISOString(),
  })
  if (profileError) throw profileError

  return authData
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(uid) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single()
  if (error) throw error
  return data
}
