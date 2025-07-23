import { Response } from 'express'
import { prisma } from '../services/database'
import { AuthenticatedRequest } from '../types'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  extractPagination, 
  createPaginatedResponse,
  parseFilters 
} from '../utils/helpers'

/**
 * @swagger
 * components:
 *   schemas:
 *     Lote:
 *       type: object
 *       properties:
 *         id_lote:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [Ponedoras, Engorde]
 *         fecha_inicio:
 *           type: string
 *           format: date
 *         fecha_fin:
 *           type: string
 *           format: date
 *         cantidad:
 *           type: integer
 *         galera:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [Activo, Inactivo, Desalojado]
 *         observaciones:
 *           type: string
 */

/**
 * @swagger
 * /lotes:
 *   get:
 *     summary: Obtener lotes
 *     tags: [Lotes]
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
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de lotes
 */
export const getLotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('No autorizado', 401))
      return
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.estado) {
      whereClause.estado = filters.estado
    }

    if (filters.tipo) {
      whereClause.tipo = filters.tipo
    }

    if (filters.search) {
      whereClause.galera = {
        contains: filters.search,
        mode: 'insensitive'
      }
    }

    const [lotes, total] = await Promise.all([
      prisma.lote.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          _count: {
            select: {
              aves: true
            }
          }
        },
        orderBy: { fecha_inicio: 'desc' }
      }),
      prisma.lote.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(lotes, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getLotes:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /lotes/{id}:
 *   get:
 *     summary: Obtener lote por ID
 *     tags: [Lotes]
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
 *         description: Datos del lote
 *       404:
 *         description: Lote no encontrado
 */
export const getLoteById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_lote = parseInt(req.params.id)

    const lote = await prisma.lote.findFirst({
      where: {
        id_lote,
        id_tenant: req.user.id_tenant
      },
      include: {
        aves: {
          select: {
            id_ave: true,
            estado: true,
            edad: true,
            peso: true
          }
        },
        _count: {
          select: {
            aves: true
          }
        }
      }
    })

    if (!lote) {
      return res.status(404).json(createErrorResponse('Lote no encontrado', 404))
    }

    res.json(createSuccessResponse(lote))

  } catch (error) {
    console.error('Error en getLoteById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /lotes:
 *   post:
 *     summary: Crear nuevo lote
 *     tags: [Lotes]
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
 *               - tipo
 *               - fecha_inicio
 *               - cantidad
 *               - galera
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Ponedoras, Engorde]
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               cantidad:
 *                 type: integer
 *               galera:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lote creado exitosamente
 */
export const createLote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { tipo, fecha_inicio, fecha_fin, cantidad, galera, observaciones } = req.body

    // Validar campos requeridos
    const requiredFields = { tipo, fecha_inicio, cantidad, galera }
    const missing = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key)

    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const lote = await prisma.lote.create({
      data: {
        id_tenant: req.user.id_tenant,
        tipo,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        cantidad,
        galera,
        observaciones
      }
    })

    res.status(201).json(createSuccessResponse(lote, 'Lote creado exitosamente'))

  } catch (error) {
    console.error('Error en createLote:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /lotes/{id}:
 *   put:
 *     summary: Actualizar lote
 *     tags: [Lotes]
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
 *             $ref: '#/components/schemas/Lote'
 *     responses:
 *       200:
 *         description: Lote actualizado exitosamente
 *       404:
 *         description: Lote no encontrado
 */
export const updateLote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_lote = parseInt(req.params.id)
    const { tipo, fecha_inicio, fecha_fin, cantidad, galera, estado, observaciones } = req.body

    // Verificar que el lote existe y pertenece al tenant
    const loteExistente = await prisma.lote.findFirst({
      where: {
        id_lote,
        id_tenant: req.user.id_tenant
      }
    })

    if (!loteExistente) {
      return res.status(404).json(createErrorResponse('Lote no encontrado', 404))
    }

    const loteActualizado = await prisma.lote.update({
      where: {
        id_lote_id_tenant: {
          id_lote,
          id_tenant: req.user.id_tenant
        }
      },
      data: {
        ...(tipo && { tipo }),
        ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
        ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
        ...(cantidad && { cantidad }),
        ...(galera && { galera }),
        ...(estado && { estado }),
        ...(observaciones !== undefined && { observaciones })
      }
    })

    res.json(createSuccessResponse(loteActualizado, 'Lote actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateLote:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /lotes/{id}:
 *   delete:
 *     summary: Eliminar lote
 *     tags: [Lotes]
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
 *         description: Lote eliminado exitosamente
 *       404:
 *         description: Lote no encontrado
 *       400:
 *         description: No se puede eliminar el lote (tiene aves asociadas)
 */
export const deleteLote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_lote = parseInt(req.params.id)

    // Verificar que el lote existe y pertenece al tenant
    const lote = await prisma.lote.findFirst({
      where: {
        id_lote,
        id_tenant: req.user.id_tenant
      },
      include: {
        _count: {
          select: {
            aves: true
          }
        }
      }
    })

    if (!lote) {
      return res.status(404).json(createErrorResponse('Lote no encontrado', 404))
    }

    // Verificar que no tenga aves asociadas
    if (lote._count.aves > 0) {
      return res.status(400).json(
        createErrorResponse('No se puede eliminar el lote porque tiene aves asociadas', 400)
      )
    }

    await prisma.lote.delete({
      where: {
        id_lote_id_tenant: {
          id_lote,
          id_tenant: req.user.id_tenant
        }
      }
    })

    res.json(createSuccessResponse(null, 'Lote eliminado exitosamente'))

  } catch (error) {
    console.error('Error en deleteLote:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
