import { Router } from 'express';
import { saludAveController } from '../controllers/saludAveController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     SaludAve:
 *       type: object
 *       required:
 *         - id_ave
 *         - fecha
 *         - tipo_tratamiento
 *         - cantidad_muertes
 *       properties:
 *         id_salud:
 *           type: integer
 *           description: ID único del registro de salud
 *         id_ave:
 *           type: integer
 *           description: ID del ave
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del tratamiento
 *         tipo_tratamiento:
 *           type: string
 *           description: Tipo de tratamiento aplicado
 *         medidas:
 *           type: string
 *           description: Medidas aplicadas
 *         cantidad:
 *           type: number
 *           description: Cantidad del tratamiento
 *         descripcion:
 *           type: string
 *           description: Descripción del tratamiento
 *         costo:
 *           type: number
 *           description: Costo del tratamiento
 *         aplicacion_productos:
 *           type: string
 *           description: Productos aplicados
 */

/**
 * @swagger
 * /salud-aves:
 *   get:
 *     summary: Obtener todos los registros de salud de aves
 *     tags: [Salud Aves]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Lista de registros de salud
 *       401:
 *         description: No autorizado
 */
router.get('/', saludAveController.getAll);

/**
 * @swagger
 * /salud-aves/stats:
 *   get:
 *     summary: Obtener estadísticas de salud de aves
 *     tags: [Salud Aves]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Estadísticas de salud
 */
router.get('/stats', saludAveController.getStats);

/**
 * @swagger
 * /salud-aves/{id}:
 *   get:
 *     summary: Obtener registro de salud por ID
 *     tags: [Salud Aves]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Registro de salud encontrado
 *       404:
 *         description: Registro no encontrado
 */
router.get('/:id', saludAveController.getById);

/**
 * @swagger
 * /api/salud-aves:
 *   post:
 *     summary: Crear nuevo registro de salud
 *     tags: [Salud Aves]
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
 *               - id_ave
 *               - fecha
 *               - tipo_tratamiento
 *             properties:
 *               id_ave:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               tipo_tratamiento:
 *                 type: string
 *               medidas:
 *                 type: string
 *               cantidad:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               costo:
 *                 type: number
 *               aplicacion_productos:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requireRole('admin', 'gerente', 'supervisor'), saludAveController.create);

/**
 * @swagger
 * /api/salud-aves/{id}:
 *   put:
 *     summary: Actualizar registro de salud
 *     tags: [Salud Aves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaludAve'
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', requireRole('admin', 'gerente', 'supervisor'), saludAveController.update);

/**
 * @swagger
 * /api/salud-aves/{id}:
 *   delete:
 *     summary: Eliminar registro de salud
 *     tags: [Salud Aves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *     responses:
 *       200:
 *         description: Registro eliminado exitosamente
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', requireRole('admin', 'gerente'), saludAveController.delete);

export default router;
