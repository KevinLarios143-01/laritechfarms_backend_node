import { Router } from 'express'
import { 
  getVentas, 
  getVentaById, 
  createVenta,
  updateEstadoVenta,
  getEstadisticasVentas
} from '../controllers/ventaController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Gestión de ventas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       properties:
 *         id_venta:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         id_cliente:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date
 *         total:
 *           type: number
 *         estado:
 *           type: string
 *           enum: [Completada, Cancelada, Pendiente]
 *         observaciones:
 *           type: string
 *     DetalleVenta:
 *       type: object
 *       properties:
 *         id_detalle:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         cantidad:
 *           type: integer
 *         precio_unitario:
 *           type: number
 */

/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Obtener ventas
 *     tags: [Ventas]
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
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de ventas
 */

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Ventas]
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
 *         description: Datos de la venta
 *       404:
 *         description: Venta no encontrada
 */

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Crear nueva venta
 *     tags: [Ventas]
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
 *               - fecha
 *               - detalles
 *             properties:
 *               id_cliente:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               observaciones:
 *                 type: string
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_producto
 *                     - cantidad
 *                     - precio_unitario
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precio_unitario:
 *                       type: number
 *     responses:
 *       201:
 *         description: Venta creada exitosamente
 */

/**
 * @swagger
 * /ventas/{id}/estado:
 *   patch:
 *     summary: Actualizar estado de venta
 *     tags: [Ventas]
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
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Completada, Cancelada, Pendiente]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Venta no encontrada
 */

/**
 * @swagger
 * /ventas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estadísticas de ventas
 */

router.use(authenticateToken)
router.get('/', getVentas)
router.get('/estadisticas', getEstadisticasVentas)
router.get('/:id', getVentaById)
router.post('/', createVenta)
router.patch('/:id/estado', updateEstadoVenta)

export default router
