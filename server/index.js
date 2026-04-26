import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import houseRoutes from './routes/houses.js'
import visitorRoutes from './routes/visitors.js'
import visitRoutes from './routes/visits.js'
import notificationRoutes from './routes/notifications.js'
import userRoutes from './routes/users.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = http.createServer(app)

// Allow localhost (any port) + deployed frontend URL
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  process.env.FRONTEND_URL,
].filter(Boolean)

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
})

app.set('io', io)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',          authRoutes)
app.use('/api/houses',        houseRoutes)
app.use('/api/visitors',      visitorRoutes)
app.use('/api/visits',        visitRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/users',         userRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Serve React frontend in production
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

io.on('connection', socket => {
  socket.on('join:security', () => socket.join('security'))
  socket.on('join:house',    houseId => socket.join(`house:${houseId}`))
  socket.on('join:owner',    ownerId => socket.join(`owner:${ownerId}`))
})

const PORT = process.env.PORT || 5001

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`GatePass server → http://localhost:${PORT}`)
  )
})
