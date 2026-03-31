import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGO_URI and JWT_SECRET must be defined in environment variables')
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

app.disable('x-powered-by')
app.use(helmet())

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use('/api/auth', authLimiter, authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use((error, req, res, next) => {
  void req
  void next
  const message = error?.message || 'Unexpected server error'
  res.status(500).json({ message })
})

async function startServer() {
  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => {
    console.log(`Auth server running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start auth server:', error)
  process.exit(1)
})
