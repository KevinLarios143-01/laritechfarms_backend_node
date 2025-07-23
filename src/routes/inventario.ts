/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtener inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /inventario/{id}:
 *   get:
 *     summary: Obtener item de inventario por ID
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /inventario:
 *   post:
 *     summary: Crear nuevo item de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /inventario/{id}:
 *   put:
 *     summary: Actualizar item de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /inventario/{id}/stock:
 *   patch:
 *     summary: Actualizar cantidad en stock
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /inventario/categorias:
 *   get:
 *     summary: Obtener categorías de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

/**
 * @swagger
 * /inventario/alertas:
 *   get:
 *     summary: Obtener alertas de stock bajo
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Items con stock bajo o crítico
 */
import { Router } from 'express'
import { 
  getInventario, 
  getInventarioById, 
  createInventario, 
  updateInventario,
  updateStock,
  getCategorias,
  getAlertas
} from '../controllers/inventarioController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de inventario de granja
 */

router.use(authenticateToken)
router.get('/', getInventario)
router.get('/categorias', getCategorias)
router.get('/alertas', getAlertas)
router.get('/:id', getInventarioById)
router.post('/', createInventario)
router.put('/:id', updateInventario)
router.patch('/:id/stock', updateStock)

export default router
