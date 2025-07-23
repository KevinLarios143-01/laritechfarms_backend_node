const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePasswords() {
  try {
    console.log('🔑 Actualizando contraseñas a "123456"...');
    
    // Generar hash para la contraseña "123456"
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('Hash generado:', hashedPassword);
    
    // Actualizar todos los usuarios
    const result = await prisma.usuario.updateMany({
      where: {
        email: {
          in: ['admin@elprogreso.com', 'operador@elprogreso.com', 'admin@sanjuan.com']
        }
      },
      data: {
        password_hash: hashedPassword
      }
    });
    
    console.log(`✅ Actualizados ${result.count} usuarios`);
    console.log('🔐 Nueva contraseña para todos: "123456"');
    
    // Verificar la actualización
    const usuarios = await prisma.usuario.findMany({
      where: {
        email: {
          in: ['admin@elprogreso.com', 'operador@elprogreso.com', 'admin@sanjuan.com']
        }
      },
      select: {
        email: true,
        password_hash: true
      }
    });
    
    console.log('\n📋 Usuarios actualizados:');
    for (const user of usuarios) {
      console.log(`- ${user.email}: ${user.password_hash.substring(0, 20)}...`);
    }
    
    console.log('\n🚀 Ahora puedes hacer login con:');
    console.log('Email: admin@elprogreso.com');
    console.log('Password: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();
