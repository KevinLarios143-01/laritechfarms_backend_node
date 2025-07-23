import { Router } from 'express';
import { vehiculoController } from '../controllers/vehiculoController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     Vehiculo:
 *       type: object
 *       required:
 *         - tipo
 *         - placa
 *         - marca
 *         - modelo
 *       properties:
 *         id_vehiculo:
 *           type: integer
 *           description: ID único del vehículo
 *         tipo:
 *           type: string
 *           description: Tipo de vehículo
 *         placa:
 *           type: string
 *           description: Placa del vehículo
 *         marca:
 *           type: string
 *           description: Marca del vehículo
 *         modelo:
 *           type: string
 *           description: Modelo del vehículo
 *         anio:
 *           type: integer
 *           description: Año del vehículo
 *         estado:
 *           type: string
 *           enum: [Activo, Mantenimiento, Inactivo]
 *           description: Estado del vehículo
 *         capacidad:
 *           type: number
 *           description: Capacidad del vehículo
 *         fecha_adquisicion:
 *           type: string
 *           format: date
 *           description: Fecha de adquisición
 */

/**
 * @swagger
 * /vehiculos:
 *   get:
 *     summary: Obtener todos los vehículos
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *       401:
 *         description: No autorizado
 */
router.get('/', vehiculoController.getAll);

/**
 * @swagger
 * /vehiculos/stats:
 *   get:
 *     summary: Obtener estadísticas de vehículos
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     # parameters removido: no hay headers personalizados
 *     responses:
 *       200:
 *         description: Estadísticas de vehículos
 */
router.get('/stats', vehiculoController.getStats);

router.get('/:id', vehiculoController.getById);

/**
 * @swagger
 * /vehiculos:
 *   post:
 *     summary: Crear nuevo vehículo
 *     tags: [Vehículos]
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
 *               - tipo
 *               - placa
 *               - marca
 *               - modelo
 *             properties:
 *               tipo:
 *                 type: string
 *               placa:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               anio:
 *                 type: integer
 *               estado:
 *                 type: string
 *               capacidad:
 *                 type: number
 *               fecha_adquisicion:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requireRole('admin', 'gerente'), vehiculoController.create);

router.put('/:id', requireRole('admin', 'gerente'), vehiculoController.update);

router.delete('/:id', requireRole('admin'), vehiculoController.delete);

export default router;
