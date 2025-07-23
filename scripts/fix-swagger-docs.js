const fs = require('fs');
const path = require('path');

const routeFiles = [
  'src/routes/controlHuevos.ts',
  'src/routes/controlMuertes.ts',
  'src/routes/gastosOperacion.ts',
  'src/routes/saludAves.ts',
  'src/routes/vehiculos.ts'
];

function removeXTenantIdFromSwaggerDocs(content) {
  // Patrón para encontrar bloques de documentación Swagger que incluyen X-Tenant-ID
  const swaggerBlockPattern = /\/\*\*\s*\n[\s\S]*?\*\//g;
  
  return content.replace(swaggerBlockPattern, (match) => {
    // Solo procesar si es un bloque que contiene X-Tenant-ID
    if (match.includes('X-Tenant-ID')) {
      // Remover todo el parámetro X-Tenant-ID incluyendo sus líneas
      const lines = match.split('\n');
      const filteredLines = [];
      let skipNext = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Si encontramos el inicio del parámetro X-Tenant-ID, empezamos a saltar líneas
        if (line.includes('name: X-Tenant-ID') || line.includes('name: "X-Tenant-ID"')) {
          // Retroceder para encontrar el inicio del parámetro (- in: header)
          let j = i - 1;
          while (j >= 0 && !lines[j].trim().startsWith('- in: header')) {
            j--;
          }
          if (j >= 0) {
            // Remover desde "- in: header" hasta el final de este parámetro
            filteredLines.splice(j - filteredLines.length + j);
          }
          
          // Saltar líneas hasta encontrar el siguiente parámetro o el final
          while (i + 1 < lines.length && 
                 !lines[i + 1].trim().startsWith('- in:') && 
                 !lines[i + 1].includes('responses:') &&
                 !lines[i + 1].includes('requestBody:')) {
            i++;
          }
          continue;
        }
        
        filteredLines.push(line);
      }
      
      return filteredLines.join('\n');
    }
    
    return match;
  });
}

console.log('🧹 Limpiando documentación Swagger de X-Tenant-ID...\n');

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = removeXTenantIdFromSwaggerDocs(originalContent);
    
    if (originalContent !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Actualizado: ${file}`);
      
      // Contar cuántas referencias se removieron
      const originalCount = (originalContent.match(/X-Tenant-ID/g) || []).length;
      const newCount = (updatedContent.match(/X-Tenant-ID/g) || []).length;
      console.log(`   📝 Removidas ${originalCount - newCount} referencias a X-Tenant-ID`);
    } else {
      console.log(`ℹ️  Sin cambios: ${file}`);
    }
  } else {
    console.log(`❌ No encontrado: ${file}`);
  }
});

console.log('\n✅ Limpieza de documentación Swagger completada');
console.log('🔄 Ahora compila y reinicia el servidor para ver los cambios');
