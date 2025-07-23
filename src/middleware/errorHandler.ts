import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export interface CustomError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  error: CustomError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Error interno del servidor'
  let details: any = {}

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        message = 'Conflicto: el registro ya existe'
        details = { field: error.meta?.target }
        break
      case 'P2025':
        statusCode = 404
        message = 'Registro no encontrado'
        break
      case 'P2003':
        statusCode = 400
        message = 'Violación de restricción de clave foránea'
        break
      case 'P2014':
        statusCode = 400
        message = 'Cambio requerido violará una relación existente'
        break
      default:
        statusCode = 500
        message = 'Error de base de datos'
        details = { code: error.code }
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Error de validación de datos'
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503
    message = 'Error de conexión a la base de datos'
  } else {
    // Handle custom errors
    statusCode = error.statusCode || 500
    message = error.message || 'Error interno del servidor'
  }

  // Log the error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    tenant: req.headers['x-tenant-id'],
  })

  // Send error response
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { 
      details,
      stack: error.stack 
    })
  })
}
