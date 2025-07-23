import { Router } from 'express'
import { 
  getClientes, 
  getClienteById, 
  createCliente, 
  updateCliente,
  deleteCliente,
  getVentasCliente
} from '../controllers/clienteController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes
 */

router.use(authenticateToken)
router.get('/', getClientes)
router.get('/:id', getClienteById)
router.get('/:id/ventas', getVentasCliente)
router.post('/', createCliente)
router.put('/:id', updateCliente)
router.delete('/:id', deleteCliente)

export default router
