// ============================================
// Middleware: autenticarToken
// Verifica el JWT en cada petición privada
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Extrae y verifica el Bearer token del header Authorization.
 * Si es válido, adjunta req.user con los datos del payload.
 * Retorna 401 si no hay token o 403 si expiró / es inválido.
 */
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Se requiere un Token de autenticación en los headers (Authorization: Bearer <token>).' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { idUsuario, username, rol, activo }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Acceso denegado. Su Token ha expirado, por favor inicie sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Acceso denegado. El Token proporcionado es inválido o está corrupto.' });
  }
};

module.exports = { autenticarToken };
