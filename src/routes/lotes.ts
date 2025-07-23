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
