const bcrypt = require('bcryptjs');

const hashFromDB = '$2b$10$nkB0CQGoQ2RUGKXjShAfwe64dXw8BkuEjZZGTrDqFpi65yDLJbKVC';

// Lista de contraseñas comunes para probar
const passwordsToTest = [
  '123456',
  'admin123',
  'password',
  'admin',
  'operador',
  '12345678',
  'qwerty',
  'secret',
  'test123',
  'user123',
  'pass123',
  '111111',
  '000000',
  'laritechfarms',
  'granja123',
  'farming',
  'pollo123'
];

async function testPasswords() {
  console.log('🔍 Probando contraseñas contra el hash:', hashFromDB);
  console.log('');
  
  for (const password of passwordsToTest) {
    try {
      const isMatch = await bcrypt.compare(password, hashFromDB);
      if (isMatch) {
        console.log(`✅ ¡ENCONTRADA! La contraseña es: "${password}"`);
        return password;
      } else {
        console.log(`❌ "${password}" - No match`);
      }
    } catch (error) {
      console.log(`⚠️ Error probando "${password}":`, error.message);
    }
  }
  
  console.log('');
  console.log('🤔 No se encontró la contraseña entre las opciones comunes.');
  console.log('');
  
  // Generar nuevos hashes para contraseñas conocidas
  console.log('📝 Generando nuevos hashes para contraseñas conocidas:');
  const newPasswords = ['admin123', 'operador123', '123456'];
  
  for (const pwd of newPasswords) {
    const newHash = await bcrypt.hash(pwd, 10);
    console.log(`Contraseña: "${pwd}" -> Hash: ${newHash}`);
  }
  
  console.log('');
  console.log('💡 Puedes usar estos SQLs para actualizar las contraseñas:');
  const adminHash = await bcrypt.hash('admin123', 10);
  const operadorHash = await bcrypt.hash('operador123', 10);
  
  console.log(`UPDATE usuario SET password_hash = '${adminHash}' WHERE email = 'admin@elprogreso.com';`);
  console.log(`UPDATE usuario SET password_hash = '${operadorHash}' WHERE email = 'operador@elprogreso.com';`);
  console.log(`UPDATE usuario SET password_hash = '${adminHash}' WHERE email = 'admin@sanjuan.com';`);
}

console.log('🚀 Iniciando test de contraseñas...');
testPasswords().catch(console.error);
