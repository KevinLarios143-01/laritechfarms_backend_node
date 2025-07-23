import { Router } from 'express';
import { controlHuevosController } from '../controllers/controlHuevosController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     ControlHuevos:
 *       type: object
 *       required:
 *         - fecha
 *         - cantidad_huevos
 *       properties:
 *         id_control_huevos:
 *           type: integer
 *           description: ID único del registro
 *         id_ave:
 *           type: integer
 *           description: ID del ave (opcional)
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del control
 *         cantidad_huevos:
 *           type: integer
 *           description: Cantidad de huevos producidos
 *         calidad:
 *           type: string
 *           enum: [Excelente, Buena, Regular, Mala]
 *           description: Calidad de los huevos
 */

/**
 * @swagger
 * /control-huevos:
 *   get:
 *     summary: Obtener todos los registros de control de huevos
 *     tags: [Control Huevos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de control de huevos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 items: [{ id_control_huevos: 1, id_tenant: 1, id_ave: 1, fecha: "2025-07-22", cantidad_huevos: 180, calidad: "Excelente", id_usuario: 1 }]
 *                 total: 1
 *                 page: 1
 *                 limit: 10
 *               message: null
 *       401:
 *         description: No autorizado
 */
router.get('/', controlHuevosController.getAll);

/**
 * @swagger
 * /control-huevos/stats:
 *   get:
 *     summary: Obtener estadísticas de control de huevos
 *     tags: [Control Huevos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de control de huevos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalRegistros: 3
 *                 totalHuevos: 540
 *                 promedioHuevosPorRegistro: 180
 *                 huevosPorCalidad: [{ calidad: "Excelente", _sum: { cantidad_huevos: 540 } }]
 *                 produccionPorDia: [{ fecha: "2025-07-22", _sum: { cantidad_huevos: 180 } }]
 *               message: null
 *       401:
 *         description: No autorizado
 */
router.get('/stats', controlHuevosController.getStats);

router.get('/:id', controlHuevosController.getById);

/**
 * @swagger
 * /control-huevos:
 *   post:
 *     summary: Crear nuevo registro de control de huevos
 *     tags: [Control Huevos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - cantidad_huevos
 *             properties:
 *               id_ave:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               cantidad_huevos:
 *                 type: integer
 *               calidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_control_huevos: 2
 *                 id_tenant: 1
 *                 id_ave: 1
 *                 fecha: "2025-07-23"
 *                 cantidad_huevos: 200
 *                 calidad: "Buena"
 *                 id_usuario: 1
 *               message: "Registro de control de huevos creado exitosamente"
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requireRole('admin', 'gerente', 'supervisor'), controlHuevosController.create);

router.put('/:id', requireRole('admin', 'gerente', 'supervisor'), controlHuevosController.update);

router.delete('/:id', requireRole('admin', 'gerente'), controlHuevosController.delete);

export default router;
