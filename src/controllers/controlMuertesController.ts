import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const controlMuertesController = {
  // GET /api/control-muertes
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { id_ave, fecha_inicio, fecha_fin } = req.query;

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

      const [registros, total] = await Promise.all([
        prisma.controlMuertes.findMany({
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
        prisma.controlMuertes.count({ where })
      ]);

      res.json(createPaginatedResponse(registros, total, pagination));
    } catch (error) {
      console.error('Error al obtener registros de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/control-muertes/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_muertes = parseInt(req.params.id!);

      const registro = await prisma.controlMuertes.findFirst({
        where: { id_control_muertes, id_tenant },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!registro) {
        return res.status(404).json(createErrorResponse('Registro de control de muertes no encontrado'));
      }

      res.json(createSuccessResponse(registro));
    } catch (error) {
      console.error('Error al obtener registro de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/control-muertes
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        id_ave, 
        fecha, 
        cantidad_muertes,
        causa_principal, 
        accion_correctiva
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

      const nuevoRegistro = await prisma.controlMuertes.create({
        data: {
          id_tenant,
          id_ave: id_ave || null,
          fecha: new Date(fecha),
          cantidad_muertes: parseInt(cantidad_muertes),
          causa_principal,
          accion_correctiva,
          id_usuario
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevoRegistro, 'Registro de control de muertes creado exitosamente'));
    } catch (error) {
      console.error('Error al crear registro de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/control-muertes/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_muertes = parseInt(req.params.id!);
      const { 
        id_ave, 
        fecha, 
        cantidad_muertes,
        causa_principal, 
        accion_correctiva
      } = req.body;

      // Verificar que el registro existe
      const registroExistente = await prisma.controlMuertes.findFirst({
        where: { id_control_muertes, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de control de muertes no encontrado'));
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

      const registroActualizado = await prisma.controlMuertes.update({
        where: { id_control_muertes_id_tenant: { id_control_muertes, id_tenant } },
        data: {
          ...(id_ave !== undefined && { id_ave: id_ave || null }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(cantidad_muertes !== undefined && { cantidad_muertes: parseInt(cantidad_muertes) }),
          ...(causa_principal !== undefined && { causa_principal }),
          ...(accion_correctiva !== undefined && { accion_correctiva })
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(registroActualizado, 'Registro de control de muertes actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar registro de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/control-muertes/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_control_muertes = parseInt(req.params.id!);

      const registroExistente = await prisma.controlMuertes.findFirst({
        where: { id_control_muertes, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de control de muertes no encontrado'));
      }

      await prisma.controlMuertes.delete({
        where: { id_control_muertes_id_tenant: { id_control_muertes, id_tenant } }
      });

      res.json(createSuccessResponse(null, 'Registro de control de muertes eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar registro de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/control-muertes/stats
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
        totalMuertes,
        causasPrincipales,
        muertesPorDia
      ] = await Promise.all([
        prisma.controlMuertes.count({ where }),
        prisma.controlMuertes.aggregate({
          where,
          _sum: { cantidad_muertes: true }
        }),
        prisma.controlMuertes.groupBy({
          by: ['causa_principal'],
          where: { ...where, causa_principal: { not: null } },
          _sum: { cantidad_muertes: true },
          orderBy: { _sum: { cantidad_muertes: 'desc' } }
        }),
        prisma.controlMuertes.groupBy({
          by: ['fecha'],
          where,
          _sum: { cantidad_muertes: true },
          orderBy: { fecha: 'asc' }
        })
      ]);

      res.json(createSuccessResponse({
        totalRegistros,
        totalMuertes: totalMuertes._sum.cantidad_muertes || 0,
        causasPrincipales,
        muertesPorDia
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de control de muertes:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
