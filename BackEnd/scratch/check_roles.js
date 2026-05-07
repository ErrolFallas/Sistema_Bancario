const db = require('../models');

async function checkRoles() {
  try {
    const roles = await db.Rol.findAll();
    console.log('Roles en la base de datos:');
    roles.forEach(r => {
      console.log(`- ID: ${r.idRol}, Nombre: "${r.nombre}", isActive: ${r.isActive}`);
    });

    const superAdmins = await db.Usuario.findAll({
      include: [{
        model: db.Rol,
        as: 'rol',
        where: { nombre: 'SUPER_ADMIN' }
      }],
      where: { cuentaActiva: true }
    });
    console.log('\nSuper Admins activos:');
    superAdmins.forEach(u => {
      console.log(`- ID: ${u.idUsuario}, Username: "${u.username}", Rol: "${u.rol.nombre}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkRoles();
