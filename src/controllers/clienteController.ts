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

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id_cliente:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         nombre:
 *           type: string
 *         telefono:
 *           type: string
 *         correo:
 *           type: string
 *         direccion:
 *           type: string
 *         ruc:
 *           type: string
 *         fecha_registro:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Obtener clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
export const getClientes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.search) {
      whereClause.OR = [
        {
          nombre: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          telefono: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          correo: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          _count: {
            select: {
              ventas: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      }),
      prisma.cliente.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(clientes, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getClientes:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del cliente
 *       404:
 *         description: Cliente no encontrado
 */
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
      },
      include: {
        ventas: {
          orderBy: { fecha: 'desc' },
          take: 10,
          select: {
            id_venta: true,
            fecha: true,
            total: true,
            estado: true
          }
        },
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

    res.json(createSuccessResponse(cliente))

  } catch (error) {
    console.error('Error en getClienteById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ruc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
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

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
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

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       400:
 *         description: No se puede eliminar el cliente (tiene ventas asociadas)
 */
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

/**
 * @swagger
 * /clientes/{id}/ventas:
 *   get:
 *     summary: Obtener ventas de un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ventas del cliente
 *       404:
 *         description: Cliente no encontrado
 */
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
