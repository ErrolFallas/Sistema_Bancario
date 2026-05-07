require('dotenv').config();
const db = require('../models');

async function revertAndCheck() {
  try {
    // Revertir usuario 8 a ADMIN (idRol: 2)
    const user8 = await db.Usuario.findByPk(8);
    if (user8) {
      await user8.update({ idRol: 2 });
      console.log('Usuario 8 revertido a ADMIN (idRol: 2)');
    }
    
    // Mostrar estado actual
    const usuarios = await db.Usuario.findAll({
      include: [{ model: db.Rol, as: 'rol' }],
      where: { cuentaActiva: true }
    });
    
    console.log('\n=== USUARIOS ACTIVOS ===');
    usuarios.forEach(u => {
      console.log(`ID: ${u.idUsuario} | ${u.username} | Rol: ${u.rol?.nombre} (idRol: ${u.idRol})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

revertAndCheck();
