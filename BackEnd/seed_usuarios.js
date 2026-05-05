const { Cliente, Usuario, Rol } = require('./models/index');

async function seed() {
  try {
    // 1. Verificar si existe el rol o crearlo si es necesario
    let rol = await Rol.findOne({ where: { idRol: 1 } });
    if (!rol) {
      rol = await Rol.create({
        idRol: 1,
        nombre: 'user_cliente',
        descripcion: 'usuario con acceso limitado al sistema'
      });
      console.log('Rol user_cliente creado.');
    }

    // 2. Crear dos Clientes para que nos den un id_cliente
    const cliente1 = await Cliente.create({
      nombre: 'Carlos',
      apellido: 'Perez',
      cedula: '123456789',
      email: 'carlos.perez@example.com',
      telefono: '8888-8888',
      direccion: 'San Jose, Centro'
    });
    console.log(`Cliente 1 creado con ID: ${cliente1.idCliente}`);

    const cliente2 = await Cliente.create({
      nombre: 'Maria',
      apellido: 'Gomez',
      cedula: '987654321',
      email: 'maria.gomez@example.com',
      telefono: '9999-9999',
      direccion: 'Heredia, Centro'
    });
    console.log(`Cliente 2 creado con ID: ${cliente2.idCliente}`);

    // 3. Crear dos Usuarios asignándoles los ID de los clientes y el rol
    const usuario1 = await Usuario.create({
      username: 'carlosperez',
      passwordHash: 'password123', // Aquí iría un hash como bcrypt en un escenario real
      idRol: rol.idRol,
      idCliente: cliente1.idCliente,
      activo: true
    });
    console.log(`Usuario 1 creado con ID: ${usuario1.idUsuario} (Asignado al Cliente ${cliente1.idCliente})`);

    const usuario2 = await Usuario.create({
      username: 'mariagomez',
      passwordHash: 'mypassword456', 
      idRol: rol.idRol,
      idCliente: cliente2.idCliente,
      activo: true
    });
    console.log(`Usuario 2 creado con ID: ${usuario2.idUsuario} (Asignado al Cliente ${cliente2.idCliente})`);

    console.log('✅ Usuarios y Clientes creados con éxito.');
  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  } finally {
    process.exit();
  }
}

seed();
