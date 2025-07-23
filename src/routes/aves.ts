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
