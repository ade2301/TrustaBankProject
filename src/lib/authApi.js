const API_BASE = '/api/auth'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    error.remainingAttempts = data.remainingAttempts
    error.lockRemainingSeconds = data.lockRemainingSeconds
    throw error
  }

  return data
}

export function registerUser(payload) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyLoginOtp(payload) {
  return request('/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutUser() {
  return request('/logout', {
    method: 'POST',
  })
}

export function fetchCurrentUser() {
  return request('/me')
}
