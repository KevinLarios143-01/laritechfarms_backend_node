import { Router } from 'express'
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto,
  updateStock,
  getCategorias
} from '../controllers/productoController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

router.use(authenticateToken)

router.get('/', getProductos)
router.get('/categorias', getCategorias)
router.get('/:id', getProductoById)
router.post('/', createProducto)
router.put('/:id', updateProducto)
router.patch('/:id/stock', updateStock)

export default router
