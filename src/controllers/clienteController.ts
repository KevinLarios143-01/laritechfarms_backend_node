// Obtener lista de clientes paginada y filtrada
export const getClientes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }
    const pagination = extractPagination(req)
    const { search } = req.query
    const where: any = { id_tenant: req.user.id_tenant }
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
        { direccion: { contains: search, mode: 'insensitive' } },
        { ruc: { contains: search, mode: 'insensitive' } }
      ]
    }
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { fecha_registro: 'desc' }
      }),
      prisma.cliente.count({ where })
    ])
    res.json(createPaginatedResponse(clientes, total, pagination))
  } catch (error) {
    console.error('Error en getClientes:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

// Obtener un cliente por ID
export const getClienteById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }
    const id_cliente = parseInt(req.params.id)
    const cliente = await prisma.cliente.findFirst({
      where: {
        id_cliente,
        id_tenant: req.user.id_tenant
      }
    })
    if (!cliente) {
      return res.status(404).json(createErrorResponse('Cliente no encontrado', 404))
    }
    res.json(createSuccessResponse(cliente))
  } catch (error) {
    console.error('Error en getClienteById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
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


export const createCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { nombre, telefono, correo, direccion, ruc } = req.body

    const missing = validateRequired({ nombre })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        id_tenant: req.user.id_tenant,
        nombre,
        telefono: telefono || null,
        correo: correo || null,
        direccion: direccion || null,
        ruc: ruc || null
      }
    })

    res.status(201).json(createSuccessResponse(cliente, 'Cliente creado exitosamente'))

  } catch (error) {
    console.error('Error en createCliente:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const updateCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_cliente = parseInt(req.params.id)
    const { nombre, telefono, correo, direccion, ruc } = req.body

    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id_cliente,
        id_tenant: req.user.id_tenant
      }
    })

    if (!clienteExistente) {
      return res.status(404).json(createErrorResponse('Cliente no encontrado', 404))
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id_cliente },
      data: {
        ...(nombre && { nombre }),
        ...(telefono !== undefined && { telefono }),
        ...(correo !== undefined && { correo }),
        ...(direccion !== undefined && { direccion }),
        ...(ruc !== undefined && { ruc })
      }
    })

    res.json(createSuccessResponse(clienteActualizado, 'Cliente actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateCliente:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const deleteCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_cliente = parseInt(req.params.id)

    const cliente = await prisma.cliente.findFirst({
      where: {
        id_cliente,
        id_tenant: req.user.id_tenant
      },
      include: {
        _count: {
          select: {
            ventas: true
          }
        }
      }
    })

    if (!cliente) {
      return res.status(404).json(createErrorResponse('Cliente no encontrado', 404))
    }

    if (cliente._count.ventas > 0) {
      return res.status(400).json(
        createErrorResponse('No se puede eliminar el cliente porque tiene ventas asociadas', 400)
      )
    }

    await prisma.cliente.delete({
      where: { id_cliente }
    })

    res.json(createSuccessResponse(null, 'Cliente eliminado exitosamente'))

  } catch (error) {
    console.error('Error en deleteCliente:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const getVentasCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_cliente = parseInt(req.params.id)
    const pagination = extractPagination(req)

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findFirst({
      where: {
        id_cliente,
        id_tenant: req.user.id_tenant
      }
    })

    if (!cliente) {
      return res.status(404).json(createErrorResponse('Cliente no encontrado', 404))
    }

    const whereClause = {
      id_cliente,
      id_tenant: req.user.id_tenant
    }

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
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
    console.error('Error en getVentasCliente:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
