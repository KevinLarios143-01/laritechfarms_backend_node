import { Router } from 'express';
import { controlMuertesController } from '../controllers/controlMuertesController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     ControlMuertes:
 *       type: object
 *       required:
 *         - fecha
 *         - cantidad_muertes
 *       properties:
 *         id_control_muertes:
 *           type: integer
 *           description: ID único del registro
 *         id_ave:
 *           type: integer
 *           description: ID del ave (opcional)
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del control
 *         cantidad_muertes:
 *           type: integer
 *           description: Cantidad de muertes registradas
 *         causa_principal:
 *           type: string
 *           description: Causa principal de las muertes
 *         accion_correctiva:
 *           type: string
 *           description: Acción correctiva tomada
 */

/**
 * @swagger
 * /control-muertes:
 *   get:
 *     summary: Obtener todos los registros de control de muertes
 *     tags: [Control Muertes]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Lista de registros de control de muertes
 *       401:
 *         description: No autorizado
 */
router.get('/', controlMuertesController.getAll);

/**
 * @swagger
 * /control-muertes/stats:
 *   get:
 *     summary: Obtener estadísticas de control de muertes
 *     tags: [Control Muertes]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Estadísticas de control de muertes
 */
router.get('/stats', controlMuertesController.getStats);

router.get('/:id', controlMuertesController.getById);

/**
 * @swagger
 * /control-muertes:
 *   post:
 *     summary: Crear nuevo registro de control de muertes
 *     tags: [Control Muertes]
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
 *               - cantidad_muertes
 *             properties:
 *               id_ave:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               cantidad_muertes:
 *                 type: integer
 *               causa_principal:
 *                 type: string
 *               accion_correctiva:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requireRole('admin', 'gerente', 'supervisor'), controlMuertesController.create);

router.put('/:id', requireRole('admin', 'gerente', 'supervisor'), controlMuertesController.update);

router.delete('/:id', requireRole('admin', 'gerente'), controlMuertesController.delete);

export default router;
