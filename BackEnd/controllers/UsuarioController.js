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
    if (req.user && req.user.rol === 'ADMIN') {
      const rolSolicitado = await Rol.findByPk(resto.idRol);
      if (rolSolicitado && rolSolicitado.nombre === 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Operación denegada: Un ADMIN no puede crear usuarios con privilegios de SUPER_ADMIN.' });
      }
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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// ============================================
// GET /usuarios — Listar usuarios (ADMIN)
// ============================================
const buscarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: Rol,      as: 'rol'      },
        { model: Cliente,  as: 'cliente'  },
        { model: Empleado, as: 'empleado' },
      ],
    });
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

    // Validar reglas por rol (solo si se está cambiando rol o relaciones)
    if (req.body.idRol || req.body.hasOwnProperty('idCliente') || req.body.hasOwnProperty('idEmpleado')) {
      const validacion = await validarReglasRol(nuevoIdRol, nuevoIdCliente, nuevoIdEmpleado);
      if (!validacion.valido) {
        return res.status(validacion.status).json({ error: validacion.error });
      }
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    if (req.body.idRol) {
      const rolSolicitado = await Rol.findByPk(req.body.idRol);
      const rolActual = await Rol.findByPk(usuario.idRol);

      if (req.user && req.user.rol === 'ADMIN') {
        if (rolActual && rolActual.nombre === 'SUPER_ADMIN') {
          return res.status(403).json({ error: 'Operación denegada: Un ADMIN no puede modificar a un SUPER_ADMIN.' });
        }
        if (rolSolicitado && rolSolicitado.nombre === 'SUPER_ADMIN') {
          return res.status(403).json({ error: 'Operación denegada: Un ADMIN no puede promover a un usuario a SUPER_ADMIN.' });
        }
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

module.exports = {
  crearUsuario,
  buscarUsuarios,
  buscarUsuarioId,
  actualizarUsuario,
  eliminarUsuario,
  desactivarCuenta,
};
