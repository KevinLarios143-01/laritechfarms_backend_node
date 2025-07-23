import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const prestamoEmpleadoController = {
  // GET /api/prestamos-empleados
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { id_empleado, estado, fecha_inicio, fecha_fin } = req.query;

      const where: any = { id_tenant };
      
      if (id_empleado) {
        where.id_empleado = parseInt(id_empleado as string);
      }

      if (estado) {
        where.estado = estado as string;
      }

      if (fecha_inicio && fecha_fin) {
        where.fecha = {
          gte: new Date(fecha_inicio as string),
          lte: new Date(fecha_fin as string)
        };
      }

      const [prestamos, total] = await Promise.all([
        prisma.prestamoEmpleado.findMany({
          where,
          include: {
            empleado: true,
            usuario: {
              select: { id_usuario: true, nombre: true, apellido: true, email: true }
            }
          },
          orderBy: { fecha: 'desc' },
          skip: pagination.skip,
          take: pagination.limit
        }),
        prisma.prestamoEmpleado.count({ where })
      ]);

      res.json(createPaginatedResponse(prestamos, total, pagination));
    } catch (error) {
      console.error('Error al obtener préstamos de empleados:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/prestamos-empleados/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_prestamo = parseInt(req.params.id!);

      const prestamo = await prisma.prestamoEmpleado.findFirst({
        where: { id_prestamo, id_tenant },
        include: {
          empleado: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!prestamo) {
        return res.status(404).json(createErrorResponse('Préstamo no encontrado'));
      }

      res.json(createSuccessResponse(prestamo));
    } catch (error) {
      console.error('Error al obtener préstamo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/prestamos-empleados
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        id_empleado, 
        fecha, 
        monto, 
        descripcion,
        estado,
        cuotas
      } = req.body;

      // Verificar que el empleado existe y pertenece al tenant
      const empleado = await prisma.empleado.findFirst({
        where: { id_empleado, id_tenant }
      });

      if (!empleado) {
        return res.status(404).json(createErrorResponse('Empleado no encontrado'));
      }

      const nuevoPrestamo = await prisma.prestamoEmpleado.create({
        data: {
          id_tenant,
          id_empleado,
          fecha: new Date(fecha),
          monto: parseFloat(monto),
          descripcion,
          estado: estado || 'Pendiente',
          cuotas: cuotas ? parseInt(cuotas) : null,
          id_usuario
        },
        include: {
          empleado: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevoPrestamo, 'Préstamo creado exitosamente'));
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/prestamos-empleados/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_prestamo = parseInt(req.params.id!);
      const { 
        id_empleado, 
        fecha, 
        monto, 
        descripcion,
        estado,
        cuotas
      } = req.body;

      // Verificar que el préstamo existe
      const prestamoExistente = await prisma.prestamoEmpleado.findFirst({
        where: { id_prestamo, id_tenant }
      });

      if (!prestamoExistente) {
        return res.status(404).json(createErrorResponse('Préstamo no encontrado'));
      }

      // Si se cambia el empleado, verificar que existe y pertenece al tenant
      if (id_empleado && id_empleado !== prestamoExistente.id_empleado) {
        const empleado = await prisma.empleado.findFirst({
          where: { id_empleado, id_tenant }
        });

        if (!empleado) {
          return res.status(404).json(createErrorResponse('Empleado no encontrado'));
        }
      }

      const prestamoActualizado = await prisma.prestamoEmpleado.update({
        where: { id_prestamo },
        data: {
          ...(id_empleado && { id_empleado }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(monto !== undefined && { monto: parseFloat(monto) }),
          ...(descripcion !== undefined && { descripcion }),
          ...(estado && { estado }),
          ...(cuotas !== undefined && { cuotas: cuotas ? parseInt(cuotas) : null })
        },
        include: {
          empleado: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(prestamoActualizado, 'Préstamo actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar préstamo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/prestamos-empleados/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_prestamo = parseInt(req.params.id!);

      const prestamoExistente = await prisma.prestamoEmpleado.findFirst({
        where: { id_prestamo, id_tenant }
      });

      if (!prestamoExistente) {
        return res.status(404).json(createErrorResponse('Préstamo no encontrado'));
      }

      await prisma.prestamoEmpleado.delete({
        where: { id_prestamo }
      });

      res.json(createSuccessResponse(null, 'Préstamo eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar préstamo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/prestamos-empleados/stats
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const { fecha_inicio, fecha_fin } = req.query;

      const where: any = { id_tenant };
      
      if (fecha_inicio && fecha_fin) {
        where.fecha = {
          gte: new Date(fecha_inicio as string),
          lte: new Date(fecha_fin as string)
        };
      }

      const [
        totalPrestamos,
        montoTotal,
        prestamosPorEstado,
        prestamosPorEmpleado
      ] = await Promise.all([
        prisma.prestamoEmpleado.count({ where }),
        prisma.prestamoEmpleado.aggregate({
          where,
          _sum: { monto: true },
          _avg: { monto: true }
        }),
        prisma.prestamoEmpleado.groupBy({
          by: ['estado'],
          where,
          _sum: { monto: true },
          _count: { id_prestamo: true },
          orderBy: { _sum: { monto: 'desc' } }
        }),
        prisma.prestamoEmpleado.groupBy({
          by: ['id_empleado'],
          where,
          _sum: { monto: true },
          _count: { id_prestamo: true },
          orderBy: { _sum: { monto: 'desc' } },
          take: 10
        })
      ]);

      res.json(createSuccessResponse({
        totalPrestamos,
        montoTotal: montoTotal._sum.monto || 0,
        promedioMonto: montoTotal._avg.monto || 0,
        prestamosPorEstado,
        prestamosPorEmpleado
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de préstamos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
