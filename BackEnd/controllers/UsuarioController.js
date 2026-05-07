// ============================================
// Controlador: UsuarioController
// CRUD de usuarios + soft-delete
// Login/JWT → AuthController (separado)
// ============================================
// REGLAS DE NEGOCIO:
// - SUPER_ADMIN / ADMIN → sin id_cliente ni id_empleado
// - CLIENTE → requiere id_cliente, prohíbe id_empleado
// - EMPLEADO / GERENTE → requiere id_empleado, prohíbe id_cliente
// - Nunca ambos IDs simultáneamente
// ============================================

const bcrypt = require('bcrypt');
const { Usuario, Rol, Cliente, Empleado } = require('../models');
const { registrarAuditoria, descripcionCrearUsuario } = require('../utils/auditoria');
const { puedeModificar } = require('../utils/jerarquia');

const SALT_ROUNDS = 10;

// ============================================
// Función auxiliar: validar reglas por rol
// ============================================
const validarReglasRol = async (idRol, idCliente, idEmpleado) => {
  // Obtener el nombre del rol
  const rol = await Rol.findByPk(idRol);
  if (!rol) {
    return { valido: false, status: 400, error: `Error de validación: No existe un rol con el ID '${idRol}'.` };
  }

  const nombreRol = rol.nombre.toUpperCase();

  // REGLA: Solo un SUPER_ADMIN puede crear otro SUPER_ADMIN
  if (nombreRol === 'SUPER_ADMIN') {
    return { valido: false, status: 403, error: 'Operación denegada: No se puede crear o asignar el rol SUPER_ADMIN desde esta ruta. Solo un SUPER_ADMIN puede promover a otro usuario a SUPER_ADMIN.', requiereSuperAdmin: true };
  }

  // REGLA: Nunca ambos IDs simultáneamente
  if (idCliente && idEmpleado) {
    return { valido: false, status: 400, error: 'Error de validación: No se permite asignar id_cliente e id_empleado simultáneamente. Un usuario solo puede ser CLIENTE o EMPLEADO, no ambos.' };
  }

  // REGLA: CLIENTE → requiere id_cliente
  if (nombreRol === 'CLIENTE') {
    if (!idCliente) {
      return { valido: false, status: 400, error: 'Error de validación: Para el rol CLIENTE, el campo id_cliente es obligatorio. Debe existir previamente un registro en CLIENTES.' };
    }
    if (idEmpleado) {
      return { valido: false, status: 400, error: 'Error de validación: Un usuario con rol CLIENTE no puede tener id_empleado asignado.' };
    }
    // Verificar que el cliente exista
    const cliente = await Cliente.findByPk(idCliente);
    if (!cliente) {
      return { valido: false, status: 404, error: `Error de validación: No se encontró un registro de Cliente con el ID '${idCliente}'. Debe crear el cliente primero.` };
    }
  }

  // REGLA: EMPLEADO / GERENTE → requiere id_empleado
  if (nombreRol === 'EMPLEADO' || nombreRol === 'GERENTE') {
    if (!idEmpleado) {
      return { valido: false, status: 400, error: `Error de validación: Para el rol ${nombreRol}, el campo id_empleado es obligatorio. Debe existir previamente un registro en EMPLEADOS.` };
    }
    if (idCliente) {
      return { valido: false, status: 400, error: `Error de validación: Un usuario con rol ${nombreRol} no puede tener id_cliente asignado.` };
    }
    // Verificar que el empleado exista
    const empleado = await Empleado.findByPk(idEmpleado);
    if (!empleado) {
      return { valido: false, status: 404, error: `Error de validación: No se encontró un registro de Empleado con el ID '${idEmpleado}'. Debe crear el empleado primero.` };
    }
  }

  // REGLA: ADMIN → sin relaciones
  if (nombreRol === 'ADMIN') {
    if (idCliente) {
      return { valido: false, status: 400, error: 'Error de validación: Un usuario con rol ADMIN no puede tener id_cliente asignado.' };
    }
    if (idEmpleado) {
      return { valido: false, status: 400, error: 'Error de validación: Un usuario con rol ADMIN no puede tener id_empleado asignado.' };
    }
  }

  return { valido: true, nombreRol };
};

