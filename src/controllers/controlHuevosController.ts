import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const controlHuevosController = {
  // GET /api/control-huevos
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { id_ave, fecha_inicio, fecha_fin, calidad } = req.query;

      const where: any = { id_tenant };
      
      if (id_ave) {
        where.id_ave = parseInt(id_ave as string);
      }

      if (fecha_inicio && fecha_fin) {
        where.fecha = {
          gte: new Date(fecha_inicio as string),
          lte: new Date(fecha_fin as string)
        };
      }

      if (calidad) {
        where.calidad = calidad as string;
      }

      // LOG para depuración
      console.log('🔍 Filtro usado en controlHuevos:', JSON.stringify(where));
      console.log('🔍 Paginación:', pagination);

      const [registros, total] = await Promise.all([
        prisma.controlHuevos.findMany({
          where,
          include: {
            ave: true,
            usuario: {
              select: { id_usuario: true, nombre: true, apellido: true, email: true }
            }
          },
          orderBy: { fecha: 'desc' },
          skip: pagination.skip,
          take: pagination.limit
        }),
        prisma.controlHuevos.count({ where })
      ]);

      console.log('🔍 Registros encontrados:', registros.length);

      res.json(createPaginatedResponse(registros, total, pagination));
    } catch (error) {
      console.error('Error al obtener registros de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/control-huevos/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_huevos = parseInt(req.params.id!);

      const registro = await prisma.controlHuevos.findFirst({
        where: { id_control_huevos, id_tenant },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!registro) {
        return res.status(404).json(createErrorResponse('Registro de control de huevos no encontrado'));
      }

      res.json(createSuccessResponse(registro));
    } catch (error) {
      console.error('Error al obtener registro de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/control-huevos
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        id_ave, 
        fecha, 
        cantidad_huevos,
        calidad
      } = req.body;

      // Si se especifica un ave, verificar que existe y pertenece al tenant
      if (id_ave) {
        const ave = await prisma.ave.findFirst({
          where: { id_ave, id_tenant }
        });

        if (!ave) {
          return res.status(404).json(createErrorResponse('Ave no encontrada'));
        }
      }

      const nuevoRegistro = await prisma.controlHuevos.create({
        data: {
          id_tenant,
          id_ave: id_ave || null,
          fecha: new Date(fecha),
          cantidad_huevos: parseInt(cantidad_huevos),
          calidad,
          id_usuario
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevoRegistro, 'Registro de control de huevos creado exitosamente'));
    } catch (error) {
      console.error('Error al crear registro de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/control-huevos/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_huevos = parseInt(req.params.id!);
      const { 
        id_ave, 
        fecha, 
        cantidad_huevos,
        calidad
      } = req.body;

      // Verificar que el registro existe
      const registroExistente = await prisma.controlHuevos.findFirst({
        where: { id_control_huevos, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de control de huevos no encontrado'));
      }

      // Si se cambia el ave, verificar que existe y pertenece al tenant
      if (id_ave && id_ave !== registroExistente.id_ave) {
        const ave = await prisma.ave.findFirst({
          where: { id_ave, id_tenant }
        });

        if (!ave) {
          return res.status(404).json(createErrorResponse('Ave no encontrada'));
        }
      }

      const registroActualizado = await prisma.controlHuevos.update({
        where: { id_control_huevos_id_tenant: { id_control_huevos, id_tenant } },
        data: {
          ...(id_ave !== undefined && { id_ave: id_ave || null }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(cantidad_huevos !== undefined && { cantidad_huevos: parseInt(cantidad_huevos) }),
          ...(calidad !== undefined && { calidad })
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(registroActualizado, 'Registro de control de huevos actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar registro de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/control-huevos/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_huevos = parseInt(req.params.id!);

      const registroExistente = await prisma.controlHuevos.findFirst({
        where: { id_control_huevos, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de control de huevos no encontrado'));
      }

      await prisma.controlHuevos.delete({
        where: { id_control_huevos_id_tenant: { id_control_huevos, id_tenant } }
      });

      res.json(createSuccessResponse(null, 'Registro de control de huevos eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar registro de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/control-huevos/stats
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
        totalRegistros,
        totalHuevos,
        huevosPorCalidad,
        produccionPorDia
      ] = await Promise.all([
        prisma.controlHuevos.count({ where }),
        prisma.controlHuevos.aggregate({
          where,
          _sum: { cantidad_huevos: true },
          _avg: { cantidad_huevos: true }
        }),
        prisma.controlHuevos.groupBy({
          by: ['calidad'],
          where: { ...where, calidad: { not: null } },
          _sum: { cantidad_huevos: true },
          orderBy: { _sum: { cantidad_huevos: 'desc' } }
        }),
        prisma.controlHuevos.groupBy({
          by: ['fecha'],
          where,
          _sum: { cantidad_huevos: true },
          orderBy: { fecha: 'asc' }
        })
      ]);

      res.json(createSuccessResponse({
        totalRegistros,
        totalHuevos: totalHuevos._sum.cantidad_huevos || 0,
        promedioHuevosPorRegistro: totalHuevos._avg.cantidad_huevos || 0,
        huevosPorCalidad,
        produccionPorDia
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de control de huevos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
