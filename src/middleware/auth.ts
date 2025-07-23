import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../services/database'

export interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: number
    id_tenant: number
    email: string
    rol: string
    nombre: string
  }
  tenant?: {
    id_tenant: number
    nombre: string
    activo: boolean
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        timestamp: new Date().toISOString()
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Buscar el usuario en la base de datos
    const usuario = await prisma.usuario.findFirst({
      where: {
        id_usuario: decoded.id_usuario,
        activo: true,
      },
      include: {
        tenant: true
      }
    })

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado o inactivo',
        timestamp: new Date().toISOString()
      })
    }

    if (!usuario.tenant.activo) {
      return res.status(403).json({
        error: 'Tenant inactivo',
        timestamp: new Date().toISOString()
      })
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      id_tenant: usuario.id_tenant,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    }

    req.tenant = {
      id_tenant: usuario.tenant.id_tenant,
      nombre: usuario.tenant.nombre,
      activo: usuario.tenant.activo
    }

    next()
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido',
      timestamp: new Date().toISOString()
    })
  }
}

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        timestamp: new Date().toISOString()
      })
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        timestamp: new Date().toISOString()
      })
    }

    next()
  }
}

export const validateTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id']
  
  if (!tenantId) {
    return res.status(400).json({
      error: 'Header X-Tenant-ID requerido',
      timestamp: new Date().toISOString()
    })
  }

  if (req.user && req.user.id_tenant !== parseInt(tenantId as string)) {
    return res.status(403).json({
      error: 'Acceso denegado al tenant especificado',
      timestamp: new Date().toISOString()
    })
  }

  next()
}
