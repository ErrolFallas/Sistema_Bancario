// ============================================
// Middleware: verificarRol
// Restringe el acceso según el rol del usuario
// ============================================

/**
 * Fábrica de middleware que recibe los roles permitidos.
 * Uso: router.delete('/:id', autenticarToken, verificarRol('admin'), eliminarUsuario)
 *
 * Compara req.user.rol (inyectado por autenticarToken) contra la lista de roles.
 * Retorna 403 si el rol no está permitido.
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    const rolUsuario = req.user.rol; // nombre del rol desde el JWT payload

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        error: `Acceso restringido. Se requiere uno de los roles: [${rolesPermitidos.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = { verificarRol };
