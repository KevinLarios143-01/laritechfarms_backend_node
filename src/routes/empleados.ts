/**
 * @swagger
 * /empleados:
 *   get:
 *     summary: Obtener empleados
 *     tags: [Empleados]
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
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de empleados
 */

/**
 * @swagger
 * /empleados/{id}:
 *   get:
 *     summary: Obtener empleado por ID
 *     tags: [Empleados]
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
 *         description: Datos del empleado
 *       404:
 *         description: Empleado no encontrado
 */

/**
 * @swagger
 * /empleados:
 *   post:
 *     summary: Crear nuevo empleado
 *     tags: [Empleados]
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
 *               - apellido
 *               - puesto
 *               - salario
 *               - fecha_contratacion
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               puesto:
 *                 type: string
 *               salario:
 *                 type: number
 *               fecha_contratacion:
 *                 type: string
 *                 format: date
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 */

/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     summary: Actualizar empleado
 *     tags: [Empleados]
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
 *             $ref: '#/components/schemas/Empleado'
 *     responses:
 *       200:
 *         description: Empleado actualizado exitosamente
 *       404:
 *         description: Empleado no encontrado
 */

/**
 * @swagger
 * /empleados/{id}/asistencia:
 *   post:
 *     summary: Registrar asistencia de empleado
 *     tags: [Empleados]
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
 *               - fecha
 *               - hora_entrada
 *               - estado
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora_entrada:
 *                 type: string
 *                 format: time
 *               hora_salida:
 *                 type: string
 *                 format: time
 *               estado:
 *                 type: string
 *                 enum: [Presente, Tardanza, Ausente, Justificado]
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asistencia registrada exitosamente
 */

/**
 * @swagger
 * /empleados/puestos:
 *   get:
 *     summary: Obtener lista de puestos
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de puestos
 */
import { Router } from 'express'
import { 
  getEmpleados, 
  getEmpleadoById, 
  createEmpleado, 
  updateEmpleado,
  registrarAsistencia,
  getPuestos
} from '../controllers/empleadoController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Gestión de empleados
 */

router.use(authenticateToken)
router.get('/', getEmpleados)
router.get('/puestos', getPuestos)
router.get('/:id', getEmpleadoById)
router.post('/', createEmpleado)
router.put('/:id', updateEmpleado)
router.post('/:id/asistencia', registrarAsistencia)

export default router
