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
 *     Ave:
 *       type: object
 *       properties:
 *         id_ave:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [Ponedoras, Engorde]
 *         edad:
 *           type: integer
 *         estado:
 *           type: string
 *           enum: [Viva, Muerta, Vendida, Descarte]
 *         produccion_huevos:
 *           type: integer
 *         peso:
 *           type: number
 *         id_lote:
 *           type: integer
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         fecha_salida:
 *           type: string
 *           format: date
 *         motivo_salida:
 *           type: string
 */

/**
 * @swagger
 * /aves:
 *   get:
 *     summary: Obtener aves
 *     tags: [Aves]
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
 *       - in: query
 *         name: id_lote
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de aves
 */
export const getAves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    if (req.query.id_lote) {
      whereClause.id_lote = parseInt(req.query.id_lote as string)
    }

    const [aves, total] = await Promise.all([
      prisma.ave.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          lote: {
            select: {
              id_lote: true,
              galera: true,
              tipo: true
            }
          }
        },
        orderBy: { fecha_ingreso: 'desc' }
      }),
      prisma.ave.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(aves, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getAves:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /aves/{id}:
 *   get:
 *     summary: Obtener ave por ID
 *     tags: [Aves]
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
 *         description: Datos del ave
 *       404:
 *         description: Ave no encontrada
 */
export const getAveById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('No autorizado', 401))
      return
    }

    const id_ave = parseInt(req.params.id || '0')

    const ave = await prisma.ave.findFirst({
      where: {
        id_ave,
        id_tenant: req.user.id_tenant
      },
      include: {
        lote: true,
        saludAves: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        controlPeso: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        controlHuevos: {
          orderBy: { fecha: 'desc' },
          take: 10
        }
      }
    })

    if (!ave) {
      res.status(404).json(createErrorResponse('Ave no encontrada', 404))
      return
    }

    res.json(createSuccessResponse(ave))

  } catch (error) {
    console.error('Error en getAveById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /aves:
 *   post:
 *     summary: Crear nueva ave
 *     tags: [Aves]
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
 *               - edad
 *               - estado
 *               - fecha_ingreso
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Ponedoras, Engorde]
 *               edad:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [Viva, Muerta, Vendida, Descarte]
 *               peso:
 *                 type: number
 *               id_lote:
 *                 type: integer
 *               fecha_ingreso:
 *                 type: string
 *                 format: date
 *               produccion_huevos:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ave creada exitosamente
 */
export const createAve = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('No autorizado', 401))
      return
    }

    const { tipo, edad, estado, peso, id_lote, fecha_ingreso, produccion_huevos } = req.body

    const missing = validateRequired({ tipo, edad, estado, fecha_ingreso })
    if (missing.length > 0) {
      res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
      return
    }

    // Verificar que el lote existe si se proporciona
    if (id_lote) {
      const lote = await prisma.lote.findFirst({
        where: {
          id_lote,
          id_tenant: req.user.id_tenant
        }
      })

      if (!lote) {
        res.status(400).json(createErrorResponse('Lote no encontrado', 400))
        return
      }
    }

    // Obtener el próximo id_ave disponible para este tenant
    const lastAve = await prisma.ave.findFirst({
      where: { id_tenant: req.user.id_tenant },
      orderBy: { id_ave: 'desc' }
    })
    const nextIdAve = (lastAve?.id_ave || 0) + 1

    const ave = await prisma.ave.create({
      data: {
        id_ave: nextIdAve,
        id_tenant: req.user.id_tenant,
        tipo,
        edad,
        estado,
        peso: peso || 0,
        id_lote: id_lote || null,
        fecha_ingreso: new Date(fecha_ingreso),
        produccion_huevos: produccion_huevos || 0
      }
    })

    res.status(201).json(createSuccessResponse(ave, 'Ave creada exitosamente'))

  } catch (error) {
    console.error('Error en createAve:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /aves/{id}:
 *   put:
 *     summary: Actualizar ave
 *     tags: [Aves]
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
 *             $ref: '#/components/schemas/Ave'
 *     responses:
 *       200:
 *         description: Ave actualizada exitosamente
 *       404:
 *         description: Ave no encontrada
 */
export const updateAve = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('No autorizado', 401))
      return
    }

    const id_ave = parseInt(req.params.id || '0')
    const { tipo, edad, estado, peso, id_lote, fecha_salida, motivo_salida, produccion_huevos } = req.body

    const aveExistente = await prisma.ave.findFirst({
      where: {
        id_ave,
        id_tenant: req.user.id_tenant
      }
    })

    if (!aveExistente) {
      res.status(404).json(createErrorResponse('Ave no encontrada', 404))
      return
    }

    const aveActualizada = await prisma.ave.update({
      where: {
        id_ave_id_tenant: {
          id_ave,
          id_tenant: req.user.id_tenant
        }
      },
      data: {
        ...(tipo && { tipo }),
        ...(edad && { edad }),
        ...(estado && { estado }),
        ...(peso !== undefined && { peso }),
        ...(id_lote !== undefined && { id_lote }),
        ...(fecha_salida && { fecha_salida: new Date(fecha_salida) }),
        ...(motivo_salida !== undefined && { motivo_salida }),
        ...(produccion_huevos !== undefined && { produccion_huevos })
      }
    })

    res.json(createSuccessResponse(aveActualizada, 'Ave actualizada exitosamente'))

  } catch (error) {
    console.error('Error en updateAve:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /aves/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de aves
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Estadísticas de aves
 */
export const getEstadisticasAves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('No autorizado', 401))
      return
    }

    const estadisticas = await prisma.ave.groupBy({
      by: ['estado', 'tipo'],
      where: {
        id_tenant: req.user.id_tenant
      },
      _count: {
        id_ave: true
      },
      _avg: {
        peso: true,
        edad: true
      }
    })

    const totalAves = await prisma.ave.count({
      where: { id_tenant: req.user.id_tenant }
    })

    const produccionHuevos = await prisma.ave.aggregate({
      where: {
        id_tenant: req.user.id_tenant,
        tipo: 'Ponedoras',
        estado: 'Viva'
      },
      _sum: {
        produccion_huevos: true
      }
    })

    res.json(createSuccessResponse({
      estadisticas,
      totalAves,
      totalProduccionHuevos: produccionHuevos._sum.produccion_huevos || 0
    }))

  } catch (error) {
    console.error('Error en getEstadisticasAves:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
