require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../models');

async function testDirectPromotion() {
  try {
    // 1. Buscar el SUPER_ADMIN
    const superAdmin = await db.Usuario.findOne({
      where: { username: 'adminerrol' },
      include: [{ model: db.Rol, as: 'rol' }]
    });
    
    if (!superAdmin) {
      console.log('ERROR: No se encontró adminerrol');
      process.exit(1);
    }
    
    console.log('=== SUPER ADMIN ENCONTRADO ===');
    console.log('ID:', superAdmin.idUsuario);
    console.log('Username:', superAdmin.username);
    console.log('Rol nombre:', superAdmin.rol?.nombre);
    console.log('idRol:', superAdmin.idRol);
    console.log('cuentaActiva:', superAdmin.cuentaActiva);
    console.log('usuarioLogeado:', superAdmin.usuarioLogeado);

    // 2. Generar un token como si fuera un login
    const payload = {
      idUsuario: superAdmin.idUsuario,
      username: superAdmin.username,
      rol: superAdmin.rol.nombre.toUpperCase(),
      cuentaActiva: superAdmin.cuentaActiva,
      idCliente: superAdmin.idCliente,
      idEmpleado: superAdmin.idEmpleado
    };
    
    console.log('\n=== JWT PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
    console.log('\nToken generado OK');

    // 3. Asegurar que el usuario está marcado como logeado
    await superAdmin.update({ usuarioLogeado: true });
    console.log('usuarioLogeado marcado como true');

    // 4. Hacer la petición PATCH al servidor
    console.log('\n=== INTENTANDO PATCH /usuarios/8 con idRol: 1 ===');
    
    const response = await fetch('http://localhost:3000/usuarios/8', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      },
      body: JSON.stringify({ idRol: 1 })
    });

    const data = await response.json();
    console.log('\n=== RESPUESTA DEL SERVIDOR ===');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    process.exit();
  }
}

testDirectPromotion();
