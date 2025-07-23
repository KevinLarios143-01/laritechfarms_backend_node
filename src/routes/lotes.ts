/**
 * @swagger
 * /lotes:
 *   get:
 *     summary: Obtener lotes
 *     tags: [Lotes]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de lotes
 */

/**
 * @swagger
 * /lotes/{id}:
 *   get:
 *     summary: Obtener lote por ID
 *     tags: [Lotes]
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
 *         description: Datos del lote
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lotes:
 *   post:
 *     summary: Crear nuevo lote
 *     tags: [Lotes]
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
 *               - fecha_inicio
 *               - cantidad
 *               - galera
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Ponedoras, Engorde]
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               cantidad:
 *                 type: integer
 *               galera:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lote creado exitosamente
 */

/**
 * @swagger
 * /lotes/{id}:
 *   put:
 *     summary: Actualizar lote
 *     tags: [Lotes]
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
 *             $ref: '#/components/schemas/Lote'
 *     responses:
 *       200:
 *         description: Lote actualizado exitosamente
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lotes/{id}:
 *   delete:
 *     summary: Eliminar lote
 *     tags: [Lotes]
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
 *         description: Lote eliminado exitosamente
 *       404:
 *         description: Lote no encontrado
 *       400:
 *         description: No se puede eliminar el lote (tiene aves asociadas)
 */
import { Router } from 'express'
import { 
  getLotes, 
  getLoteById, 
  createLote, 
  updateLote, 
  deleteLote 
} from '../controllers/loteController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Lotes
 *   description: Gestión de lotes de aves
 */

// Todas las rutas requieren autenticación - el tenant viene del JWT
router.use(authenticateToken)

router.get('/', getLotes)
router.get('/:id', getLoteById)
router.post('/', createLote)
router.put('/:id', updateLote)
router.delete('/:id', deleteLote)

export default router
