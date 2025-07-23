const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');

// Archivos de rutas a actualizar (excluir auth.ts e index.ts)
const routeFiles = [
  'ventas.ts',
  'vehiculos.ts', 
  'saludAves.ts',
  'prestamosEmpleados.ts',
  'inventario.ts',
  'gastosOperacion.ts',
  'empleados.ts',
  'controlMuertes.ts',
  'controlHuevos.ts',
  'clientes.ts',
  'aves.ts',
  'asistencias.ts'
];

function updateRouteFile(fileName) {
  const filePath = path.join(routesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Archivo no encontrado: ${fileName}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Remover validateTenant del import
  if (content.includes('validateTenant')) {
    // Caso 1: import { authenticateToken, validateTenant } -> import { authenticateToken }
    content = content.replace(
      /import\s*{\s*([^}]*),\s*validateTenant\s*([^}]*)\s*}/g,
      'import { $1$2 }'
    );
    
    // Caso 2: import { validateTenant, authenticateToken } -> import { authenticateToken }
    content = content.replace(
      /import\s*{\s*validateTenant\s*,\s*([^}]*)\s*}/g,
      'import { $1 }'
    );
    
    // Limpiar comas extra
    content = content.replace(/import\s*{\s*,\s*/g, 'import { ');
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,\s*}/g, ' }');
    
    updated = true;
  }
  
  // Remover router.use(validateTenant)
  if (content.includes('router.use(validateTenant)')) {
    content = content.replace(/router\.use\(validateTenant\)\s*;?\s*\n?/g, '');
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: ${fileName}`);
  } else {
    console.log(`ℹ️ Sin cambios: ${fileName}`);
  }
}

console.log('🔧 Actualizando archivos de rutas...\n');

routeFiles.forEach(updateRouteFile);

console.log('\n🎉 ¡Actualización completada!');
console.log('\n📋 Ahora solo necesitas el Bearer Token para autenticación.');
console.log('🔑 El tenant ID se obtiene automáticamente del JWT token.');
console.log('\n💡 Para probar en Swagger:');
console.log('   1. Haz login para obtener el token');
console.log('   2. Autoriza solo con bearerAuth (pega el token)');
console.log('   3. Deja tenantHeader vacío o no lo uses');
console.log('   4. ¡Ya puedes usar todos los endpoints!');
