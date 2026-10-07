// ShaadiOS API Client - Main Entry Point
// Connects to the backend server at http://localhost:3001

const API_URL = 'http://localhost:3001/api'

// ============================================
// TOKEN MANAGEMENT
// ============================================

export function getToken() {
  return localStorage.getItem('shaadios_token')
}

export function setToken(token) {
  localStorage.setItem('shaadios_token', token)
}

export function removeToken() {
  localStorage.removeItem('shaadios_token')
}

export function getHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// ============================================
// AUTHENTICATION
// ============================================

export async function register(email, password, fullName, phone) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, phone })
  })
  return handleResponse(res)
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return handleResponse(res)
}

export async function logout() {
  removeToken()
  return { success: true }
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function updateProfile(data) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

// ============================================
// WEDDINGS
// ============================================

export async function getWeddings() {
  const res = await fetch(`${API_URL}/weddings`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function getWedding(id) {
  const res = await fetch(`${API_URL}/weddings/${id}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function createWedding(data) {
  const res = await fetch(`${API_URL}/weddings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateWedding(id, data) {
  const res = await fetch(`${API_URL}/weddings/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function deleteWedding(id) {
  const res = await fetch(`${API_URL}/weddings/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function inviteCollaborator(weddingId, email, role) {
  const res = await fetch(`${API_URL}/weddings/${weddingId}/collaborators`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, role })
  })
  return handleResponse(res)
}

export async function exportWedding(id) {
  const res = await fetch(`${API_URL}/weddings/${id}/export`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

// ============================================
// TASKS
// ============================================

export async function getTasksByWedding(weddingId) {
  const res = await fetch(`${API_URL}/tasks/wedding/${weddingId}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function getTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function createTask(weddingId, data) {
  const res = await fetch(`${API_URL}/tasks/wedding/${weddingId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateTask(id, data) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function completeTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: 'POST',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function delegateTask(id, userId) {
  const res = await fetch(`${API_URL}/tasks/${id}/delegate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId })
  })
  return handleResponse(res)
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return handleResponse(res)
}

// ============================================
// VENDORS
// ============================================

export async function getVendorsByWedding(weddingId) {
  const res = await fetch(`${API_URL}/vendors/wedding/${weddingId}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function createVendor(weddingId, data) {
  const res = await fetch(`${API_URL}/vendors/wedding/${weddingId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateVendorStage(id, state) {
  const res = await fetch(`${API_URL}/vendors/${id}/stage`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ state })
  })
  return handleResponse(res)
}

// ============================================
// GUESTS
// ============================================

export async function getGuestsByWedding(weddingId) {
  const res = await fetch(`${API_URL}/guests/wedding/${weddingId}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function createGuest(weddingId, data) {
  const res = await fetch(`${API_URL}/guests/wedding/${weddingId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateGuest(id, data) {
  const res = await fetch(`${API_URL}/guests/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function deleteGuest(id) {
  const res = await fetch(`${API_URL}/guests/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return handleResponse(res)
}

// ============================================
// ROOMS
// ============================================

export async function getRoomsByWedding(weddingId) {
  const res = await fetch(`${API_URL}/rooms/wedding/${weddingId}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function createRoom(weddingId, data) {
  const res = await fetch(`${API_URL}/rooms/wedding/${weddingId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function assignGuestToRoom(roomId, guestId, shouldAssign) {
  const res = await fetch(`${API_URL}/rooms/${roomId}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ guestId, shouldAssign })
  })
  return handleResponse(res)
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getNotifications(weddingId, unreadOnly = true) {
  const params = new URLSearchParams({ unreadOnly })
  const res = await fetch(`${API_URL}/notifications/wedding/${weddingId}?${params}`, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function markNotificationAsRead(id) {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  return handleResponse(res)
}

export async function markAllNotificationsAsRead(weddingId) {
  const res = await fetch(`${API_URL}/notifications/wedding/${weddingId}/read-all`, {
    method: 'POST',
    headers: getHeaders()
  })
  return handleResponse(res)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse(response) {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error')
  }
  
  return data
}

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_URL}/../health`, {
      method: 'GET'
    })
    return await res.json()
  } catch {
    return null
  }
}
