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


export const getProductos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.activo !== undefined) {
      whereClause.activo = filters.activo
    }

    if (req.query.categoria) {
      whereClause.categoria = req.query.categoria
    }

    if (filters.search) {
      whereClause.nombre = {
        contains: filters.search,
        mode: 'insensitive'
      }
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { nombre: 'asc' }
      }),
      prisma.producto.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(productos, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getProductos:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const getProductoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_producto = parseInt(req.params.id)

    const producto = await prisma.producto.findFirst({
      where: {
        id_producto,
        id_tenant: req.user.id_tenant
      }
    })

    if (!producto) {
      return res.status(404).json(createErrorResponse('Producto no encontrado', 404))
    }

    res.json(createSuccessResponse(producto))

  } catch (error) {
    console.error('Error en getProductoById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const createProducto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { nombre, tamanio, precio, stock, categoria, activo } = req.body

    const missing = validateRequired({ nombre, precio })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const producto = await prisma.producto.create({
      data: {
        id_tenant: req.user.id_tenant,
        nombre,
        tamanio: tamanio || null,
        precio: parseFloat(precio),
        stock: stock || 0,
        categoria: categoria || null,
        activo: activo !== undefined ? activo : true
      }
    })

    res.status(201).json(createSuccessResponse(producto, 'Producto creado exitosamente'))

  } catch (error) {
    console.error('Error en createProducto:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const updateProducto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_producto = parseInt(req.params.id)
    const { nombre, tamanio, precio, stock, categoria, activo } = req.body

    const productoExistente = await prisma.producto.findFirst({
      where: {
        id_producto,
        id_tenant: req.user.id_tenant
      }
    })

    if (!productoExistente) {
      return res.status(404).json(createErrorResponse('Producto no encontrado', 404))
    }

    const productoActualizado = await prisma.producto.update({
      where: {
        id_producto_id_tenant: {
          id_producto,
          id_tenant: req.user.id_tenant
        }
      },
      data: {
        ...(nombre && { nombre }),
        ...(tamanio !== undefined && { tamanio }),
        ...(precio && { precio: parseFloat(precio) }),
        ...(stock !== undefined && { stock }),
        ...(categoria !== undefined && { categoria }),
        ...(activo !== undefined && { activo })
      }
    })

    res.json(createSuccessResponse(productoActualizado, 'Producto actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateProducto:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const updateStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_producto = parseInt(req.params.id)
    const { stock } = req.body

    if (stock === undefined || stock === null) {
      return res.status(400).json(createErrorResponse('Campo stock requerido', 400))
    }

    const productoExistente = await prisma.producto.findFirst({
      where: {
        id_producto,
        id_tenant: req.user.id_tenant
      }
    })

    if (!productoExistente) {
      return res.status(404).json(createErrorResponse('Producto no encontrado', 404))
    }

    const productoActualizado = await prisma.producto.update({
      where: {
        id_producto_id_tenant: {
          id_producto,
          id_tenant: req.user.id_tenant
        }
      },
      data: { stock }
    })

    res.json(createSuccessResponse(productoActualizado, 'Stock actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateStock:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

export const getCategorias = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const categorias = await prisma.producto.groupBy({
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
