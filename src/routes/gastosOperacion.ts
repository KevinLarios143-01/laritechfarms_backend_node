import { Router } from 'express';
import { gastoOperacionController } from '../controllers/gastoOperacionController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     GastoOperacion:
 *       type: object
 *       required:
 *         - fecha
 *         - categoria
 *         - descripcion
 *         - monto
 *       properties:
 *         id_gasto:
 *           type: integer
 *           description: ID único del gasto
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del gasto
 *         categoria:
 *           type: string
 *           description: Categoría del gasto
 *         descripcion:
 *           type: string
 *           description: Descripción del gasto
 *         monto:
 *           type: number
 *           description: Monto del gasto
 *         metodo_pago:
 *           type: string
 *           description: Método de pago utilizado
 */

/**
 * @swagger
 * /gastos-operacion:
 *   get:
 *     summary: Obtener todos los gastos de operación
 *     tags: [Gastos Operación]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Lista de gastos de operación
 *       401:
 *         description: No autorizado
 */
router.get('/', gastoOperacionController.getAll);

/**
 * @swagger
 * /gastos-operacion/stats:
 *   get:
 *     summary: Obtener estadísticas de gastos de operación
 *     tags: [Gastos Operación]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Estadísticas de gastos de operación
 */
router.get('/stats', gastoOperacionController.getStats);

router.get('/:id', gastoOperacionController.getById);

/**
 * @swagger
 * /gastos-operacion:
 *   post:
 *     summary: Crear nuevo gasto de operación
 *     tags: [Gastos Operación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - categoria
 *               - descripcion
 *               - monto
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               categoria:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               metodo_pago:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requireRole('admin', 'gerente', 'supervisor'), gastoOperacionController.create);

router.put('/:id', requireRole('admin', 'gerente', 'supervisor'), gastoOperacionController.update);

router.delete('/:id', requireRole('admin', 'gerente'), gastoOperacionController.delete);

export default router;
