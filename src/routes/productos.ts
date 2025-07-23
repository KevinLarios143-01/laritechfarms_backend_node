import { Router } from 'express'
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto,
  updateStock,
  getCategorias
} from '../controllers/productoController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         nombre:
 *           type: string
 *         tamanio:
 *           type: string
 *         precio:
 *           type: number
 *         stock:
 *           type: integer
 *         categoria:
 *           type: string
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener productos
 *     tags: [Productos]
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
 *         name: activo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de productos
 */

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Productos]
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
 *         description: Datos del producto
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Productos]
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
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *               tamanio:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoria:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 */

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Productos]
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
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /productos/{id}/stock:
 *   patch:
 *     summary: Actualizar stock de producto
 *     tags: [Productos]
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
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /productos/categorias:
 *   get:
 *     summary: Obtener categorías de productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

router.use(authenticateToken)

router.get('/', getProductos)
router.get('/categorias', getCategorias)
router.get('/:id', getProductoById)
router.post('/', createProducto)
router.put('/:id', updateProducto)
router.patch('/:id/stock', updateStock)

export default router
