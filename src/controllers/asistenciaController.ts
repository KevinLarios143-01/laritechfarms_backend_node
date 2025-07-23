import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const asistenciaController = {
  // GET /api/asistencias
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

      const [asistencias, total] = await Promise.all([
        prisma.asistencia.findMany({
          where,
          include: {
            empleado: true,
            usuarioRegistro: {
              select: { id_usuario: true, nombre: true, apellido: true, email: true }
            }
          },
          orderBy: { fecha: 'desc' },
          skip: pagination.skip,
          take: pagination.limit
        }),
        prisma.asistencia.count({ where })
      ]);

      res.json(createPaginatedResponse(asistencias, total, pagination));
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/asistencias/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_asistencia = parseInt(req.params.id!);

      const asistencia = await prisma.asistencia.findFirst({
        where: { id_asistencia, id_tenant },
        include: {
          empleado: true,
          usuarioRegistro: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      if (!asistencia) {
        return res.status(404).json(createErrorResponse('Registro de asistencia no encontrado'));
      }

      res.json(createSuccessResponse(asistencia));
    } catch (error) {
      console.error('Error al obtener asistencia:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/asistencias
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant, id_usuario } = req.user!;
      const { 
        id_empleado, 
        fecha, 
        hora_entrada, 
        hora_salida,
        estado,
        observaciones
      } = req.body;

      // Verificar que el empleado existe y pertenece al tenant
      const empleado = await prisma.empleado.findFirst({
        where: { id_empleado, id_tenant }
      });

      if (!empleado) {
        return res.status(404).json(createErrorResponse('Empleado no encontrado'));
      }

      // Verificar si ya existe un registro de asistencia para ese empleado en esa fecha
      const asistenciaExistente = await prisma.asistencia.findFirst({
        where: { 
          id_empleado, 
          id_tenant,
          fecha: new Date(fecha)
        }
      });

      if (asistenciaExistente) {
        return res.status(400).json(createErrorResponse('Ya existe un registro de asistencia para este empleado en esta fecha'));
      }

      const nuevaAsistencia = await prisma.asistencia.create({
        data: {
          id_tenant,
          id_empleado,
          fecha: new Date(fecha),
          hora_entrada: new Date(`1970-01-01T${hora_entrada}`),
          hora_salida: hora_salida ? new Date(`1970-01-01T${hora_salida}`) : null,
          estado: estado || 'Presente',
          observaciones,
          id_usuario_registro: id_usuario
        },
        include: {
          empleado: true,
          usuarioRegistro: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.status(201).json(createSuccessResponse(nuevaAsistencia, 'Asistencia registrada exitosamente'));
    } catch (error) {
      console.error('Error al crear asistencia:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/asistencias/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_asistencia = parseInt(req.params.id!);
      const { 
        id_empleado, 
        fecha, 
        hora_entrada, 
        hora_salida,
        estado,
        observaciones
      } = req.body;

      // Verificar que la asistencia existe
      const asistenciaExistente = await prisma.asistencia.findFirst({
        where: { id_asistencia, id_tenant }
      });

      if (!asistenciaExistente) {
        return res.status(404).json(createErrorResponse('Registro de asistencia no encontrado'));
      }

      // Si se cambia el empleado, verificar que existe y pertenece al tenant
      if (id_empleado && id_empleado !== asistenciaExistente.id_empleado) {
        const empleado = await prisma.empleado.findFirst({
          where: { id_empleado, id_tenant }
        });

        if (!empleado) {
          return res.status(404).json(createErrorResponse('Empleado no encontrado'));
        }
      }

      const asistenciaActualizada = await prisma.asistencia.update({
        where: { id_asistencia },
        data: {
          ...(id_empleado && { id_empleado }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(hora_entrada && { hora_entrada: new Date(`1970-01-01T${hora_entrada}`) }),
          ...(hora_salida !== undefined && { hora_salida: hora_salida ? new Date(`1970-01-01T${hora_salida}`) : null }),
          ...(estado && { estado }),
          ...(observaciones !== undefined && { observaciones })
        },
        include: {
          empleado: true,
          usuarioRegistro: {
            select: { id_usuario: true, nombre: true, apellido: true, email: true }
          }
        }
      });

      res.json(createSuccessResponse(asistenciaActualizada, 'Asistencia actualizada exitosamente'));
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/asistencias/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_asistencia = parseInt(req.params.id!);

      const asistenciaExistente = await prisma.asistencia.findFirst({
        where: { id_asistencia, id_tenant }
      });

      if (!asistenciaExistente) {
        return res.status(404).json(createErrorResponse('Registro de asistencia no encontrado'));
      }

      await prisma.asistencia.delete({
        where: { id_asistencia }
      });

      res.json(createSuccessResponse(null, 'Registro de asistencia eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar asistencia:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/asistencias/stats
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
        asistenciasPorEstado,
        asistenciasPorEmpleado
      ] = await Promise.all([
        prisma.asistencia.count({ where }),
        prisma.asistencia.groupBy({
          by: ['estado'],
          where: { ...where, estado: { not: null } },
          _count: { id_asistencia: true },
          orderBy: { _count: { id_asistencia: 'desc' } }
        }),
        prisma.asistencia.groupBy({
          by: ['id_empleado'],
          where,
          _count: { id_asistencia: true },
          orderBy: { _count: { id_asistencia: 'desc' } },
          take: 10
        })
      ]);

      res.json(createSuccessResponse({
        totalRegistros,
        asistenciasPorEstado,
        asistenciasPorEmpleado
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de asistencia:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
