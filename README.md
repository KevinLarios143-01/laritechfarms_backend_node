# LariTechFarms Backend - Node.js API

Una API REST completa construida con Node.js, TypeScript, Express, y Prisma para la gestión integral de granjas avícolas. Esta API replica exactamente la funcionalidad del backend Django original, siguiendo el esquema SQL proporcionado.

## 🚀 Características

- **TypeScript**: Tipado estático para mayor seguridad y productividad
- **Prisma ORM**: Manejo moderno de base de datos con migraciones automáticas
- **PostgreSQL**: Base de datos robusta y escalable
- **Multi-tenant**: Soporte completo para múltiples tenants
- **Autenticación JWT**: Sistema de autenticación seguro
- **Rate Limiting**: Protección contra abuso de la API
- **CORS**: Configuración segura para aplicaciones web
- **Swagger**: Documentación automática de la API
- **Logging**: Sistema de logs estructurado
- **Error Handling**: Manejo centralizado de errores
- **API Completa**: 15+ módulos implementados para la gestión avícola completa

## 📋 Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tu configuración:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:root@localhost:5432/laritechfarms?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000,http://localhost:3001
```

### 3. Configurar base de datos PostgreSQL

**Opción A: PostgreSQL local**
1. Instalar PostgreSQL en tu sistema
2. Crear la base de datos:
   ```sql
   CREATE DATABASE laritechfarms;
   ```
3. Asegurarte de que el usuario y contraseña en DATABASE_URL sean correctos

**Opción B: Docker (Recomendado)**
```bash
# Usar el docker-compose.yml incluido
docker-compose up -d postgres
```

### 4. Generar cliente Prisma y migrar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones (esto creará las tablas)
npx prisma migrate dev --name init

# O si ya tienes la BD con datos, sincronizar schema
npx prisma db push
```

### 5. Compilar TypeScript
```bash
npm run build
```

### 6. Iniciar servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

## 🔧 Comandos útiles

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar proyecto
npm run build

# Iniciar en producción
npm start

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Abrir Prisma Studio (GUI para BD)
npm run db:studio

# Verificar esquema Prisma
npx prisma validate

# Formatear esquema Prisma
npx prisma format
```

## 🌐 Endpoints API

Todas las rutas están bajo el prefijo `/api/v1`:

**Base URL:** `http://localhost:3001/api/v1`

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/refresh` - Renovar token

### 🏢 Gestión de Negocio
```
# Lotes
GET    /api/v1/lotes               # Listar lotes
GET    /api/v1/lotes/:id           # Obtener lote por ID
POST   /api/v1/lotes               # Crear nuevo lote
PUT    /api/v1/lotes/:id           # Actualizar lote
DELETE /api/v1/lotes/:id           # Eliminar lote
GET    /api/v1/lotes/stats         # Estadísticas de lotes

# Aves
GET    /api/v1/aves                # Listar aves
GET    /api/v1/aves/:id            # Obtener ave por ID
POST   /api/v1/aves                # Crear nueva ave
PUT    /api/v1/aves/:id            # Actualizar ave
DELETE /api/v1/aves/:id            # Eliminar ave
GET    /api/v1/aves/stats          # Estadísticas de aves

# Productos
GET    /api/v1/productos           # Listar productos
GET    /api/v1/productos/:id       # Obtener producto por ID
POST   /api/v1/productos           # Crear nuevo producto
PUT    /api/v1/productos/:id       # Actualizar producto
DELETE /api/v1/productos/:id       # Eliminar producto
GET    /api/v1/productos/stats     # Estadísticas de productos

# Clientes
GET    /api/v1/clientes            # Listar clientes
GET    /api/v1/clientes/:id        # Obtener cliente por ID
POST   /api/v1/clientes            # Crear nuevo cliente
PUT    /api/v1/clientes/:id        # Actualizar cliente
DELETE /api/v1/clientes/:id        # Eliminar cliente
GET    /api/v1/clientes/stats      # Estadísticas de clientes

