const fs = require('fs');
const path = require('path');

const routeFiles = [
  'src/routes/controlHuevos.ts',
  'src/routes/controlMuertes.ts',
  'src/routes/gastosOperacion.ts',
  'src/routes/saludAves.ts',
  'src/routes/vehiculos.ts'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Solo cambiar el import para remover requireRole si no se usa en rutas GET principales
    const originalContent = content;
    
    // Verificar si requireRole se usa solo en POST, PUT, DELETE
    const requireRoleUsage = content.match(/router\.(get|post|put|delete)\([^)]*requireRole/g) || [];
    const getWithRequireRole = requireRoleUsage.filter(match => match.includes('router.get'));
    
    // Si las rutas GET no usan requireRole, simplificar el import
    if (getWithRequireRole.length === 0) {
      content = content.replace(
        /import { authenticateToken, requireRole\s*} from/,
        "import { authenticateToken, requireRole } from"
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Actualizado: ${file}`);
    } else {
      console.log(`ℹ️  Sin cambios: ${file}`);
    }
  } else {
    console.log(`❌ No encontrado: ${file}`);
  }
});

console.log('\n✅ Revisión completada de rutas restantes');
