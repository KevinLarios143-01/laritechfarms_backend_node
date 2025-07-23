import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const saludAveController = {
  // GET /api/salud-aves
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { id_ave } = req.query;

      const where: any = { id_tenant };
      
      if (id_ave) {
        where.id_ave = parseInt(id_ave as string);
      }

      const [registros, total] = await Promise.all([
        prisma.saludAve.findMany({
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
        prisma.saludAve.count({ where })
      ]);

      res.json(createPaginatedResponse(registros, total, pagination));
    } catch (error) {
      console.error('Error al obtener registros de salud de aves:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/salud-aves/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_salud = parseInt(req.params.id!);

      const registro = await prisma.saludAve.findFirst({
        where: { id_salud, id_tenant },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!registro) {
        return res.status(404).json(createErrorResponse('Registro de salud no encontrado'));
      }

      res.json(createSuccessResponse(registro));
    } catch (error) {
      console.error('Error al obtener registro de salud:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/salud-aves
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        id_ave, 
        fecha, 
        tipo_tratamiento, 
        medidas, 
        cantidad,
        descripcion, 
        costo, 
        aplicacion_productos 
      } = req.body;

      // Verificar que el ave existe y pertenece al tenant
      const ave = await prisma.ave.findFirst({
        where: { id_ave, id_tenant }
      });

      if (!ave) {
        return res.status(404).json(createErrorResponse('Ave no encontrada'));
      }

      const nuevoRegistro = await prisma.saludAve.create({
        data: {
          id_tenant,
          id_ave,
          fecha: new Date(fecha),
          tipo_tratamiento,
          medidas,
          cantidad: cantidad ? parseFloat(cantidad) : null,
          descripcion,
          costo: costo ? parseFloat(costo) : null,
          aplicacion_productos,
          id_usuario
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevoRegistro, 'Registro de salud creado exitosamente'));
    } catch (error) {
      console.error('Error al crear registro de salud:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/salud-aves/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_salud = parseInt(req.params.id!);
      const { 
        id_ave, 
        fecha, 
        tipo_tratamiento, 
        medidas, 
        cantidad,
        descripcion, 
        costo, 
        aplicacion_productos 
      } = req.body;

      // Verificar que el registro existe
      const registroExistente = await prisma.saludAve.findFirst({
        where: { id_salud, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de salud no encontrado'));
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

      const registroActualizado = await prisma.saludAve.update({
        where: { id_salud_id_tenant: { id_salud, id_tenant } },
        data: {
          ...(id_ave && { id_ave }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(tipo_tratamiento && { tipo_tratamiento }),
          ...(medidas !== undefined && { medidas }),
          ...(cantidad !== undefined && { cantidad: cantidad ? parseFloat(cantidad) : null }),
          ...(descripcion !== undefined && { descripcion }),
          ...(costo !== undefined && { costo: costo ? parseFloat(costo) : null }),
          ...(aplicacion_productos !== undefined && { aplicacion_productos })
        },
        include: {
          ave: true,
          usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(registroActualizado, 'Registro de salud actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar registro de salud:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/salud-aves/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_salud = parseInt(req.params.id!);

      const registroExistente = await prisma.saludAve.findFirst({
        where: { id_salud, id_tenant }
      });

      if (!registroExistente) {
        return res.status(404).json(createErrorResponse('Registro de salud no encontrado'));
      }

      await prisma.saludAve.delete({
        where: { id_salud_id_tenant: { id_salud, id_tenant } }
      });

      res.json(createSuccessResponse(null, 'Registro de salud eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar registro de salud:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/salud-aves/stats
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
        tratamientosPorTipo,
        costoTotal
      ] = await Promise.all([
        prisma.saludAve.count({ where }),
        prisma.saludAve.groupBy({
          by: ['tipo_tratamiento'],
          where,
          _count: { id_salud: true },
          orderBy: { _count: { id_salud: 'desc' } }
        }),
        prisma.saludAve.aggregate({
          where: { ...where, costo: { not: null } },
          _sum: { costo: true }
        })
      ]);

      res.json(createSuccessResponse({
        totalRegistros,
        tratamientosPorTipo,
        costoTotal: costoTotal._sum.costo || 0
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de salud:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
