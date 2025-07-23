import { Response } from 'express'
import { prisma } from '../services/database'
import { AuthenticatedRequest } from '../types'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  extractPagination, 
  createPaginatedResponse,
  parseFilters,
  validateRequired
} from '../utils/helpers'


export const getVentas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.estado) {
      whereClause.estado = filters.estado
    }

    if (filters.fecha_desde || filters.fecha_hasta) {
      whereClause.fecha = {}
      if (filters.fecha_desde) {
        whereClause.fecha.gte = filters.fecha_desde
      }
      if (filters.fecha_hasta) {
        whereClause.fecha.lte = filters.fecha_hasta
      }
    }

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          cliente: {
            select: {
              id_cliente: true,
              nombre: true,
              telefono: true
            }
          },
          usuario: {
            select: {
              id_usuario: true,
              nombre: true
            }
          },
          detallesVenta: {
            include: {
              producto: {
                select: {
                  nombre: true,
                  tamanio: true
                }
              }
            }
          }
        },
        orderBy: { fecha: 'desc' }
      }),
      prisma.venta.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(ventas, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getVentas:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const getVentaById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_venta = parseInt(req.params.id)

    const venta = await prisma.venta.findFirst({
      where: {
        id_venta,
        id_tenant: req.user.id_tenant
      },
      include: {
        cliente: true,
        usuario: {
          select: {
            nombre: true,
            email: true
          }
        },
        detallesVenta: {
          include: {
            producto: true
          }
        },
        tickets: true
      }
    })

    if (!venta) {
      return res.status(404).json(createErrorResponse('Venta no encontrada', 404))
    }

    res.json(createSuccessResponse(venta))

  } catch (error) {
    console.error('Error en getVentaById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const createVenta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { id_cliente, fecha, observaciones, detalles } = req.body

    const missing = validateRequired({ fecha, detalles })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json(createErrorResponse('Debe incluir al menos un detalle de venta', 400))
    }

    // Validar detalles
    for (const detalle of detalles) {
      const missingDetalle = validateRequired({ 
        id_producto: detalle.id_producto, 
        cantidad: detalle.cantidad, 
        precio_unitario: detalle.precio_unitario 
      })
      if (missingDetalle.length > 0) {
        return res.status(400).json(
          createErrorResponse(`Detalle incompleto: ${missingDetalle.join(', ')}`, 400)
        )
      }
    }

    // Calcular total
    const total = detalles.reduce((sum: number, detalle: any) => 
      sum + (detalle.cantidad * detalle.precio_unitario), 0
    )

    // Usar transacción para crear venta y detalles
    const venta = await prisma.$transaction(async (tx) => {
      // Crear venta
      const nuevaVenta = await tx.venta.create({
        data: {
          id_tenant: req.user!.id_tenant,
          id_cliente: id_cliente || null,
          fecha: new Date(fecha),
          total,
          observaciones,
          id_usuario: req.user!.id_usuario
        }
      })

      // Crear detalles de venta
      await tx.detalleVenta.createMany({
        data: detalles.map((detalle: any) => ({
          id_tenant: req.user!.id_tenant,
          id_venta: nuevaVenta.id_venta,
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario
        }))
      })

      // Actualizar stock de productos
      for (const detalle of detalles) {
        await tx.producto.update({
          where: {
            id_producto_id_tenant: {
              id_producto: detalle.id_producto,
              id_tenant: req.user!.id_tenant
            }
          },
          data: {
            stock: {
              decrement: detalle.cantidad
            }
          }
        })
      }

      return nuevaVenta
    })

    // Obtener venta completa con detalles
    const ventaCompleta = await prisma.venta.findUnique({
      where: {
        id_venta_id_tenant: {
          id_venta: venta.id_venta,
          id_tenant: req.user.id_tenant
        }
      },
      include: {
        detallesVenta: {
          include: {
            producto: true
          }
        }
      }
    })

    res.status(201).json(createSuccessResponse(ventaCompleta, 'Venta creada exitosamente'))

  } catch (error) {
    console.error('Error en createVenta:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const updateEstadoVenta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_venta = parseInt(req.params.id)
    const { estado } = req.body

    if (!estado) {
      return res.status(400).json(createErrorResponse('Campo estado requerido', 400))
    }

    const ventaExistente = await prisma.venta.findFirst({
      where: {
        id_venta,
        id_tenant: req.user.id_tenant
      }
    })

    if (!ventaExistente) {
      return res.status(404).json(createErrorResponse('Venta no encontrada', 404))
    }

    const ventaActualizada = await prisma.venta.update({
      where: {
        id_venta_id_tenant: {
          id_venta,
          id_tenant: req.user.id_tenant
        }
      },
      data: { estado }
    })

    res.json(createSuccessResponse(ventaActualizada, 'Estado de venta actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateEstadoVenta:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const getEstadisticasVentas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const filters = parseFilters(req.query)
    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.fecha_desde || filters.fecha_hasta) {
      whereClause.fecha = {}
      if (filters.fecha_desde) {
        whereClause.fecha.gte = filters.fecha_desde
      }
      if (filters.fecha_hasta) {
        whereClause.fecha.lte = filters.fecha_hasta
      }
    }

    const [totalVentas, ventasPorEstado, ventasPorDia] = await Promise.all([
      prisma.venta.aggregate({
        where: whereClause,
        _sum: { total: true },
        _count: { id_venta: true },
        _avg: { total: true }
      }),
      prisma.venta.groupBy({
        by: ['estado'],
        where: whereClause,
        _count: { id_venta: true },
        _sum: { total: true }
      }),
      prisma.venta.groupBy({
        by: ['fecha'],
        where: whereClause,
        _sum: { total: true },
        _count: { id_venta: true },
        orderBy: { fecha: 'desc' },
        take: 30
      })
    ])

    res.json(createSuccessResponse({
      totalVentas,
      ventasPorEstado,
      ventasPorDia
    }))

  } catch (error) {
    console.error('Error en getEstadisticasVentas:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
