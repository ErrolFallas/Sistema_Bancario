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
      rol       : usuario.rol ? usuario.rol.nombre : null,
      activo    : usuario.activo,
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

module.exports = { login, me };
