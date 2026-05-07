const { Usuario } = require('../models');

async function cleanUpAdmin() {
  try {
    const deleted = await Usuario.destroy({
      where: { username: 'admin' }
    });
    if (deleted) {
      console.log('✅ Usuario "admin" eliminado con éxito.');
    } else {
      console.log('ℹ️ El usuario "admin" no existía.');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al eliminar el usuario:', error);
    process.exit(1);
  }
}

cleanUpAdmin();
