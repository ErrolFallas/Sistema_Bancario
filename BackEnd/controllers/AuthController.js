// ============================================
// Controller: AuthController
// Responsabilidad única: autenticación y JWT
// ============================================

const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

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
// Registra un nuevo usuario públicamente
// ============================================
const register = async (req, res) => {
  try {
    const { username, password, idCliente, idEmpleado } = req.body;

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

    // Si no hay usuarios en la base, el primero será SUPER_ADMIN
    if (totalUsuarios === 0) {
      let rolAdmin = await Rol.findOne({ where: { nombre: 'SUPER_ADMIN' } });
      if (!rolAdmin) {
        rolAdmin = await Rol.create({ nombre: 'SUPER_ADMIN', descripcion: 'Administrador Supremo' });
      }
      rolAsignado = rolAdmin;
    } else {
      // Si ya hay usuarios, el rol por defecto es CLIENTE
      let rolCliente = await Rol.findOne({ where: { nombre: 'CLIENTE' } });
      if (!rolCliente) {
        rolCliente = await Rol.create({ nombre: 'CLIENTE', descripcion: 'Cliente estándar' });
      }
      rolAsignado = rolCliente;
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      username,
      passwordHash,
      activo: true,
      idRol: rolAsignado.idRol,
      idCliente: idCliente || null,
      idEmpleado: idEmpleado || null
    });

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
