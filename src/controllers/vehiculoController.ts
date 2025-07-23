import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse, extractPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const vehiculoController = {
  // GET /api/vehiculos
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const pagination = extractPagination(req);
      const { estado, tipo } = req.query;

      const where: any = { id_tenant };
      
      if (estado) {
        where.estado = estado as string;
      }

      if (tipo) {
        where.tipo = tipo as string;
      }

      const [vehiculos, total] = await Promise.all([
        prisma.vehiculo.findMany({
          where,
          orderBy: { fecha_adquisicion: 'desc' },
          skip: pagination.skip,
          take: pagination.limit
        }),
        prisma.vehiculo.count({ where })
      ]);

      res.json(createPaginatedResponse(vehiculos, total, pagination));
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/vehiculos/:id
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_vehiculo = parseInt(req.params.id!);

      const vehiculo = await prisma.vehiculo.findFirst({
        where: { id_vehiculo, id_tenant }
      });

      if (!vehiculo) {
        return res.status(404).json(createErrorResponse('Vehículo no encontrado'));
      }

      res.json(createSuccessResponse(vehiculo));
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // POST /api/vehiculos
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const { 
        tipo, 
        placa, 
        marca, 
        modelo, 
        anio,
        estado,
        capacidad,
        fecha_adquisicion
      } = req.body;

      // Verificar que la placa sea única para el tenant
      const vehiculoExistente = await prisma.vehiculo.findFirst({
        where: { id_tenant, placa }
      });

      if (vehiculoExistente) {
        return res.status(400).json(createErrorResponse('Ya existe un vehículo con esta placa'));
      }

      const nuevoVehiculo = await prisma.vehiculo.create({
        data: {
          id_tenant,
          tipo,
          placa,
          marca,
          modelo,
          anio: anio ? parseInt(anio) : null,
          estado: estado || 'Activo',
          capacidad: capacidad ? parseFloat(capacidad) : null,
          fecha_adquisicion: fecha_adquisicion ? new Date(fecha_adquisicion) : null
        }
      });

      res.status(201).json(createSuccessResponse(nuevoVehiculo, 'Vehículo creado exitosamente'));
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // PUT /api/vehiculos/:id
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_vehiculo = parseInt(req.params.id!);
      const { 
        tipo, 
        placa, 
        marca, 
        modelo, 
        anio,
        estado,
        capacidad,
        fecha_adquisicion
      } = req.body;

      // Verificar que el vehículo existe
      const vehiculoExistente = await prisma.vehiculo.findFirst({
        where: { id_vehiculo, id_tenant }
      });

      if (!vehiculoExistente) {
        return res.status(404).json(createErrorResponse('Vehículo no encontrado'));
      }

      // Si se cambia la placa, verificar que sea única
      if (placa && placa !== vehiculoExistente.placa) {
        const placaExistente = await prisma.vehiculo.findFirst({
          where: { id_tenant, placa, id_vehiculo: { not: id_vehiculo } }
        });

        if (placaExistente) {
          return res.status(400).json(createErrorResponse('Ya existe un vehículo con esta placa'));
        }
      }

      const vehiculoActualizado = await prisma.vehiculo.update({
        where: { id_vehiculo },
        data: {
          ...(tipo && { tipo }),
          ...(placa && { placa }),
          ...(marca && { marca }),
          ...(modelo && { modelo }),
          ...(anio !== undefined && { anio: anio ? parseInt(anio) : null }),
          ...(estado && { estado }),
          ...(capacidad !== undefined && { capacidad: capacidad ? parseFloat(capacidad) : null }),
          ...(fecha_adquisicion !== undefined && { fecha_adquisicion: fecha_adquisicion ? new Date(fecha_adquisicion) : null })
        }
      });

      res.json(createSuccessResponse(vehiculoActualizado, 'Vehículo actualizado exitosamente'));
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // DELETE /api/vehiculos/:id
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;
      const id_vehiculo = parseInt(req.params.id!);

      const vehiculoExistente = await prisma.vehiculo.findFirst({
        where: { id_vehiculo, id_tenant }
      });

      if (!vehiculoExistente) {
        return res.status(404).json(createErrorResponse('Vehículo no encontrado'));
      }

      // Verificar si el vehículo tiene controles de transporte asociados
      const controlesAsociados = await prisma.controlTransporte.count({
        where: { id_vehiculo }
      });

      if (controlesAsociados > 0) {
        return res.status(400).json(createErrorResponse('No se puede eliminar el vehículo porque tiene controles de transporte asociados'));
      }

      await prisma.vehiculo.delete({
        where: { id_vehiculo }
      });

      res.json(createSuccessResponse(null, 'Vehículo eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  },

  // GET /api/vehiculos/stats
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { id_tenant } = req.user!;

      const [
        totalVehiculos,
        vehiculosPorEstado,
        vehiculosPorTipo,
        capacidadTotal
      ] = await Promise.all([
        prisma.vehiculo.count({ where: { id_tenant } }),
        prisma.vehiculo.groupBy({
          by: ['estado'],
          where: { id_tenant },
          _count: { id_vehiculo: true }
        }),
        prisma.vehiculo.groupBy({
          by: ['tipo'],
          where: { id_tenant },
          _count: { id_vehiculo: true }
        }),
        prisma.vehiculo.aggregate({
          where: { id_tenant, capacidad: { not: null } },
          _sum: { capacidad: true }
        })
      ]);

      res.json(createSuccessResponse({
        totalVehiculos,
        vehiculosPorEstado,
        vehiculosPorTipo,
        capacidadTotal: capacidadTotal._sum.capacidad || 0
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de vehículos:', error);
      res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  }
};
