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
