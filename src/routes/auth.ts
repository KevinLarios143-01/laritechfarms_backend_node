import { Router } from 'express'
import { login, getMe, changePassword } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación y gestión de usuarios
 */

// Rutas públicas
router.post('/login', login)

// Rutas protegidas
router.get('/me', authenticateToken, getMe)
router.put('/change-password', authenticateToken, changePassword)

export default router
