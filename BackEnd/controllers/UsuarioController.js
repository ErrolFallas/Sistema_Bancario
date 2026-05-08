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
const { ROLES } = require('../constants/roles');
const { Usuario, Rol, Cliente, Empleado } = require('../models');
const { registrarAuditoria, descripcionCrearUsuario } = require('../utils/auditoria');
const { puedeModificar, puedeCrearRol, esMasAntiguo } = require('../utils/jerarquia');
const { validateRoleTransition } = require('../utils/roleTransitionValidator');
const { tieneDerechoAcceso } = require('../utils/security');

const SALT_ROUNDS = 10;
// ============================================
// Función auxiliar: validar reglas por rol
// ============================================
// isTransition: indica si es un cambio de rol (no una creación nueva)
//   - Si es transición y falta id_empleado, se delega al roleTransitionValidator
//   - Si es creación nueva, se exige id_empleado como antes
// ============================================
const validarReglasRol = async (idRol, idCliente, idEmpleado, actorRol = null, isTransition = false) => {
  // Obtener el nombre del rol
  const rol = await Rol.findByPk(idRol);
  if (!rol) {
    return { valido: false, status: 400, error: `Error de validación: No existe un rol con el ID '${idRol}'.` };
  }

  const nombreRol = rol.nombre.trim().toUpperCase();
  const actor = actorRol?.trim()?.toUpperCase();

  // REGLA: Solo un SUPER_ADMIN puede crear o promover a otro SUPER_ADMIN
  if (nombreRol === 'SUPER_ADMIN') {
    if (actor === 'SUPER_ADMIN') {
      // Permitido: Gobernanza administrativa de alto nivel
    } else {
      return { 
        valido: false, 
        status: 403, 
        error: `Operación denegada: No se puede asignar el rol SUPER_ADMIN. Solo un SUPER_ADMIN puede promover a otro usuario a SUPER_ADMIN.`, 
        requiereSuperAdmin: true 
      };
    }
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
  // PERO: Si es una transición de rol, se delega al roleTransitionValidator (422)
  if (nombreRol === 'EMPLEADO' || nombreRol === 'GERENTE') {
    if (!idEmpleado) {
      if (isTransition) {
        // DELEGACIÓN: No bloquear aquí. El roleTransitionValidator
        // (más abajo en actualizarUsuario) responderá con 422 + modal
        // Solo validar que no tenga id_cliente incompatible
        if (idCliente) {
          return { valido: false, status: 400, error: `Error de validación: Un usuario con rol ${nombreRol} no puede tener id_cliente asignado.` };
        }
      } else {
        // Creación nueva: exigir id_empleado como siempre
        return { valido: false, status: 400, error: `Error de validación: Para el rol ${nombreRol}, el campo id_empleado es obligatorio. Debe existir previamente un registro en EMPLEADOS.` };
      }
    } else {
      // Tiene idEmpleado — validar que no tenga cliente y que exista
      if (idCliente) {
        return { valido: false, status: 400, error: `Error de validación: Un usuario con rol ${nombreRol} no puede tener id_cliente asignado.` };
      }
      const empleado = await Empleado.findByPk(idEmpleado);
      if (!empleado) {
        return { valido: false, status: 404, error: `Error de validación: No se encontró un registro de Empleado con el ID '${idEmpleado}'. Debe crear el empleado primero.` };
      }
    }
  }

  // REGLA: ADMIN → sin relaciones (pero permitir id_empleado heredado)
  if (nombreRol === 'ADMIN') {
    if (idCliente) {
      return { valido: false, status: 400, error: 'Error de validación: Un usuario con rol ADMIN no puede tener id_cliente asignado.' };
    }
    // id_empleado es opcional para ADMIN (puede tener uno heredado de un rol previo)
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
    const validacion = await validarReglasRol(resto.idRol, resto.idCliente, resto.idEmpleado, req.user?.rol);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ error: validacion.error });
    }

    // --- LOGICA DE GOBERNANZA: LÍMITE SUPER_ADMIN (MAX 2) ---
    const rolSolicitado = await Rol.findByPk(resto.idRol);
    const nombreRolSolicitado = rolSolicitado?.nombre?.toUpperCase();

    if (nombreRolSolicitado === 'SUPER_ADMIN') {
      const totalSuperAdmins = await Usuario.count({
        where: { cuentaActiva: true },
        include: [{ model: Rol, as: 'rol', where: { nombre: 'SUPER_ADMIN' } }]
      });

      if (totalSuperAdmins >= 2) {
        await registrarAuditoria({
          idUsuario: req.user?.idUsuario,
          accion: 'INTENTO_CREAR_SUPER_ADMIN',
          tablaAfectada: 'USUARIOS',
          descripcion: `Intento fallido de crear tercer SUPER_ADMIN. Límite alcanzado (2).`,
          ip: req.ip,
        });
        return res.status(403).json({ error: 'Seguridad Bancaria: Se ha alcanzado el límite máximo de 2 SUPER_ADMIN activos.' });
      }
    }

    // --- LOGICA DE JERARQUÍA DE CREACIÓN ---
    // DEFENSA EN PROFUNDIDAD: Bloquear CLIENTE explícitamente
    if (req.user?.rol === 'CLIENTE') {
      return res.status(403).json({ error: 'No tienes permisos para crear usuarios.' });
    }

    if (req.user && !puedeCrearRol(req.user.rol, nombreRolSolicitado)) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'INTENTO_ESCALAMIENTO_PRIVILEGIOS',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de creación de rol superior: ${req.user.rol} intentó crear ${nombreRolSolicitado}`,
        ip: req.ip,
      });
      return res.status(403).json({ error: `No tienes permisos para crear usuarios con ese rol. Su rol (${req.user.rol}) no puede crear nivel (${nombreRolSolicitado}).` });
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

    // Restricción de visibilidad para CLIENTE
    if (req.user && req.user.rol === ROLES.CLIENTE) {
      options.where.idUsuario = req.user.idUsuario;
    }

    if (!(req.query.includeInactive === 'true' && req.user && [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.rol))) {
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
    if (!tieneDerechoAcceso(req.user, req.params.id)) {
      return res.status(403).json({ error: 'Acceso denegado: No tiene permisos para consultar perfiles ajenos.' });
    }

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
    if (!tieneDerechoAcceso(req.user, req.params.id)) {
      return res.status(403).json({ error: 'Acceso denegado: No tiene permisos para modificar perfiles ajenos.' });
    }

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
    // isTransition = true: estamos ACTUALIZANDO, no creando. Si falta id_empleado
    // para GERENTE/EMPLEADO, se delega al roleTransitionValidator (422 + modal)
    if (req.body.idRol || req.body.hasOwnProperty('idCliente') || req.body.hasOwnProperty('idEmpleado')) {
      const isTransition = !!req.body.idRol && req.body.idRol !== usuario.idRol;
      const validacion = await validarReglasRol(nuevoIdRol, nuevoIdCliente, nuevoIdEmpleado, req.user?.rol, isTransition);
      if (!validacion.valido) {
        return res.status(validacion.status).json({ error: validacion.error });
      }
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    const rolActual = await Rol.findByPk(usuario.idRol);
    const nombreRolAfectado = rolActual ? rolActual.nombre.toUpperCase() : 'CLIENTE';

    // ── REGLA: Un SUPER_ADMIN NO puede desactivar su cuenta directamente ──
    // (Esta validación se repite en los métodos de desactivación)

    if (req.user && !puedeModificar(req.user.rol, nombreRolAfectado)) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'INTENTO_ESCALAMIENTO_PRIVILEGIOS',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de modificación prohibida: ${req.user.rol} intentó modificar a ${nombreRolAfectado} (${usuario.username})`,
        ip: req.ip,
      });
      return res.status(403).json({ error: `Jerarquía Bancaria: Su rol (${req.user.rol}) no tiene permisos para modificar a un usuario con nivel (${nombreRolAfectado}).` });
    }

    // --- PROTECCIÓN DE SENIORITY (SUPER_ADMIN) ---
    // Regla: Solo aplica sobre OTROS Super Admins, no sobre sí mismo.
    if (req.user.rol === 'SUPER_ADMIN' && nombreRolAfectado === 'SUPER_ADMIN' && req.user.idUsuario !== usuario.idUsuario) {
      const actor = await Usuario.findByPk(req.user.idUsuario);
      if (!esMasAntiguo(actor, usuario)) {
        await registrarAuditoria({
          idUsuario: req.user.idUsuario,
          accion: 'INTENTO_MODIFICAR_SUPER_ADMIN_SENIOR',
          tablaAfectada: 'USUARIOS',
          descripcion: `SUPER_ADMIN reciente (${actor.username}) intentó modificar a uno más antiguo (${usuario.username})`,
          ip: req.ip,
        });
        return res.status(403).json({ error: 'Seguridad Bancaria: Un SUPER_ADMIN más reciente no puede modificar a uno más antiguo.' });
      }
    }

    // --- REGLA: AUTO-REBAJA DE ROL (SUPER_ADMIN -> OTRO) ---
    if (req.user.idUsuario === usuario.idUsuario && nombreRolAfectado === 'SUPER_ADMIN' && req.body.idRol) {
      const nuevoRolObj = await Rol.findByPk(req.body.idRol);
      const nuevoNombreRol = nuevoRolObj?.nombre?.toUpperCase();

      if (nuevoNombreRol !== 'SUPER_ADMIN') {
        const totalSuperAdminsActivos = await Usuario.count({
          where: { cuentaActiva: true },
          include: [{ model: Rol, as: 'rol', where: { nombre: 'SUPER_ADMIN' } }]
        });

        if (totalSuperAdminsActivos <= 1) {
          await registrarAuditoria({
            idUsuario: req.user.idUsuario,
            accion: 'INTENTO_ABANDONAR_ULTIMO_SUPER_ADMIN',
            tablaAfectada: 'USUARIOS',
            descripcion: `Intento fallido de abandonar el rol SUPER_ADMIN siendo el último activo.`,
            ip: req.ip,
          });
          return res.status(403).json({ error: 'Gobernanza Crítica: No puedes abandonar el rol SUPER_ADMIN porque eres el último SUPER_ADMIN activo del sistema.' });
        }
        
        await registrarAuditoria({
          idUsuario: req.user.idUsuario,
          accion: 'CAMBIO_ROL_SUPER_ADMIN_A_ADMIN',
          tablaAfectada: 'USUARIOS',
          descripcion: `El usuario ${usuario.username} se ha rebajado voluntariamente de SUPER_ADMIN a ${nuevoNombreRol}.`,
          ip: req.ip,
        });
      }
    }

    if (req.body.idRol) {
      const rolSolicitado = await Rol.findByPk(req.body.idRol);
      const nombreRolSolicitado = rolSolicitado?.nombre?.toUpperCase();

      const actorRol = req.user?.rol?.toUpperCase();
      if (rolSolicitado && actorRol && !puedeCrearRol(actorRol, nombreRolSolicitado)) {
        await registrarAuditoria({
          idUsuario: req.user.idUsuario,
          accion: 'INTENTO_ESCALAMIENTO_PRIVILEGIOS',
          tablaAfectada: 'USUARIOS',
          descripcion: `Intento de promoción prohibida: ${actorRol} intentó promover a ${nombreRolSolicitado}`,
          ip: req.ip,
        });
        return res.status(403).json({ error: `Jerarquía Bancaria: Su rol (${actorRol}) no tiene permisos para promover a un usuario al nivel (${nombreRolSolicitado}).` });
      }

      // --- REGLA DE GOBERNANZA: LÍMITE SUPER_ADMIN (MAX 2) EN PROMOCIÓN ---
      if (nombreRolSolicitado === 'SUPER_ADMIN' && usuario.idRol !== req.body.idRol) {
        const totalSuperAdmins = await Usuario.count({
          where: { cuentaActiva: true },
          include: [{ model: Rol, as: 'rol', where: { nombre: 'SUPER_ADMIN' } }]
        });

        if (totalSuperAdmins >= 2) {
           await registrarAuditoria({
            idUsuario: req.user.idUsuario,
            accion: 'INTENTO_PROMOCION_SUPER_ADMIN_FALLIDO',
            tablaAfectada: 'USUARIOS',
            descripcion: `Intento de promoción a SUPER_ADMIN fallido por límite de cuórum (2). Usuario objetivo: ${usuario.username}`,
            ip: req.ip,
          });
          return res.status(403).json({ error: 'Seguridad Bancaria: No se puede promover el usuario a SUPER_ADMIN porque ya existen 2 SUPER_ADMIN activos.' });
        }
      }
    }

    // --- REGLA DE GOBERNANZA: PROTECCIÓN DEL ÚLTIMO SUPER_ADMIN (ABANDONO DE CARGO) ---
    if (req.body.idRol && usuario.rol.nombre === 'SUPER_ADMIN' && req.body.idRol !== usuario.idRol) {
      const totalSuperAdminsActivos = await Usuario.count({
        where: { cuentaActiva: true },
        include: [{ model: Rol, as: 'rol', where: { nombre: 'SUPER_ADMIN' } }]
      });

      if (totalSuperAdminsActivos <= 1) {
        await registrarAuditoria({
          idUsuario: req.user.idUsuario,
          accion: 'INTENTO_ABANDONO_CARGO_SUPER_ADMIN',
          tablaAfectada: 'USUARIOS',
          descripcion: `Intento de rebaja de rol del último SUPER_ADMIN activo (${usuario.username})`,
          ip: req.ip,
        });
        return res.status(403).json({ error: 'Gobernanza Bancaria: Operación denegada. No se puede cambiar el rol del último SUPER_ADMIN activo del sistema.' });
      }
    }

    // -------------------------------------

    // --- VALIDACIÓN DE TRANSICIÓN DE ROL (EMPLEADO REQUERIDO) ---
    if (req.body.idRol && req.body.idRol !== usuario.idRol) {
      const rolDestino = await Rol.findByPk(req.body.idRol);
      const nombreRolDestino = rolDestino?.nombre?.toUpperCase();
      const rolOrigen = await Rol.findByPk(usuario.idRol);
      const nombreRolOrigen = rolOrigen?.nombre?.toUpperCase();

      // Verificar si la transición requiere datos de empleado
      // Pasamos nuevoIdEmpleado (que puede venir del body en un reintento)
      const transicion = validateRoleTransition(nuevoIdEmpleado, nombreRolOrigen, nombreRolDestino);
      if (!transicion.valid) {
        return res.status(422).json({
          error: transicion.message,
          requiresEmpleadoData: transicion.requiresEmpleadoData,
          targetRole: nombreRolDestino,
          userId: usuario.idUsuario,
        });
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
    return res.status(200).json({
      mensaje: 'Usuario actualizado exitosamente.',
      usuario: actualizado
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Error de unicidad: El nombre de usuario o correo electrónico ya se encuentra registrado en el sistema.' });
    }
    return res.status(500).json({ error: 'Ocurrió un error interno del servidor al intentar actualizar el usuario.', detalle: error.message });
  }
};

// ============================================
// DELETE /usuarios/:id — Eliminar usuario (solo ADMIN)
// Hard delete — el middleware verificarRol lo protege
// ============================================
const eliminarUsuario = async (req, res) => {
  try {
    // REGLA: Un usuario no puede eliminarse a sí mismo mediante hard-delete (debe usar desactivarCuenta)
    if (String(req.user.idUsuario) === String(req.params.id)) {
       return res.status(403).json({ error: 'Operación denegada: No puede eliminar su propia cuenta permanentemente. Use la opción de desactivación.' });
    }

    if (!tieneDerechoAcceso(req.user, req.params.id)) {
      return res.status(403).json({ error: 'Acceso denegado: No tiene permisos para eliminar perfiles ajenos.' });
    }

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

    // --- REGLA: NO AUTO-DESACTIVACIÓN DE SUPER_ADMIN ---
    const rolActual = await Rol.findByPk(usuario.idRol);
    if (rolActual?.nombre === 'SUPER_ADMIN') {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'INTENTO_DESACTIVACION_DIRECTA_SUPER_ADMIN',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de desactivación directa de cuenta siendo SUPER_ADMIN.`,
        ip: req.ip,
      });
      return res.status(403).json({ error: 'Gobernanza Bancaria: Un SUPER_ADMIN no puede desactivar su propia cuenta directamente. Primero debe rebajar su rol a ADMIN.' });
    }

    // Soft delete: desactivar cuenta y cerrar sesión
    await usuario.update({ cuentaActiva: false, usuarioLogeado: false });

    return res.status(200).json({
      mensaje: 'Cuenta desactivada exitosamente. Ya no podrá iniciar sesión en el sistema.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Ocurrió un error interno del servidor al intentar desactivar la cuenta.', detalle: error.message });
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
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'INTENTO_DESACTIVAR_SUPERIOR',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de desactivación prohibida: ${req.user.rol} intentó desactivar a ${nombreRolAfectado}`,
        ip: req.ip,
      });
      return res.status(403).json({ error: `Jerarquía Bancaria: Su rol (${req.user.rol}) no tiene permisos para desactivar a un usuario con nivel (${nombreRolAfectado}).` });
    }

    // --- PROTECCIÓN DE SENIORITY (SUPER_ADMIN) ---
    if (req.user.rol === 'SUPER_ADMIN' && nombreRolAfectado === 'SUPER_ADMIN' && req.user.idUsuario !== usuario.idUsuario) {
      const actor = await Usuario.findByPk(req.user.idUsuario);
      if (!esMasAntiguo(actor, usuario)) {
        await registrarAuditoria({
          idUsuario: req.user.idUsuario,
          accion: 'INTENTO_DESACTIVAR_SUPER_ADMIN_SENIOR',
          tablaAfectada: 'USUARIOS',
          descripcion: `SUPER_ADMIN reciente (${actor.username}) intentó desactivar a uno más antiguo (${usuario.username})`,
          ip: req.ip,
        });
        return res.status(403).json({ error: 'Seguridad Bancaria: Un SUPER_ADMIN más reciente no puede desactivar a uno más antiguo.' });
      }
    }

    // --- PROTECCIÓN AUTO-DESACTIVACIÓN SUPER_ADMIN ---
    if (nombreRolAfectado === 'SUPER_ADMIN' && usuario.idUsuario === req.user.idUsuario) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'INTENTO_DESACTIVACION_DIRECTA_SUPER_ADMIN',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de desactivación directa (vía gestión) siendo SUPER_ADMIN.`,
        ip: req.ip,
      });
      return res.status(403).json({ error: 'Gobernanza Bancaria: Un SUPER_ADMIN no puede desactivar su propia cuenta directamente. Primero debe rebajar su rol a ADMIN.' });
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
      const errorMsg = nombreRolAfectado === 'SUPER_ADMIN' 
        ? 'Jerarquía Bancaria: SOLO un SUPER_ADMIN puede reactivar cuentas de SUPER_ADMIN.'
        : `Operación denegada por jerarquía: Su rol (${req.user.rol}) no tiene permisos para reactivar a un usuario con rol (${nombreRolAfectado}).`;
      
      return res.status(403).json({ error: errorMsg });
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
