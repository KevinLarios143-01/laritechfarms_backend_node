import { Router } from 'express';
import { prestamoEmpleadoController } from '../controllers/prestamoEmpleadoController';
import { authenticateToken, requireRole  } from '../middleware/auth';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
router.get('/', prestamoEmpleadoController.getAll);
router.get('/stats', prestamoEmpleadoController.getStats);
router.get('/:id', prestamoEmpleadoController.getById);
router.post('/', requireRole('admin', 'gerente'), prestamoEmpleadoController.create);
router.put('/:id', requireRole('admin', 'gerente'), prestamoEmpleadoController.update);
router.delete('/:id', requireRole('admin'), prestamoEmpleadoController.delete);

export default router;
