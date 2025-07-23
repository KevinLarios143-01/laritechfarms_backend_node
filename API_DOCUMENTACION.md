# Documentación General de la API LariTechFarms

Esta documentación describe la estructura, propósito y funcionamiento de cada parte del backend de LariTechFarms. Está pensada para nuevos desarrolladores, administradores y para referencia rápida del equipo.

---

## 1. Estructura General

- **src/**: Código fuente principal de la API.
  - **controllers/**: Lógica de negocio y controladores de cada recurso (usuarios, lotes, productos, etc).
  - **routes/**: Definición de rutas y documentación Swagger de cada módulo.
  - **middleware/**: Funciones intermedias para autenticación, manejo de errores, logs, etc.
  - **services/**: Servicios auxiliares, como la conexión a la base de datos (Prisma).
  - **utils/**: Utilidades y helpers reutilizables (validaciones, paginación, respuestas estándar).
  - **types/**: Tipos TypeScript globales y personalizados para la API.
  - **config/**: Configuración de Swagger y otros módulos globales.
  - **server.ts**: Punto de entrada principal de la API (Express).

- **scripts/**: Scripts de mantenimiento y utilidades (ver README en esa carpeta).
- **prisma/**: Esquema y migraciones de base de datos (Prisma ORM).
- **package.json**: Dependencias y scripts de npm.
- **README.md**: Documentación general y guía rápida del proyecto.

---

## 2. Flujo de la API

1. **Inicio**: El archivo `server.ts` configura Express, middlewares globales, Swagger y monta las rutas principales desde `src/routes/index.ts`.
2. **Rutas**: Cada archivo en `routes/` define los endpoints de un recurso y contiene la documentación Swagger de cada endpoint.
3. **Controladores**: Cada endpoint llama a una función en su respectivo controlador (`controllers/`), donde se implementa la lógica de negocio y acceso a datos.
4. **Servicios**: Los controladores usan servicios como `prisma` para interactuar con la base de datos.
5. **Middlewares**: Se usan para autenticación JWT, manejo de errores, logs, y control de acceso por roles.
6. **Respuestas**: Todas las respuestas siguen un formato estándar definido en `utils/helpers.ts`.

---

## 3. Desglose de Carpetas y Archivos

### src/controllers/
- Un archivo por recurso (ej: `clienteController.ts`, `loteController.ts`).
- Implementan CRUD y lógica específica de cada módulo.
- No contienen documentación Swagger (está en las rutas).

### src/routes/
- Un archivo por recurso (ej: `clientes.ts`, `lotes.ts`).
- Definen los endpoints y la documentación Swagger de cada uno.
- Importan y usan los controladores.
- El archivo `index.ts` centraliza y expone todas las rutas.

### src/middleware/
- **auth.ts**: Verifica JWT, extrae usuario y tenant, y controla acceso por roles.
- **errorHandler.ts**: Captura y responde errores de forma uniforme.
- **requestLogger.ts**: Registra cada petición para auditoría y debugging.

### src/services/
- **database.ts**: Inicializa y exporta la instancia de Prisma para acceso a la base de datos PostgreSQL.

### src/utils/
- **helpers.ts**: Funciones para validación, paginación, respuestas estándar, etc.

### src/types/
- **index.ts**: Tipos TypeScript globales (ej: `AuthenticatedRequest`, paginación, etc).

### src/config/
- **swagger.ts**: Configuración de Swagger/OpenAPI y definición centralizada de los schemas de datos.

### scripts/
- Scripts de mantenimiento y migración (ver `scripts/README.md`).

### prisma/
- **schema.prisma**: Esquema de la base de datos.
- Migraciones y seeds.

---

## 4. Principales Endpoints y Recursos

- **/auth**: Autenticación, login, cambio de contraseña, info de usuario.
- **/lotes**: Gestión de lotes de aves.
- **/aves**: Gestión de aves individuales.
- **/productos**: Gestión de productos y stock.
- **/ventas**: Registro y consulta de ventas.
- **/clientes**: Gestión de clientes.
- **/empleados**: Gestión de empleados.
- **/inventario**: Insumos y materiales de la granja.
- **/salud-aves**: Control de salud y tratamientos.
- **/control-muertes**: Registro de muertes de aves.
- **/control-huevos**: Producción y control de huevos.
- **/vehiculos**: Gestión de vehículos.
- **/gastos-operacion**: Gastos operativos.
- **/prestamos-empleados**: Préstamos a empleados.
- **/asistencias**: Control de asistencia del personal.

---

## 5. Seguridad y Multi-Tenant

- Autenticación JWT obligatoria en la mayoría de endpoints.
- El tenant (empresa/granja) se extrae del token y filtra todos los datos.
- Control de acceso por roles (admin, gerente, supervisor, etc).

---

## 6. Documentación y Pruebas

- La documentación Swagger está disponible en `/api-docs`.
- Cada endpoint está documentado en su archivo de rutas.
- Los schemas de datos están centralizados en `src/config/swagger.ts`.
- Para pruebas manuales, usa Postman o Swagger UI.

---

## 7. Scripts de Mantenimiento

Ver carpeta `scripts/` y su README para detalles de scripts útiles para migraciones, refactorizaciones y pruebas.

---

## 8. Buenas Prácticas

- Mantén la documentación Swagger actualizada en las rutas.
- No dejes lógica de negocio en las rutas, solo en los controladores.
- Usa helpers y middlewares para evitar duplicación de código.
- Antes de ejecutar scripts de mantenimiento, haz backup de la base de datos.
- Elimina archivos que ya no se usen para mantener el proyecto limpio.

---