import { Router } from 'express';
import { asistenciaController } from '../controllers/asistenciaController';
import { authenticateToken, requireRole  } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
router.get('/', asistenciaController.getAll);
router.get('/stats', asistenciaController.getStats);
router.get('/:id', asistenciaController.getById);
router.post('/', requireRole('admin', 'gerente', 'supervisor'), asistenciaController.create);
router.put('/:id', requireRole('admin', 'gerente', 'supervisor'), asistenciaController.update);
router.delete('/:id', requireRole('admin', 'gerente'), asistenciaController.delete);

export default router;
