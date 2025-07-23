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

router.use(authenticateToken)
router.get('/', getVentas)
router.get('/estadisticas', getEstadisticasVentas)
router.get('/:id', getVentaById)
router.post('/', createVenta)
router.patch('/:id/estado', updateEstadoVenta)

export default router
