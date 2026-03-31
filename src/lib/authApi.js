const API_BASE = '/api/auth'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })
  } catch {
    const error = new Error('Unable to reach the server. Ensure the backend is running and try again.')
    error.status = 0
    throw error
  }

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

export function recognizeDevice(deviceId) {
  return request('/recognize-device', {
    method: 'POST',
    body: JSON.stringify({ deviceId }),
  })
}

export function checkPinLoginStatus(email, deviceId) {
  return request('/pin-login-status', {
    method: 'POST',
    body: JSON.stringify({ email, deviceId }),
  })
}

export function verifyPin(email, pin, deviceId) {
  return request('/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ email, pin, deviceId }),
  })
}

export function setupPins(pin, transactionPin) {
  return request('/setup-pins', {
    method: 'POST',
    body: JSON.stringify({ pin, transactionPin }),
  })
}

export function completeOnboarding(personalInfo, contactInfo) {
  return request('/complete-onboarding', {
    method: 'POST',
    body: JSON.stringify({ personalInfo, contactInfo }),
  })
}

export function checkOnboardingStatus() {
  return request('/onboarding-status')
}

export function verifyTransactionPin(pin) {
  return request('/verify-transaction-pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}
