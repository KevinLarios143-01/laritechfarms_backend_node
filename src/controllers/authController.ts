import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../services/database'
import { AuthenticatedRequest } from '../types'
import { createSuccessResponse, createErrorResponse, validateRequired } from '../utils/helpers'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id_usuario:
 *               type: integer
 *             nombre:
 *               type: string
 *             email:
 *               type: string
 *             rol:
 *               type: string
 *             tenant:
 *               type: object
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    const missing = validateRequired({ email, password })
    if (missing.length > 0) {
      res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
      return
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
        activo: true
      },
      include: {
        tenant: true
      }
    })

    if (!usuario) {
      res.status(401).json(
        createErrorResponse('Credenciales inválidas', 401)
      )
      return
    }

    // Verificar contraseña - con debug
    console.log('🔍 Debug Login:')
    console.log('Email:', email)
    console.log('Password recibido:', password)
    console.log('Hash en BD:', usuario.password_hash)
    
    const isValidPassword = await bcrypt.compare(password, usuario.password_hash)
    console.log('Resultado comparación:', isValidPassword)
    
    // Generar hash de prueba para debug
    const testHash = await bcrypt.hash(password, 10)
    console.log('Hash generado para test:', testHash)
    
    if (!isValidPassword) {
      console.log('❌ Password no hace match')
      res.status(401).json(
        createErrorResponse('Credenciales inválidas', 401)
      )
      return
    }
    
    console.log('✅ Password correcto, continuando con login')

    // Verificar que el tenant esté activo
    if (!usuario.tenant.activo) {
      res.status(403).json(
        createErrorResponse('Cuenta suspendida', 403)
      )
      return
    }

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      res.status(500).json(createErrorResponse('Error de configuración del servidor'))
      return
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_tenant: usuario.id_tenant,
        email: usuario.email,
        rol: usuario.rol
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Actualizar último login
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_login: new Date() }
    })

    res.json(createSuccessResponse({
      token,
      user: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        tenant: {
          id_tenant: usuario.tenant.id_tenant,
          nombre: usuario.tenant.nombre
        }
      }
    }, 'Login exitoso'))

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         description: No autorizado
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id_usuario },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        ultimo_login: true,
        fecha_creacion: true,
        tenant: {
          select: {
            id_tenant: true,
            nombre: true,
            correo: true,
            telefono: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(404).json(createErrorResponse('Usuario no encontrado', 404))
    }

    res.json(createSuccessResponse(usuario))

  } catch (error) {
    console.error('Error en getMe:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Contraseña actual incorrecta
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { currentPassword, newPassword } = req.body

    const missing = validateRequired({ currentPassword, newPassword })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        createErrorResponse('La nueva contraseña debe tener al menos 6 caracteres', 400)
      )
    }

    // Obtener usuario actual
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id_usuario }
    })

    if (!usuario) {
      return res.status(404).json(createErrorResponse('Usuario no encontrado', 404))
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password_hash)
    if (!isCurrentPasswordValid) {
      return res.status(401).json(
        createErrorResponse('Contraseña actual incorrecta', 401)
      )
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id_usuario: req.user.id_usuario },
      data: { password_hash: hashedNewPassword }
    })

    res.json(createSuccessResponse(null, 'Contraseña cambiada exitosamente'))

  } catch (error) {
    console.error('Error en changePassword:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
