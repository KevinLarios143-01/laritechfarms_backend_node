# Scripts de Mantenimiento y Utilidades

Esta carpeta contiene scripts útiles para tareas de mantenimiento, migración, refactorización y pruebas en el backend de LariTechFarms. Ninguno de estos scripts afecta la funcionalidad principal de la API en producción, pero pueden ser ejecutados manualmente por desarrolladores o administradores para facilitar el trabajo con la base de datos, la documentación o la estructura del proyecto.

## Descripción de cada script

- **update-passwords.js**
  - Actualiza los hashes de contraseñas de usuarios en la base de datos. Útil si cambiaste el algoritmo de hash o necesitas migrar contraseñas.

- **test-password.js**
  - Permite probar y verificar el hash de una contraseña específica. Útil para depuración y validación de autenticación.

- **fix-swagger-docs.js**
  - Automatiza la corrección o migración de bloques de documentación Swagger en los controladores o rutas. Útil para mantener la documentación centralizada y actualizada.

- **fix-routes.js**
  - Realiza ajustes automáticos en los archivos de rutas, como renombrar, reordenar o corregir imports/exports. Útil tras refactorizaciones masivas.

- **fix-remaining-routes.js**
  - Similar a `fix-routes.js`, pero enfocado en rutas que quedaron pendientes o requieren un tratamiento especial tras una migración o limpieza.

## Uso

> **Advertencia:** Antes de ejecutar cualquier script, revisa su contenido y asegúrate de tener un respaldo de la base de datos y/o el código fuente.

Ejecuta los scripts desde la raíz del proyecto:

```sh
node scripts/update-passwords.js
node scripts/test-password.js
node scripts/fix-swagger-docs.js
node scripts/fix-routes.js
node scripts/fix-remaining-routes.js
```

Algunos scripts pueden requerir variables de entorno o conexión a la base de datos. Consulta el código fuente de cada uno para más detalles.

## Buenas prácticas
- No modifiques estos scripts en producción sin pruebas previas.
- Mantén esta carpeta organizada y documentada.
- Elimina scripts que ya no sean útiles para evitar confusiones.

---

¿Tienes dudas sobre algún script? Consulta con el equipo de desarrollo o revisa el historial de cambios en el repositorio.
