import jwt from 'jsonwebtoken'

const isProduction = process.env.NODE_ENV === 'production'

export function signToken(userId, options = {}) {
  const { expiresIn, ...payload } = options

  return jwt.sign(
    {
      sub: userId,
      ...payload,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
    },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }
}
