import User from '../models/User.js'
import { verifyToken } from '../utils/token.js'

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.trusta_token

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const payload = verifyToken(token)
    const user = await User.findById(payload.sub).select('-passwordHash')

    if (!user) {
      return res.status(401).json({ message: 'Invalid session' })
    }

    req.user = user
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }
}
