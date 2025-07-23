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
 *     InventarioGranja:
 *       type: object
 *       properties:
 *         id_inventario:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         nombre:
 *           type: string
 *         cantidad:
 *           type: integer
 *         unidad:
 *           type: string
 *         categoria:
 *           type: string
 *         minimo_stock:
 *           type: integer
 *         proveedor:
 *           type: string
 *         observaciones:
 *           type: string
 */

/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtener inventario
 *     tags: [Inventario]
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
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: stock_bajo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de inventario
 */
export const getInventario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (req.query.categoria) {
      whereClause.categoria = req.query.categoria
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
          proveedor: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Filtro para stock bajo
    if (req.query.stock_bajo === 'true') {
      whereClause.AND = [
        {
          minimo_stock: {
            not: null
          }
        },
        {
          OR: [
            {
              cantidad: {
                lte: prisma.inventarioGranja.fields.minimo_stock
              }
            }
          ]
        }
      ]
    }

    const [inventario, total] = await Promise.all([
      prisma.inventarioGranja.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { nombre: 'asc' }
      }),
      prisma.inventarioGranja.count({ where: whereClause })
    ])

    // Agregar estado de stock a cada item
    const inventarioConEstado = inventario.map(item => ({
      ...item,
      estado_stock: item.minimo_stock 
        ? item.cantidad <= item.minimo_stock 
          ? 'Crítico' 
          : item.cantidad <= item.minimo_stock * 1.5 
            ? 'Bajo' 
            : 'Normal'
        : 'Sin mínimo definido'
    }))

    const response = createPaginatedResponse(inventarioConEstado, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getInventario:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario/{id}:
 *   get:
 *     summary: Obtener item de inventario por ID
 *     tags: [Inventario]
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
 *         description: Datos del item de inventario
 *       404:
 *         description: Item no encontrado
 */
export const getInventarioById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_inventario = parseInt(req.params.id)

    const item = await prisma.inventarioGranja.findFirst({
      where: {
        id_inventario,
        id_tenant: req.user.id_tenant
      }
    })

    if (!item) {
      return res.status(404).json(createErrorResponse('Item de inventario no encontrado', 404))
    }

    // Agregar estado de stock
    const itemConEstado = {
      ...item,
      estado_stock: item.minimo_stock 
        ? item.cantidad <= item.minimo_stock 
          ? 'Crítico' 
          : item.cantidad <= item.minimo_stock * 1.5 
            ? 'Bajo' 
            : 'Normal'
        : 'Sin mínimo definido'
    }

    res.json(createSuccessResponse(itemConEstado))

  } catch (error) {
    console.error('Error en getInventarioById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario:
 *   post:
 *     summary: Crear nuevo item de inventario
 *     tags: [Inventario]
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
 *               - cantidad
 *               - unidad
 *             properties:
 *               nombre:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               unidad:
 *                 type: string
 *               categoria:
 *                 type: string
 *               minimo_stock:
 *                 type: integer
 *               proveedor:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item de inventario creado exitosamente
 */
export const createInventario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { nombre, cantidad, unidad, categoria, minimo_stock, proveedor, observaciones } = req.body

    const missing = validateRequired({ nombre, cantidad, unidad })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const item = await prisma.inventarioGranja.create({
      data: {
        id_tenant: req.user.id_tenant,
        nombre,
        cantidad: parseInt(cantidad),
        unidad,
        categoria: categoria || null,
        minimo_stock: minimo_stock ? parseInt(minimo_stock) : null,
        proveedor: proveedor || null,
        observaciones: observaciones || null
      }
    })

    res.status(201).json(createSuccessResponse(item, 'Item de inventario creado exitosamente'))

  } catch (error) {
    console.error('Error en createInventario:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario/{id}:
 *   put:
 *     summary: Actualizar item de inventario
 *     tags: [Inventario]
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
 *             $ref: '#/components/schemas/InventarioGranja'
 *     responses:
 *       200:
 *         description: Item de inventario actualizado exitosamente
 *       404:
 *         description: Item no encontrado
 */
export const updateInventario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_inventario = parseInt(req.params.id)
    const { nombre, cantidad, unidad, categoria, minimo_stock, proveedor, observaciones } = req.body

    const itemExistente = await prisma.inventarioGranja.findFirst({
      where: {
        id_inventario,
        id_tenant: req.user.id_tenant
      }
    })

    if (!itemExistente) {
      return res.status(404).json(createErrorResponse('Item de inventario no encontrado', 404))
    }

    const itemActualizado = await prisma.inventarioGranja.update({
      where: { id_inventario },
      data: {
        ...(nombre && { nombre }),
        ...(cantidad !== undefined && { cantidad: parseInt(cantidad) }),
        ...(unidad && { unidad }),
        ...(categoria !== undefined && { categoria }),
        ...(minimo_stock !== undefined && { minimo_stock: minimo_stock ? parseInt(minimo_stock) : null }),
        ...(proveedor !== undefined && { proveedor }),
        ...(observaciones !== undefined && { observaciones })
      }
    })

    res.json(createSuccessResponse(itemActualizado, 'Item de inventario actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateInventario:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario/{id}/stock:
 *   patch:
 *     summary: Actualizar cantidad en stock
 *     tags: [Inventario]
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
 *             type: object
 *             required:
 *               - operacion
 *               - cantidad
 *             properties:
 *               operacion:
 *                 type: string
 *                 enum: [entrada, salida, ajuste]
 *               cantidad:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       404:
 *         description: Item no encontrado
 */
export const updateStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_inventario = parseInt(req.params.id)
    const { operacion, cantidad, observaciones } = req.body

    const missing = validateRequired({ operacion, cantidad })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const item = await prisma.inventarioGranja.findFirst({
      where: {
        id_inventario,
        id_tenant: req.user.id_tenant
      }
    })

    if (!item) {
      return res.status(404).json(createErrorResponse('Item de inventario no encontrado', 404))
    }

    let nuevaCantidad = item.cantidad

    switch (operacion) {
      case 'entrada':
        nuevaCantidad += parseInt(cantidad)
        break
      case 'salida':
        nuevaCantidad -= parseInt(cantidad)
        if (nuevaCantidad < 0) {
          return res.status(400).json(
            createErrorResponse('La cantidad resultante no puede ser negativa', 400)
          )
        }
        break
      case 'ajuste':
        nuevaCantidad = parseInt(cantidad)
        break
      default:
        return res.status(400).json(
          createErrorResponse('Operación inválida. Use: entrada, salida o ajuste', 400)
        )
    }

    const itemActualizado = await prisma.inventarioGranja.update({
      where: { id_inventario },
      data: { 
        cantidad: nuevaCantidad,
        ...(observaciones && { observaciones })
      }
    })

    res.json(createSuccessResponse(itemActualizado, 'Stock actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateStock:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario/categorias:
 *   get:
 *     summary: Obtener categorías de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
export const getCategorias = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const categorias = await prisma.inventarioGranja.groupBy({
      by: ['categoria'],
      where: {
        id_tenant: req.user.id_tenant,
        categoria: {
          not: null
        }
      },
      _count: {
        categoria: true
      }
    })

    res.json(createSuccessResponse(categorias))

  } catch (error) {
    console.error('Error en getCategorias:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /inventario/alertas:
 *   get:
 *     summary: Obtener alertas de stock bajo
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Items con stock bajo o crítico
 */
export const getAlertas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    // Obtener items con stock bajo o crítico usando SQL raw
    const itemsConAlerta = await prisma.$queryRaw`
      SELECT *,
        CASE 
          WHEN minimo_stock IS NULL THEN 'Sin mínimo definido'
          WHEN cantidad <= minimo_stock THEN 'Crítico'
          WHEN cantidad <= minimo_stock * 1.5 THEN 'Bajo'
          ELSE 'Normal'
        END as estado_stock
      FROM inventario_granja 
      WHERE id_tenant = ${req.user.id_tenant}
        AND minimo_stock IS NOT NULL 
        AND cantidad <= minimo_stock * 1.5
      ORDER BY cantidad / NULLIF(minimo_stock, 0) ASC
    `

    res.json(createSuccessResponse(itemsConAlerta))

  } catch (error) {
    console.error('Error en getAlertas:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
