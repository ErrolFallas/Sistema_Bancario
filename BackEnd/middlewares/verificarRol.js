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
      return res.status(401).json({ error: 'Acceso denegado. No se encontró información de autenticación. Asegúrese de enviar el token JWT.' });
    }

    const rolUsuario = req.user.rol; // nombre del rol desde el JWT payload

    // El SUPER_ADMIN tiene acceso global a todo
    if (rolUsuario === 'SUPER_ADMIN') {
      return next();
    }

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        error: `Acceso restringido. Permisos insuficientes. Su rol actual es '${rolUsuario || 'ninguno'}', pero esta acción requiere estrictamente uno de los siguientes roles: [${rolesPermitidos.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = { verificarRol };
