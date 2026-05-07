// ============================================
// Middleware: autenticarToken
// Verifica el JWT y el estado de sesión
// ============================================

const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

/**
 * Extrae y verifica el Bearer token del header Authorization.
 * Si es válido:
 *   1. Decodifica el JWT
 *   2. Verifica en BD que el usuario existe
 *   3. Verifica que cuenta_activa = true
 *   4. Verifica que usuario_logeado = true
 *   5. Adjunta req.user con los datos del payload
 *
 * Retorna 401 si no hay token, expiró o sesión inválida.
 * Retorna 403 si el token es inválido o la cuenta está suspendida.
 */
const autenticarToken = async (req, res, next) => {
  // Extraer token desde las cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se encontró una sesión activa (Cookie no presente).' });
  }

  try {
    // 1. Verificar y decodificar JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Verificar estado real del usuario en BD e incluir Rol
    const usuario = await Usuario.findByPk(payload.idUsuario, {
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Sesión inválida o expirada. El usuario asociado al token ya no existe en el sistema.' });
    }

    // 3. Verificar cuenta activa
    if (!usuario.cuentaActiva) {
      return res.status(403).json({ error: 'Acceso denegado: Su cuenta se encuentra inactiva o ha sido suspendida. Por favor, contacte al administrador del sistema.' });
    }

    // 4. Verificar sesión activa (usuario_logeado)
    if (!usuario.usuarioLogeado) {
      return res.status(401).json({ error: 'Sesión inválida o expirada. Debe iniciar sesión nuevamente con POST /auth/login.' });
    }

    // 5. Verificar rol activo (Soft Delete Dinámico)
    if (usuario.rol && !usuario.rol.isActive) {
      await usuario.update({ usuarioLogeado: false }); // Cortar sesión operativa
      return res.status(403).json({ error: 'Su rol de acceso ha sido desactivado. Contacte al administrador del sistema.' });
    }

    // 5. Adjuntar payload al request (Normalizado para consistencia)
    req.user = {
      ...payload,
      rol: usuario.rol ? usuario.rol.nombre.toUpperCase() : (payload.rol ? payload.rol.toUpperCase() : null)
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Acceso denegado. Su Token ha expirado, por favor inicie sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Acceso denegado por seguridad: El Token proporcionado es inválido o está corrupto.' });
  }
};

module.exports = { autenticarToken };