// ============================================
// POST /usuarios — Crear usuario (ADMIN)
// ============================================
const crearUsuario = async (req, res) => {
  try {
    const { password, ...resto } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Error de validación: La contraseña es un campo obligatorio para crear un usuario. Por favor proporcione un valor válido.' });
    }

    if (!resto.idRol) {
      return res.status(400).json({ error: 'Error de validación: El campo idRol es obligatorio para crear un usuario.' });
    }

    if (resto.username) {
      resto.username = resto.username.trim().toLowerCase();
      const existeUsername = await Usuario.findOne({ where: { username: resto.username } });
      if (existeUsername) return res.status(400).json({ error: 'El nombre de usuario ya se encuentra registrado.' });
    }

    if (resto.email) {
      resto.email = resto.email.trim().toLowerCase();
      const existeEmail = await Usuario.findOne({ where: { email: resto.email } });
      if (existeEmail) return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    // --- VALIDACIÓN POR ROL ---
    const validacion = await validarReglasRol(resto.idRol, resto.idCliente, resto.idEmpleado);
    if (!validacion.valido) {
      // Si requiere SUPER_ADMIN y el usuario actual ES SUPER_ADMIN, permitir
      if (validacion.requiereSuperAdmin && req.user && req.user.rol === 'SUPER_ADMIN') {
        // Permitir: SUPER_ADMIN puede crear otro SUPER_ADMIN
        validacion.valido = true;
        validacion.nombreRol = 'SUPER_ADMIN';
      } else {
        return res.status(validacion.status).json({ error: validacion.error });
      }
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    const rolSolicitado = await Rol.findByPk(resto.idRol);
    if (rolSolicitado && !puedeModificar(req.user.rol, rolSolicitado.nombre)) {
      return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para crear usuarios con rol (${rolSolicitado.nombre}).` });
    }
    // -------------------------------------

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await Usuario.create({ ...resto, passwordHash: hash });

    // --- AUDITORÍA AUTOMÁTICA ---
    const descripcion = await descripcionCrearUsuario(req.user, usuario, validacion.nombreRol);
    await registrarAuditoria({
      idUsuario: req.user ? req.user.idUsuario : usuario.idUsuario,
      accion: 'CREATE',
      tablaAfectada: 'USUARIOS',
      idRegistro: usuario.idUsuario,
      descripcion,
      ip: req.ip,
    });
    // -----------------------------

    // No exponer el hash en la respuesta
    const { passwordHash: _, ...usuarioPublico } = usuario.toJSON();
    return res.status(201).json(usuarioPublico);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Error de unicidad: El nombre de usuario o correo electrónico ya se encuentra registrado.' });
    }
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// ============================================
// GET /usuarios — Listar usuarios (ADMIN)
// ============================================
const buscarUsuarios = async (req, res) => {
  try {
    const options = {
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: Rol,      as: 'rol'      },
        { model: Cliente,  as: 'cliente'  },
        { model: Empleado, as: 'empleado' },
      ],
      where: {}
    };

    if (!(req.query.includeInactive === 'true' && req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.rol))) {
      options.where.cuentaActiva = true;
    }

    const usuarios = await Usuario.findAll(options);
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// GET /usuarios/:id — Ver usuario por ID (ADMIN)
// ============================================
const buscarUsuarioId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: Rol,      as: 'rol'      },
        { model: Cliente,  as: 'cliente'  },
        { model: Empleado, as: 'empleado' },
      ],
    });
    if (!usuario) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró ningún usuario asociado al ID '${req.params.id}' en la base de datos.` });
    }
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// PATCH /usuarios/:id — Actualizar usuario (ADMIN)
// ============================================
const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: `Error de actualización: No se puede actualizar. No se encontró el usuario con ID '${req.params.id}'.` });
    }

    // Si se cambia de rol, validar las reglas del nuevo rol
    const nuevoIdRol = req.body.idRol || usuario.idRol;
    const nuevoIdCliente = req.body.hasOwnProperty('idCliente') ? req.body.idCliente : usuario.idCliente;
    const nuevoIdEmpleado = req.body.hasOwnProperty('idEmpleado') ? req.body.idEmpleado : usuario.idEmpleado;

    if (req.body.username) {
      req.body.username = req.body.username.trim().toLowerCase();
      const existeUsername = await Usuario.findOne({ where: { username: req.body.username } });
      if (existeUsername && existeUsername.idUsuario !== usuario.idUsuario) {
        return res.status(400).json({ error: 'El nombre de usuario ya se encuentra registrado.' });
      }
    }

    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
      const existeEmail = await Usuario.findOne({ where: { email: req.body.email } });
      if (existeEmail && existeEmail.idUsuario !== usuario.idUsuario) {
        return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }
    }

    // Validar reglas por rol (solo si se está cambiando rol o relaciones)
    if (req.body.idRol || req.body.hasOwnProperty('idCliente') || req.body.hasOwnProperty('idEmpleado')) {
      const validacion = await validarReglasRol(nuevoIdRol, nuevoIdCliente, nuevoIdEmpleado);
      if (!validacion.valido) {
        return res.status(validacion.status).json({ error: validacion.error });
      }
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    const rolActual = await Rol.findByPk(usuario.idRol);
    const nombreRolAfectado = rolActual ? rolActual.nombre : 'CLIENTE';

    if (req.user && !puedeModificar(req.user.rol, nombreRolAfectado)) {
      return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para modificar a un usuario con rol (${nombreRolAfectado}).` });
    }

    if (req.body.idRol) {
      const rolSolicitado = await Rol.findByPk(req.body.idRol);
      if (rolSolicitado && req.user && !puedeModificar(req.user.rol, rolSolicitado.nombre)) {
        return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para promover a un usuario al rol (${rolSolicitado.nombre}).` });
      }
    }
    // -------------------------------------

    // Re-hashear contraseña si viene nueva
    if (req.body.password) {
      req.body.passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
      delete req.body.password;
    }

    await usuario.update(req.body);

    const { passwordHash: _, ...actualizado } = usuario.toJSON();
    return res.status(200).json(actualizado);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Error de unicidad: El nombre de usuario o correo electrónico ya se encuentra registrado.' });
    }
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// ============================================
// DELETE /usuarios/:id — Eliminar usuario (solo ADMIN)
// Hard delete — el middleware verificarRol lo protege
// ============================================
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: `Error de eliminación: No se puede eliminar. No se encontró el usuario con ID '${req.params.id}'.` });
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    const rolActual = await Rol.findByPk(usuario.idRol);
    const nombreRolAfectado = rolActual ? rolActual.nombre : 'CLIENTE';

    if (req.user && !puedeModificar(req.user.rol, nombreRolAfectado)) {
      return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para eliminar a un usuario con rol (${nombreRolAfectado}).` });
    }
    // -------------------------------------
    await usuario.destroy();
    return res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// PATCH /usuarios/eliminar-cuenta — Soft delete
// Solo el propio usuario puede desactivar su cuenta
// ============================================
const desactivarCuenta = async (req, res) => {
  try {
    // req.user viene del middleware autenticarToken
    const idUsuarioToken = req.user.idUsuario;

    const usuario = await Usuario.findByPk(idUsuarioToken);
    if (!usuario) {
      return res.status(404).json({ error: 'Error: No se encontró la información de su cuenta. Asegúrese de tener una sesión válida iniciada.' });
    }

    if (!usuario.cuentaActiva) {
      return res.status(400).json({ error: 'Error de estado: Su cuenta ya se encuentra desactivada actualmente.' });
    }

    // Soft delete: desactivar cuenta y cerrar sesión
    await usuario.update({ cuentaActiva: false, usuarioLogeado: false });

    return res.status(200).json({
      mensaje: 'Cuenta desactivada exitosamente. Ya no podrá iniciar sesión.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const desactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const rolActual = await Rol.findByPk(usuario.idRol);
    const nombreRolAfectado = rolActual ? rolActual.nombre : 'CLIENTE';

    if (req.user && !puedeModificar(req.user.rol, nombreRolAfectado)) {
      return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para desactivar a un usuario con rol (${nombreRolAfectado}).` });
    }

    if (usuario.cuentaActiva === false) {
      return res.status(400).json({ error: 'Operación redundante: El usuario ya se encuentra desactivado.' });
    }

    await usuario.update({ cuentaActiva: false, usuarioLogeado: false });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'DESACTIVAR_USUARIO',
        tablaAfectada: 'USUARIOS',
        idRegistro: usuario.idUsuario,
        descripcion: `Se desactivó el usuario ${usuario.username}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Usuario desactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

const reactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const rolActual = await Rol.findByPk(usuario.idRol);
    const nombreRolAfectado = rolActual ? rolActual.nombre : 'CLIENTE';

    if (req.user && !puedeModificar(req.user.rol, nombreRolAfectado)) {
      return res.status(403).json({ error: `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para reactivar a un usuario con rol (${nombreRolAfectado}).` });
    }

    if (usuario.cuentaActiva === true) {
      return res.status(400).json({ error: 'Operación redundante: El usuario ya se encuentra activo.' });
    }

    await usuario.update({ cuentaActiva: true });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'REACTIVAR_USUARIO',
        tablaAfectada: 'USUARIOS',
        idRegistro: usuario.idUsuario,
        descripcion: `Se reactivó el usuario ${usuario.username}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Usuario reactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

module.exports = {
  crearUsuario,
  buscarUsuarios,
  buscarUsuarioId,
  actualizarUsuario,
  eliminarUsuario,
  desactivarCuenta,
  desactivarUsuario,
  reactivarUsuario,
};
