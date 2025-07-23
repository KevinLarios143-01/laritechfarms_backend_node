import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LariTechFarms API',
      version: '1.0.0',
      description: 'API REST para sistema de gestión avícola multi-tenant',
      contact: {
        name: 'LariTechFarms',
        email: 'contacto@laritechfarms.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.laritechfarms.com/api/v1'
          : `http://localhost:${process.env.PORT || 3001}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor de Producción' : 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        tenantHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Tenant-ID',
          description: 'ID del tenant para operaciones multi-inquilino'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error'
            },
            path: {
              type: 'string',
              description: 'Ruta donde ocurrió el error'
            },
            method: {
              type: 'string',
              description: 'Método HTTP utilizado'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la respuesta'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Página actual'
                },
                limit: {
                  type: 'integer',
                  description: 'Elementos por página'
                },
                total: {
                  type: 'integer',
                  description: 'Total de elementos'
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total de páginas'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        tenantHeader: []
      }
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
}

export const swaggerSpec = swaggerJsdoc(options)

// Función para configurar Swagger en la aplicación Express
export default function setupSwagger(app: any): void {
  const swaggerUi = require('swagger-ui-express')
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LariTechFarms API Documentation'
  }))
}
