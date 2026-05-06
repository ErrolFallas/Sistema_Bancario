// ============================================
// Controller: AuthController
// Responsabilidad única: autenticación y JWT
// ============================================
// REGLAS DE CREACIÓN:
// - Primer usuario → SUPER_ADMIN sin relaciones
// - Registro público → rol CLIENTE, requiere id_cliente previo
// ============================================

const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { Usuario, Rol, Cliente } = require('../models');
const { registrarAuditoria } = require('../utils/auditoria');

// ============================================
// POST /auth/login
// Valida credenciales y emite un JWT (30 min)
// ============================================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Campos obligatorios
    if (!username || !password) {
      return res.status(400).json({ error: 'Error de validación: Los campos "username" y "password" son estrictamente obligatorios para iniciar sesión.' });
    }

    // 2. Buscar usuario con su rol
    const usuario = await Usuario.findOne({
      where: { username },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Error de autenticación: El nombre de usuario ingresado no existe en el sistema.' });
    }

    // 3. Verificar si la cuenta está activa
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Acceso denegado: Su cuenta se encuentra inactiva o ha sido suspendida. Por favor, contacte al administrador del sistema.' });
    }

    // 4. Comparar contraseña con hash bcrypt
    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({ error: 'Error de autenticación: La contraseña ingresada es incorrecta.' });
    }

    // 5. Construir payload del JWT
    const payload = {
      idUsuario : usuario.idUsuario,
      username  : usuario.username,
      rol       : usuario.rol ? usuario.rol.nombre.toUpperCase() : null, // Normalizar rol a MAYUSCULAS
      activo    : usuario.activo,
      idCliente : usuario.idCliente,
      idEmpleado: usuario.idEmpleado
    };

    // 6. Firmar token — 30 minutos de expiración
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    // 7. Respuesta — nunca incluir passwordHash
    return res.status(200).json({
      mensaje   : 'Login exitoso.',
      token,
      expiresIn : '30 minutos',
      usuario: {
        idUsuario : usuario.idUsuario,
        username  : usuario.username,
        rol       : payload.rol,
        activo    : usuario.activo,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// GET /auth/me
// Retorna información del usuario autenticado
// (requiere autenticarToken middleware)
// ============================================
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.idUsuario, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Error: No se pudo encontrar la información de su usuario en la base de datos. Verifique que su cuenta exista.' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// POST /auth/register
// Registro de usuario con reglas estrictas:
// - Primer usuario → SUPER_ADMIN (sin relaciones)
// - Siguientes → CLIENTE (requiere id_cliente previo)
// ============================================
const register = async (req, res) => {
  try {
    const { username, password, idCliente } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Error de validación: Username y password son obligatorios para registrarse.' });
    }

    // Verificar si el username ya existe
    const existe = await Usuario.findOne({ where: { username } });
    if (existe) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
    }

    const totalUsuarios = await Usuario.count();
    let rolAsignado;
    let idClienteFinal = null;

    // ============================================
    // CASO 1: Primer usuario → SUPER_ADMIN
    // Sin relaciones (id_cliente e id_empleado = null)
    // ============================================
    if (totalUsuarios === 0) {
      let rolAdmin = await Rol.findOne({ where: { nombre: 'SUPER_ADMIN' } });
      if (!rolAdmin) {
        rolAdmin = await Rol.create({ nombre: 'SUPER_ADMIN', descripcion: 'Administrador Supremo' });
      }
      rolAsignado = rolAdmin;
      // Forzar sin relaciones para SUPER_ADMIN
      idClienteFinal = null;

    // ============================================
    // CASO 2: Usuarios subsiguientes → CLIENTE
    // Requiere id_cliente previo en la BD
    // ============================================
    } else {
      let rolCliente = await Rol.findOne({ where: { nombre: 'CLIENTE' } });
      if (!rolCliente) {
        rolCliente = await Rol.create({ nombre: 'CLIENTE', descripcion: 'Cliente estándar' });
      }
      rolAsignado = rolCliente;

      // Validar que id_cliente venga en el body
      if (!idCliente) {
        return res.status(400).json({
          error: 'Error de validación: Para registrarse como CLIENTE, debe proporcionar un id_cliente válido. El registro de cliente debe ser creado previamente por un ADMIN, GERENTE o EMPLEADO a través de POST /clientes.',
        });
      }

      // Verificar que el cliente exista en la BD
      const clienteExiste = await Cliente.findByPk(idCliente);
      if (!clienteExiste) {
        return res.status(404).json({
          error: `Error de validación: No se encontró un registro de Cliente con el ID '${idCliente}'. Verifique que el cliente haya sido creado previamente.`,
        });
      }

      idClienteFinal = idCliente;
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      username,
      passwordHash,
      activo: true,
      idRol: rolAsignado.idRol,
      idCliente: idClienteFinal,
      idEmpleado: null, // Registro público nunca asigna empleado
    });

    // --- AUDITORÍA AUTOMÁTICA ---
    let descripcionAuditoria;
    if (totalUsuarios === 0) {
      descripcionAuditoria = `Registro automático del primer SUPER_ADMIN: ${username}`;
    } else {
      // Buscar nombre del cliente para la descripción
      const clienteInfo = await Cliente.findByPk(idClienteFinal);
      const nombreCliente = clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : `id_cliente: ${idClienteFinal}`;
      descripcionAuditoria = `Auto-registro del usuario ${username} como CLIENTE (Cliente: ${nombreCliente})`;
    }
    await registrarAuditoria({
      idUsuario: nuevoUsuario.idUsuario, // En register público, el creador es el propio usuario
      accion: 'CREATE',
      tablaAfectada: 'USUARIOS',
      idRegistro: nuevoUsuario.idUsuario,
      descripcion: descripcionAuditoria,
      ip: req.ip,
    });
    // -----------------------------

    const { passwordHash: _, ...usuarioResponse } = nuevoUsuario.toJSON();
    
    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: usuarioResponse,
      rolAsignado: rolAsignado.nombre
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.', detalle: error.message });
  }
};

module.exports = { login, me, register };
