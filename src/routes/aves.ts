/**
 * @swagger
 * /aves:
 *   get:
 *     summary: Obtener aves
 *     tags: [Aves]
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
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_lote
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de aves
 */

/**
 * @swagger
 * /aves/{id}:
 *   get:
 *     summary: Obtener ave por ID
 *     tags: [Aves]
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
 *         description: Datos del ave
 *       404:
 *         description: Ave no encontrada
 */

/**
 * @swagger
 * /aves:
 *   post:
 *     summary: Crear nueva ave
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - edad
 *               - estado
 *               - fecha_ingreso
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Ponedoras, Engorde]
 *               edad:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [Viva, Muerta, Vendida, Descarte]
 *               peso:
 *                 type: number
 *               id_lote:
 *                 type: integer
 *               fecha_ingreso:
 *                 type: string
 *                 format: date
 *               produccion_huevos:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ave creada exitosamente
 */

/**
 * @swagger
 * /aves/{id}:
 *   put:
 *     summary: Actualizar ave
 *     tags: [Aves]
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
 *             $ref: '#/components/schemas/Ave'
 *     responses:
 *       200:
 *         description: Ave actualizada exitosamente
 *       404:
 *         description: Ave no encontrada
 */

/**
 * @swagger
 * /aves/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de aves
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de aves
 */
import { Router } from 'express'
import { 
  getAves, 
  getAveById, 
  createAve, 
  updateAve,
  getEstadisticasAves
} from '../controllers/aveController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Aves
 *   description: Gestión de aves
 */

router.use(authenticateToken)
router.get('/', getAves)
router.get('/estadisticas', getEstadisticasAves)
router.get('/:id', getAveById)
router.post('/', createAve)
router.put('/:id', updateAve)

export default router