# Ventas
GET    /api/v1/ventas              # Listar ventas
GET    /api/v1/ventas/:id          # Obtener venta por ID
POST   /api/v1/ventas              # Crear nueva venta
PUT    /api/v1/ventas/:id          # Actualizar venta
DELETE /api/v1/ventas/:id          # Eliminar venta
GET    /api/v1/ventas/stats        # Estadísticas de ventas
```

### 👥 Gestión de Personal
```
# Empleados
GET    /api/v1/empleados           # Listar empleados
GET    /api/v1/empleados/:id       # Obtener empleado por ID
POST   /api/v1/empleados           # Crear nuevo empleado
PUT    /api/v1/empleados/:id       # Actualizar empleado
DELETE /api/v1/empleados/:id       # Eliminar empleado
GET    /api/v1/empleados/stats     # Estadísticas de empleados

# Préstamos a Empleados
GET    /api/v1/prestamos-empleados # Listar préstamos
GET    /api/v1/prestamos-empleados/:id # Obtener préstamo por ID
POST   /api/v1/prestamos-empleados # Crear nuevo préstamo
PUT    /api/v1/prestamos-empleados/:id # Actualizar préstamo
DELETE /api/v1/prestamos-empleados/:id # Eliminar préstamo
GET    /api/v1/prestamos-empleados/stats # Estadísticas de préstamos

# Control de Asistencia
GET    /api/v1/asistencias         # Listar asistencias
GET    /api/v1/asistencias/:id     # Obtener asistencia por ID
POST   /api/v1/asistencias         # Registrar asistencia
PUT    /api/v1/asistencias/:id     # Actualizar asistencia
DELETE /api/v1/asistencias/:id     # Eliminar asistencia
GET    /api/v1/asistencias/stats   # Estadísticas de asistencia
```

### 🏥 Control Sanitario
```
# Salud de Aves
GET    /api/v1/salud-aves          # Listar registros de salud
GET    /api/v1/salud-aves/:id      # Obtener registro por ID
POST   /api/v1/salud-aves          # Crear registro de salud
PUT    /api/v1/salud-aves/:id      # Actualizar registro
DELETE /api/v1/salud-aves/:id      # Eliminar registro
GET    /api/v1/salud-aves/stats    # Estadísticas de salud

# Control de Muertes
GET    /api/v1/control-muertes     # Listar controles de muertes
GET    /api/v1/control-muertes/:id # Obtener control por ID
POST   /api/v1/control-muertes     # Crear control de muertes
PUT    /api/v1/control-muertes/:id # Actualizar control
DELETE /api/v1/control-muertes/:id # Eliminar control
GET    /api/v1/control-muertes/stats # Estadísticas de muertes

# Control de Huevos
GET    /api/v1/control-huevos      # Listar controles de huevos
GET    /api/v1/control-huevos/:id  # Obtener control por ID
POST   /api/v1/control-huevos      # Crear control de huevos
PUT    /api/v1/control-huevos/:id  # Actualizar control
DELETE /api/v1/control-huevos/:id  # Eliminar control
GET    /api/v1/control-huevos/stats # Estadísticas de producción
```

### � Operaciones y Logística
```
# Vehículos
GET    /api/v1/vehiculos           # Listar vehículos
GET    /api/v1/vehiculos/:id       # Obtener vehículo por ID
POST   /api/v1/vehiculos           # Crear nuevo vehículo
PUT    /api/v1/vehiculos/:id       # Actualizar vehículo
DELETE /api/v1/vehiculos/:id       # Eliminar vehículo
GET    /api/v1/vehiculos/stats     # Estadísticas de vehículos

