import { Request } from 'express'
import { PaginationParams, PaginatedResponse } from '../types'

export const extractPagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> => {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit)
    }
  }
}

export const validateRequired = (fields: Record<string, any>): string[] => {
  const missing: string[] = []
  
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      missing.push(key)
    }
  }
  
  return missing
}

export const createSuccessResponse = <T>(data?: T, message?: string) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
    timestamp: new Date().toISOString()
  }
}

export const createErrorResponse = (error: string, statusCode: number = 500) => {
  return {
    success: false,
    error,
    statusCode,
    timestamp: new Date().toISOString()
  }
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const parseFilters = (query: any) => {
  const filters: any = {}
  
  // Extract common filters
  if (query.search) {
    filters.search = query.search
  }
  
  if (query.estado) {
    filters.estado = query.estado
  }
  
  if (query.tipo) {
    filters.tipo = query.tipo
  }
  
  if (query.fecha_desde) {
    filters.fecha_desde = new Date(query.fecha_desde)
  }
  
  if (query.fecha_hasta) {
    filters.fecha_hasta = new Date(query.fecha_hasta)
  }
  
  if (query.activo !== undefined) {
    filters.activo = query.activo === 'true'
  }
  
  return filters
}
