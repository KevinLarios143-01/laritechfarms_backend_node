import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const gastoOperacionController = {
  // GET /api/gastos-operacion
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { categoria, fecha_inicio, fecha_fin, metodo_pago } = req.query;

      const where: any = { id_tenant };
      
      if (categoria) {
        where.categoria = categoria as string;
      }

      if (metodo_pago) {
        where.metodo_pago = metodo_pago as string;
      }

      if (fecha_inicio && fecha_fin) {
        where.fecha = {
          gte: new Date(fecha_inicio as string),
          lte: new Date(fecha_fin as string)
        };
      }

      const [gastos, total] = await Promise.all([
        prisma.gastoOperacion.findMany({
          where,
          include: {
            usuario: {
              select: { id_usuario: true, nombre: true, apellido: true, email: true }
            }
          },
          orderBy: { fecha: 'desc' },
          skip: pagination.skip,
          take: pagination.limit
        }),
        prisma.gastoOperacion.count({ where })
      ]);

      res.json(createPaginatedResponse(gastos, total, pagination));
    } catch (error) {
      console.error('Error al obtener gastos de operación:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/gastos-operacion/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_gasto = parseInt(req.params.id!);

      const gasto = await prisma.gastoOperacion.findFirst({
        where: { id_gasto, id_tenant },
        include: {
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!gasto) {
        return res.status(404).json(createErrorResponse('Gasto de operación no encontrado'));
      }

      res.json(createSuccessResponse(gasto));
    } catch (error) {
      console.error('Error al obtener gasto de operación:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/gastos-operacion
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        fecha, 
        categoria, 
        descripcion, 
        monto,
        metodo_pago
      } = req.body;

      const nuevoGasto = await prisma.gastoOperacion.create({
        data: {
          id_tenant,
          fecha: new Date(fecha),
          categoria,
          descripcion,
          monto: parseFloat(monto),
          metodo_pago,
          id_usuario
        },
        include: {
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevoGasto, 'Gasto de operación creado exitosamente'));
    } catch (error) {
      console.error('Error al crear gasto de operación:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/gastos-operacion/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_gasto = parseInt(req.params.id!);
      const { 
        fecha, 
        categoria, 
        descripcion, 
        monto,
        metodo_pago
      } = req.body;

      // Verificar que el gasto existe
      const gastoExistente = await prisma.gastoOperacion.findFirst({
        where: { id_gasto, id_tenant }
      });

      if (!gastoExistente) {
        return res.status(404).json(createErrorResponse('Gasto de operación no encontrado'));
      }

      const gastoActualizado = await prisma.gastoOperacion.update({
        where: { id_gasto },
        data: {
          ...(fecha && { fecha: new Date(fecha) }),
          ...(categoria && { categoria }),
          ...(descripcion !== undefined && { descripcion }),
          ...(monto !== undefined && { monto: parseFloat(monto) }),
          ...(metodo_pago !== undefined && { metodo_pago })
        },
        include: {
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(gastoActualizado, 'Gasto de operación actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar gasto de operación:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/gastos-operacion/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_gasto = parseInt(req.params.id!);

      const gastoExistente = await prisma.gastoOperacion.findFirst({
        where: { id_gasto, id_tenant }
      });

      if (!gastoExistente) {
        return res.status(404).json(createErrorResponse('Gasto de operación no encontrado'));
      }

      await prisma.gastoOperacion.delete({
        where: { id_gasto }
      });

      res.json(createSuccessResponse(null, 'Gasto de operación eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar gasto de operación:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/gastos-operacion/stats
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
        totalGastos,
        montoTotal,
        gastosPorCategoria,
        gastosPorMetodoPago,
        gastosPorDia
      ] = await Promise.all([
        prisma.gastoOperacion.count({ where }),
        prisma.gastoOperacion.aggregate({
          where,
          _sum: { monto: true },
          _avg: { monto: true }
        }),
        prisma.gastoOperacion.groupBy({
          by: ['categoria'],
          where,
          _sum: { monto: true },
          _count: { id_gasto: true },
          orderBy: { _sum: { monto: 'desc' } }
        }),
        prisma.gastoOperacion.groupBy({
          by: ['metodo_pago'],
          where: { ...where, metodo_pago: { not: null } },
          _sum: { monto: true },
          orderBy: { _sum: { monto: 'desc' } }
        }),
        prisma.gastoOperacion.groupBy({
          by: ['fecha'],
          where,
          _sum: { monto: true },
          orderBy: { fecha: 'asc' }
        })
      ]);

      res.json(createSuccessResponse({
        totalGastos,
        montoTotal: montoTotal._sum.monto || 0,
        promedioGasto: montoTotal._avg.monto || 0,
        gastosPorCategoria,
        gastosPorMetodoPago,
        gastosPorDia
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de gastos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
