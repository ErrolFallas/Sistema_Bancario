const { ROLES } = require('../constants/roles');
const { Cuenta, Tarjeta, Transaccion, Prestamo, PagoPrestamo, ClienteCuenta, Usuario } = require('../models');

/**
 * Middleware dinámico de Ownership (Propiedad)
 */
const verificarPropiedad = (tipoRecurso) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Sesión no válida.' });
    }

    // SUPER_ADMIN y ADMIN tienen inmunidad jerárquica total
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.rol)) {
      return next();
    }

    const idRecurso = req.params.id;
    const idCliente = req.user.idCliente;
    const idUsuario = req.user.idUsuario;

    try {
      let pertenece = false;

      switch (tipoRecurso) {
        case 'Cuenta':
          const clienteCuenta = await ClienteCuenta.findOne({ where: { idCuenta: idRecurso, idCliente: idCliente } });
          if (clienteCuenta) pertenece = true;
          break;

        case 'Tarjeta':
          const tarjeta = await Tarjeta.findByPk(idRecurso);
          if (tarjeta) {
            const cc = await ClienteCuenta.findOne({ where: { idCuenta: tarjeta.idCuenta, idCliente: idCliente } });
            if (cc) pertenece = true;
          }
          break;

        case 'Transaccion':
          const transaccion = await Transaccion.findByPk(idRecurso);
          if (transaccion && transaccion.idCliente === idCliente) pertenece = true;
          break;

        case 'Prestamo':
          const prestamo = await Prestamo.findByPk(idRecurso);
          if (prestamo && prestamo.idCliente === idCliente) pertenece = true;
          break;

        case 'PagoPrestamo':
          const pago = await PagoPrestamo.findByPk(idRecurso, { include: [{ model: Prestamo, as: 'prestamo' }] });
          if (pago && pago.prestamo && pago.prestamo.idCliente === idCliente) pertenece = true;
          break;
          
        case 'Cliente':
          if (idCliente && String(idRecurso) === String(idCliente)) pertenece = true;
          break;

        case 'Usuario':
          // El usuario solo puede acceder a su propio perfil
          if (idUsuario && String(idRecurso) === String(idUsuario)) pertenece = true;
          break;

        default:
          pertenece = false;
      }

      if (!pertenece) {
        return res.status(403).json({ 
            error: `Acceso denegado: No tiene permisos de propiedad sobre este recurso (${tipoRecurso}).` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error interno al verificar la propiedad.', detalle: error.message });
    }
  };
};

module.exports = { verificarPropiedad };
