import { Router } from 'express'
import { 
  getInventario, 
  getInventarioById, 
  createInventario, 
  updateInventario,
  updateStock,
  getCategorias,
  getAlertas
} from '../controllers/inventarioController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de inventario de granja
 */

router.use(authenticateToken)
router.get('/', getInventario)
router.get('/categorias', getCategorias)
router.get('/alertas', getAlertas)
router.get('/:id', getInventarioById)
router.post('/', createInventario)
router.put('/:id', updateInventario)
router.patch('/:id/stock', updateStock)

export default router
