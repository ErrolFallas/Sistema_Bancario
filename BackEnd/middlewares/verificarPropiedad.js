// ============================================
// Middleware: verificarPropiedad (Ownership)
// Verifica si el recurso pertenece al cliente logueado
// ============================================

const { Cuenta, Tarjeta, Transaccion, Prestamo, PagoPrestamo, ClienteCuenta } = require('../models');

/**
 * Middleware dinámico que verifica si el recurso especificado por el ID en los params
 * pertenece realmente al cliente que está realizando la petición.
 * Solo se aplica si el rol del usuario es 'CLIENTE'.
 * @param {string} tipoRecurso - El tipo de modelo a evaluar ('Cuenta', 'Tarjeta', 'Transaccion', etc.)
 */
const verificarPropiedad = (tipoRecurso) => {
  return async (req, res, next) => {
    // Si no es cliente (ej: ADMIN, EMPLEADO), o es SUPER_ADMIN, se salta la validación de pertenencia
    if (req.user.rol !== 'CLIENTE') {
      return next();
    }

    const idRecurso = req.params.id;
    const idCliente = req.user.idCliente;

    if (!idCliente) {
      return res.status(403).json({ error: 'Acceso denegado: El usuario actual no tiene un cliente asociado.' });
    }

    try {
      let pertenece = false;

      switch (tipoRecurso) {
        case 'Cuenta':
          // Una cuenta pertenece al cliente si existe en ClienteCuenta
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
          // La transacción es tuya si la originaste, o si eres el cliente explícito
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
          // El cliente solo puede acceder a su propio ID
          if (parseInt(idRecurso) === parseInt(idCliente)) pertenece = true;
          break;

        default:
          pertenece = false;
      }

      if (!pertenece) {
        return res.status(403).json({ error: 'Acceso denegado. No tiene permisos para acceder o modificar este recurso porque no le pertenece.' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error interno al verificar la propiedad del recurso.', detalle: error.message });
    }
  };
};

module.exports = { verificarPropiedad };
