import { Response } from 'express'
import { prisma } from '../services/database'
import { AuthenticatedRequest } from '../types'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  extractPagination, 
  createPaginatedResponse,
  parseFilters,
  validateRequired
} from '../utils/helpers'

/**
 * @swagger
 * components:
 *   schemas:
 *     Empleado:
 *       type: object
 *       properties:
 *         id_empleado:
 *           type: integer
 *         id_tenant:
 *           type: integer
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         puesto:
 *           type: string
 *         salario:
 *           type: number
 *         fecha_contratacion:
 *           type: string
 *           format: date
 *         activo:
 *           type: boolean
 *         telefono:
 *           type: string
 *         correo:
 *           type: string
 */

/**
 * @swagger
 * /empleados:
 *   get:
 *     summary: Obtener empleados
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de empleados
 */
export const getEmpleados = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const pagination = extractPagination(req)
    const filters = parseFilters(req.query)

    const whereClause: any = {
      id_tenant: req.user.id_tenant
    }

    if (filters.activo !== undefined) {
      whereClause.activo = filters.activo
    }

    if (req.query.puesto) {
      whereClause.puesto = req.query.puesto
    }

    if (filters.search) {
      whereClause.OR = [
        {
          nombre: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          apellido: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const [empleados, total] = await Promise.all([
      prisma.empleado.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          _count: {
            select: {
              prestamos: true,
              asistencias: true
            }
          }
        },
        orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }]
      }),
      prisma.empleado.count({ where: whereClause })
    ])

    const response = createPaginatedResponse(empleados, total, pagination)
    res.json(createSuccessResponse(response))

  } catch (error) {
    console.error('Error en getEmpleados:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /empleados/{id}:
 *   get:
 *     summary: Obtener empleado por ID
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       404:
 *         description: Empleado no encontrado
 */
export const getEmpleadoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_empleado = parseInt(req.params.id)

    const empleado = await prisma.empleado.findFirst({
      where: {
        id_empleado,
        id_tenant: req.user.id_tenant
      },
      include: {
        prestamos: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        asistencias: {
          orderBy: { fecha: 'desc' },
          take: 30
        }
      }
    })

    if (!empleado) {
      return res.status(404).json(createErrorResponse('Empleado no encontrado', 404))
    }

    res.json(createSuccessResponse(empleado))

  } catch (error) {
    console.error('Error en getEmpleadoById:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /empleados:
 *   post:
 *     summary: Crear nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - puesto
 *               - salario
 *               - fecha_contratacion
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               puesto:
 *                 type: string
 *               salario:
 *                 type: number
 *               fecha_contratacion:
 *                 type: string
 *                 format: date
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 */
export const createEmpleado = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const { nombre, apellido, puesto, salario, fecha_contratacion, telefono, correo } = req.body

    const missing = validateRequired({ nombre, apellido, puesto, salario, fecha_contratacion })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    const empleado = await prisma.empleado.create({
      data: {
        id_tenant: req.user.id_tenant,
        nombre,
        apellido,
        puesto,
        salario: parseFloat(salario),
        fecha_contratacion: new Date(fecha_contratacion),
        telefono: telefono || null,
        correo: correo || null
      }
    })

    res.status(201).json(createSuccessResponse(empleado, 'Empleado creado exitosamente'))

  } catch (error) {
    console.error('Error en createEmpleado:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     summary: Actualizar empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empleado'
 *     responses:
 *       200:
 *         description: Empleado actualizado exitosamente
 *       404:
 *         description: Empleado no encontrado
 */
export const updateEmpleado = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_empleado = parseInt(req.params.id)
    const { nombre, apellido, puesto, salario, activo, telefono, correo } = req.body

    const empleadoExistente = await prisma.empleado.findFirst({
      where: {
        id_empleado,
        id_tenant: req.user.id_tenant
      }
    })

    if (!empleadoExistente) {
      return res.status(404).json(createErrorResponse('Empleado no encontrado', 404))
    }

    const empleadoActualizado = await prisma.empleado.update({
      where: { id_empleado },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(puesto && { puesto }),
        ...(salario && { salario: parseFloat(salario) }),
        ...(activo !== undefined && { activo }),
        ...(telefono !== undefined && { telefono }),
        ...(correo !== undefined && { correo })
      }
    })

    res.json(createSuccessResponse(empleadoActualizado, 'Empleado actualizado exitosamente'))

  } catch (error) {
    console.error('Error en updateEmpleado:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /empleados/{id}/asistencia:
 *   post:
 *     summary: Registrar asistencia de empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - hora_entrada
 *               - estado
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora_entrada:
 *                 type: string
 *                 format: time
 *               hora_salida:
 *                 type: string
 *                 format: time
 *               estado:
 *                 type: string
 *                 enum: [Presente, Tardanza, Ausente, Justificado]
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asistencia registrada exitosamente
 */
export const registrarAsistencia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const id_empleado = parseInt(req.params.id)
    const { fecha, hora_entrada, hora_salida, estado, observaciones } = req.body

    const missing = validateRequired({ fecha, hora_entrada, estado })
    if (missing.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Campos requeridos: ${missing.join(', ')}`, 400)
      )
    }

    // Verificar que el empleado existe
    const empleado = await prisma.empleado.findFirst({
      where: {
        id_empleado,
        id_tenant: req.user.id_tenant
      }
    })

    if (!empleado) {
      return res.status(404).json(createErrorResponse('Empleado no encontrado', 404))
    }

    // Verificar si ya existe asistencia para esta fecha
    const asistenciaExistente = await prisma.asistencia.findFirst({
      where: {
        id_empleado,
        id_tenant: req.user.id_tenant,
        fecha: new Date(fecha)
      }
    })

    if (asistenciaExistente) {
      return res.status(400).json(
        createErrorResponse('Ya existe un registro de asistencia para esta fecha', 400)
      )
    }

    const asistencia = await prisma.asistencia.create({
      data: {
        id_tenant: req.user.id_tenant,
        id_empleado,
        fecha: new Date(fecha),
        hora_entrada: new Date(`1970-01-01T${hora_entrada}`),
        hora_salida: hora_salida ? new Date(`1970-01-01T${hora_salida}`) : null,
        estado,
        observaciones: observaciones || null,
        id_usuario_registro: req.user.id_usuario
      }
    })

    res.status(201).json(createSuccessResponse(asistencia, 'Asistencia registrada exitosamente'))

  } catch (error) {
    console.error('Error en registrarAsistencia:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}

/**
 * @swagger
 * /empleados/puestos:
 *   get:
 *     summary: Obtener lista de puestos
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Lista de puestos
 */
export const getPuestos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('No autorizado', 401))
    }

    const puestos = await prisma.empleado.groupBy({
      by: ['puesto'],
      where: {
        id_tenant: req.user.id_tenant
      },
      _count: {
        puesto: true
      }
    })

    res.json(createSuccessResponse(puestos))

  } catch (error) {
    console.error('Error en getPuestos:', error)
    res.status(500).json(createErrorResponse('Error interno del servidor'))
  }
}