# Inventario
GET    /api/v1/inventario          # Listar inventario
GET    /api/v1/inventario/:id      # Obtener item por ID
POST   /api/v1/inventario          # Crear item de inventario
PUT    /api/v1/inventario/:id      # Actualizar item
DELETE /api/v1/inventario/:id      # Eliminar item
GET    /api/v1/inventario/stats    # Estadísticas de inventario
```

### 💰 Gestión Financiera
```
# Gastos de Operación
GET    /api/v1/gastos-operacion    # Listar gastos de operación
GET    /api/v1/gastos-operacion/:id # Obtener gasto por ID
POST   /api/v1/gastos-operacion    # Crear nuevo gasto
PUT    /api/v1/gastos-operacion/:id # Actualizar gasto
DELETE /api/v1/gastos-operacion/:id # Eliminar gasto
GET    /api/v1/gastos-operacion/stats # Estadísticas de gastos
```

### � Endpoints Utilitarios
```
GET    /api/v1                  # Información de la API
GET    /health                  # Estado de salud del servidor
```

### Productos
```
GET    /api/productos            # Listar todos los productos
GET    /api/productos/:id        # Obtener producto por ID
POST   /api/productos            # Crear nuevo producto
PUT    /api/productos/:id        # Actualizar producto
DELETE /api/productos/:id        # Eliminar producto
```

### Ventas
```
GET    /api/ventas               # Listar todas las ventas
GET    /api/ventas/:id           # Obtener venta por ID
POST   /api/ventas               # Crear nueva venta
PUT    /api/ventas/:id           # Actualizar venta
DELETE /api/ventas/:id           # Eliminar venta
```

### Estadísticas
```
GET    /api/estadisticas                    # Estadísticas generales del sistema
GET    /api/estadisticas/tenant/:id         # Estadísticas completas por tenant
GET    /api/estadisticas/dashboard/:id      # Dashboard ejecutivo por tenant
GET    /api/estadisticas/reporte/:id        # Reporte detallado de producción
```

## 📝 Ejemplos de Uso

### Crear un Tenant
```bash
curl -X POST http://localhost:3000/api/tenants \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Granja San José",
    "correo": "contacto@granjasanjose.com",
    "telefono": "+1234567890"
  }'
```

### Crear una Ave
```bash
curl -X POST http://localhost:3000/api/aves \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenant_id": 1,
    "tipo": "Ponedoras",
    "edad": 25,
    "estado": "Viva",
    "peso": 2.5,
    "lote_id": 1
  }'
```

### Crear un Producto
```bash
curl -X POST http://localhost:3000/api/productos \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenant_id": 1,
    "nombre": "Huevos Medianos",
    "tamanio": "M",
    "precio": 0.25,
    "stock": 1000
  }'
```

### Crear una Venta
```bash
curl -X POST http://localhost:3000/api/ventas \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenant_id": 1,
    "cliente_id": 1,
    "total": 125.50
  }'
```

### Obtener Estadísticas
```bash
curl http://localhost:3000/api/estadisticas/tenant/1
```

## 🔧 Parámetros de Consulta

### Paginación
Todos los endpoints de listado soportan paginación:
```
?page=1&limit=10&sortBy=fecha&sortOrder=desc
```

### Filtros
Muchos endpoints soportan filtros específicos:
```
?tenant_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
```

## 🛡️ Seguridad

- **Rate Limiting**: Límite de 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de orígenes permitidos
- **Validación**: Validación estricta de entrada con Zod
- **Error Handling**: No exposición de datos sensibles en errores

## 🔄 Migraciones de Base de Datos

```bash
# Crear nueva migración
npx prisma migrate dev --name nueva_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (solo desarrollo)
npx prisma migrate reset
```

## 📊 Prisma Studio

Para una interfaz visual de la base de datos:
```bash
npm run db:studio
```

## 🧪 Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar base de datos
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir problemas de linting
```

## 🚀 Deployment

### Usando Docker (Recomendado)

1. **Construir la imagen**
   ```bash
   docker build -t laritech-farms-api .
   ```

2. **Ejecutar el contenedor**
   ```bash
   docker run -p 3000:3000 -e DATABASE_URL="your-database-url" laritech-farms-api
   ```

### Variables de Entorno para Producción

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://usuario:password@host:5432/database"
JWT_SECRET="secure-random-secret"
ALLOWED_ORIGINS="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte y consultas:
- Email: soporte@laritech.com
- Issues: [GitHub Issues](https://github.com/laritech/farms-backend/issues)

## 🔄 Migración desde Django

Esta API está diseñada para ser compatible con la API de Django existente. Para migrar:

1. **Datos**: Usar los scripts de migración incluidos
2. **Endpoints**: Los endpoints mantienen compatibilidad con el frontend Angular
3. **Esquemas**: Los modelos Prisma replican exactamente los modelos Django

---

**LariTechFarms** - Sistema de Gestión Avícola Moderno 🐔
