import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import routes from './routes'
import swaggerSetup from './config/swagger'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // límite de requests
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware de seguridad
app.use(helmet())

// CORS configurado
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200,http://localhost:3000').split(',')
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
}))

// Middleware general
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(limiter)
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LariTechFarms API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT
  })
})

// Configurar Swagger
swaggerSetup(app)

// Rutas de la API
app.use('/api/v1', routes)

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler)

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 LariTechFarms API running on port ${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app