import { Router } from 'express'
import authRoutes from './auth'
import loteRoutes from './lotes'
import aveRoutes from './aves'
import productoRoutes from './productos'
import ventaRoutes from './ventas'
import clienteRoutes from './clientes'
import empleadoRoutes from './empleados'
import inventarioRoutes from './inventario'
import saludAvesRoutes from './saludAves'
import controlMuertesRoutes from './controlMuertes'
import controlHuevosRoutes from './controlHuevos'
import vehiculosRoutes from './vehiculos'
import gastoOperacionRoutes from './gastosOperacion'
import prestamosEmpleadosRoutes from './prestamosEmpleados'
import asistenciasRoutes from './asistencias'

const router = Router()

/**
 * @swagger
 * /test:
 *   get:
 *     summary: API Status
 *     description: Endpoint para verificar el estado de la API
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 */

// API Status endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'LariTechFarms API v1.0.0 - Sistema de Gestión Avícola',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: [
      '/api/v1/auth - Autenticación',
      '/api/v1/lotes - Gestión de lotes',
      '/api/v1/aves - Gestión de aves',
      '/api/v1/productos - Gestión de productos',
      '/api/v1/ventas - Gestión de ventas',
      '/api/v1/clientes - Gestión de clientes',
      '/api/v1/empleados - Gestión de empleados',
      '/api/v1/inventario - Gestión de inventario',
      '/api/v1/salud-aves - Control de salud de aves',
      '/api/v1/control-muertes - Control de muertes',
      '/api/v1/control-huevos - Control de producción de huevos',
      '/api/v1/vehiculos - Gestión de vehículos',
      '/api/v1/gastos-operacion - Gastos de operación',
      '/api/v1/prestamos-empleados - Préstamos a empleados',
      '/api/v1/asistencias - Control de asistencia'
    ]
  })
})

// Route modules
router.use('/auth', authRoutes)
router.use('/lotes', loteRoutes)
router.use('/aves', aveRoutes)
router.use('/productos', productoRoutes)
router.use('/ventas', ventaRoutes)
router.use('/clientes', clienteRoutes)
router.use('/empleados', empleadoRoutes)
router.use('/inventario', inventarioRoutes)
router.use('/salud-aves', saludAvesRoutes)
router.use('/control-muertes', controlMuertesRoutes)
router.use('/control-huevos', controlHuevosRoutes)
router.use('/vehiculos', vehiculosRoutes)
router.use('/gastos-operacion', gastoOperacionRoutes)
router.use('/prestamos-empleados', prestamosEmpleadosRoutes)
router.use('/asistencias', asistenciasRoutes)

// TODO: Próximas implementaciones
// router.use('/reportes', reporteRoutes)
// router.use('/concentrado', concentradoRoutes)

export default router
