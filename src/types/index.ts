import { Request } from 'express'

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

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  timestamp: string
}

export type UserRole = 'admin' | 'gerente' | 'supervisor' | 'operador'

export type EstadoVenta = 'Completada' | 'Cancelada' | 'Pendiente'
export type EstadoTicket = 'Pendiente' | 'Pagado' | 'Anulado'
export type EstadoAve = 'Viva' | 'Muerta' | 'Vendida' | 'Descarte'
export type EstadoLote = 'Activo' | 'Inactivo' | 'Desalojado'
export type TipoAve = 'Ponedoras' | 'Engorde'
export type CalidadHuevo = 'Excelente' | 'Buena' | 'Regular' | 'Mala'
export type EstadoAsistencia = 'Presente' | 'Tardanza' | 'Ausente' | 'Justificado'
export type EstadoPrestamo = 'Pendiente' | 'Pagado' | 'Cancelado'
export type EstadoVehiculo = 'Activo' | 'Mantenimiento' | 'Inactivo'
export type EstadoSuscripcion = 'activa' | 'cancelada' | 'suspendida' | 'prueba'
