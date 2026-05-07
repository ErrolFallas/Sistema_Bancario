// ============================================
// Controlador: UsuarioCompletoController
// Endpoint transaccional: crea Usuario + Cliente/Empleado
// en una sola operación atómica (rollback si falla)
// ============================================
// FLUJO:
//   1. Validar datos de entrada según rol seleccionado
//   2. Iniciar transacción Sequelize
//   3. Crear Cliente o Empleado (si aplica)
//   4. Crear Usuario con FK correspondiente
//   5. Registrar auditoría
//   6. Commit o Rollback
// ============================================

const bcrypt = require('bcrypt');
const { sequelize, Usuario, Rol, Cliente, Empleado, Banco } = require('../models');
const { registrarAuditoria, descripcionCrearUsuario, descripcionCrearCliente, descripcionCrearEmpleado } = require('../utils/auditoria');
const { puedeModificar, puedeCrearRol } = require('../utils/jerarquia');

const SALT_ROUNDS = 10;

// ============================================
// POST /usuarios/completo — Crear usuario con entidad asociada
// ============================================
const crearUsuarioCompleto = async (req, res) => {
  // Iniciar transacción — si algo falla, TODO se revierte
  const t = await sequelize.transaction();

  try {
    const {
      // Datos del usuario
      username, password, idRol, usuarioEmail,
      // Datos del cliente (solo si rol = CLIENTE)
      clienteNombre, clienteApellido, clienteCedula, clienteTelefono, clienteDireccion,
      // Datos del empleado (solo si rol = EMPLEADO o GERENTE)
      empleadoNombre, empleadoApellido, empleadoTelefono, empleadoIdBanco,
    } = req.body;

    console.log('[UsuarioCompletoController] Datos recibidos:', {
      username, idRol,
      esCliente: !!clienteNombre,
      esEmpleado: !!empleadoNombre
    });

    // ── VALIDACIONES BASE ──────────────────────────────────────────
    if (!username || !password || !idRol) {
      await t.rollback();
      return res.status(400).json({ error: 'Error de validación: Los campos username, password e idRol son obligatorios.' });
    }

    const usernameNormalizado = username.trim().toLowerCase();
    // Verificar si el username ya existe
    const existeUsername = await Usuario.findOne({ where: { username: usernameNormalizado }, transaction: t });
    if (existeUsername) {
      await t.rollback();
      return res.status(400).json({ error: 'El nombre de usuario ya se encuentra registrado.' });
    }

    // Verificar si el email de usuario ya existe
    let emailNormalizado = null;
    if (usuarioEmail) {
      emailNormalizado = usuarioEmail.trim().toLowerCase();
      const existeEmail = await Usuario.findOne({ where: { email: emailNormalizado }, transaction: t });
      if (existeEmail) {
        await t.rollback();
        return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }
    }

    // Obtener el rol solicitado
    const rol = await Rol.findByPk(idRol, { transaction: t });
    if (!rol) {
      await t.rollback();
      return res.status(400).json({ error: `No existe un rol con el ID '${idRol}'.` });
    }

    const nombreRol = rol.nombre.toUpperCase();

    // ── REGLA DE GOBERNANZA: LÍMITE SUPER_ADMIN (MAX 2) ─────────────
    if (nombreRol === 'SUPER_ADMIN') {
      const totalSuperAdmins = await Usuario.count({
        where: { cuentaActiva: true },
        include: [{
          model: Rol,
          as: 'rol',
          where: { nombre: 'SUPER_ADMIN' }
        }],
        transaction: t
      });

      if (totalSuperAdmins >= 2) {
        await t.rollback();
        // Auditoría del intento fallido
        await registrarAuditoria({
          idUsuario: req.user?.idUsuario || null,
          accion: 'INTENTO_CREAR_SUPER_ADMIN',
          tablaAfectada: 'USUARIOS',
          descripcion: `Intento fallido de crear tercer SUPER_ADMIN. Límite alcanzado (2).`,
          ip: req.ip,
        });
        return res.status(403).json({ error: 'Seguridad Bancaria: Se ha alcanzado el límite máximo de 2 SUPER_ADMIN activos en el sistema.' });
      }
    }

    // ── VALIDACIÓN DE JERARQUÍA (CREACIÓN) ─────────────────────────
    if (req.user && !puedeCrearRol(req.user.rol, nombreRol)) {
      await t.rollback();
      await registrarAuditoria({
        idUsuario: req.user?.idUsuario || null,
        accion: 'INTENTO_ESCALAMIENTO_PRIVILEGIOS',
        tablaAfectada: 'USUARIOS',
        descripcion: `Intento de creación de rol superior: ${req.user.rol} intentó crear ${nombreRol}`,
        ip: req.ip,
      });
      return res.status(403).json({ error: `Jerarquía Bancaria: Su rol (${req.user.rol}) no tiene permisos para crear usuarios con nivel (${nombreRol}).` });
    }

    let idCliente = null;
    let idEmpleado = null;

    // ── CASO 1: ROL CLIENTE → Crear Cliente primero ────────────────
    if (nombreRol === 'CLIENTE') {
      if (!clienteNombre || !clienteApellido || !clienteCedula) {
        await t.rollback();
        return res.status(400).json({ error: 'Error de validación: Para rol CLIENTE, los campos clienteNombre, clienteApellido y clienteCedula son obligatorios.' });
      }

      const cliente = await Cliente.create({
        nombre: clienteNombre,
        apellido: clienteApellido,
        cedula: clienteCedula,
        telefono: clienteTelefono || null,
        direccion: clienteDireccion || null,
      }, { transaction: t });

      idCliente = cliente.idCliente;

      idCliente = cliente.idCliente;

      // Auditoría: creación de cliente
      const descCliente = await descripcionCrearCliente(req.user, cliente, t);
      await registrarAuditoria({
        idUsuario: req.user?.idUsuario || null,
        accion: 'CREATE',
        tablaAfectada: 'CLIENTES',
        idRegistro: cliente.idCliente,
        descripcion: descCliente,
        ip: req.ip,
      }, t);
    }

    // ── CASO 2: ROL EMPLEADO o GERENTE → Crear Empleado primero ────
    if (nombreRol === 'EMPLEADO' || nombreRol === 'GERENTE') {
      if (!empleadoNombre || !empleadoApellido || !empleadoIdBanco) {
        await t.rollback();
        return res.status(400).json({ error: `Error de validación: Para rol ${nombreRol}, los campos empleadoNombre, empleadoApellido y empleadoIdBanco son obligatorios.` });
      }

      // Verificar que el banco exista
      const banco = await Banco.findByPk(empleadoIdBanco, { transaction: t });
      if (!banco) {
        await t.rollback();
        return res.status(404).json({ error: `No se encontró un Banco con el ID '${empleadoIdBanco}'.` });
      }

      const empleado = await Empleado.create({
        nombre: empleadoNombre,
        apellido: empleadoApellido,
        telefono: empleadoTelefono || null,
        idBanco: empleadoIdBanco,
      }, { transaction: t });

      idEmpleado = empleado.idEmpleado;

      // Auditoría: creación de empleado
      const descEmpleado = await descripcionCrearEmpleado(req.user, empleado, t);
      await registrarAuditoria({
        idUsuario: req.user?.idUsuario || null,
        accion: 'CREATE',
        tablaAfectada: 'EMPLEADOS',
        idRegistro: empleado.idEmpleado,
        descripcion: descEmpleado,
        ip: req.ip,
      }, t);
    }

    // ── CASO 3: ADMIN / SUPER_ADMIN → Sin entidad asociada ─────────
    // (idCliente e idEmpleado permanecen null)

    // ── CREAR USUARIO ──────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await Usuario.create({
      username: usernameNormalizado,
      passwordHash,
      email: emailNormalizado,
      cuentaActiva: true,
      idRol,
      idCliente,
      idEmpleado,
    }, { transaction: t });

    // Auditoría: creación de usuario
    const descUsuario = await descripcionCrearUsuario(req.user, usuario, nombreRol, t);
    await registrarAuditoria({
      idUsuario: req.user?.idUsuario || null,
      accion: 'CREATE',
      tablaAfectada: 'USUARIOS',
      idRegistro: usuario.idUsuario,
      descripcion: descUsuario,
      ip: req.ip,
    }, t);

    // ── COMMIT ─────────────────────────────────────────────────────
    await t.commit();

    // Respuesta sin exponer el hash
    const { passwordHash: _, ...usuarioPublico } = usuario.toJSON();
    return res.status(201).json({
      mensaje: `Usuario '${username}' creado exitosamente con rol ${nombreRol}.`,
      usuario: usuarioPublico,
      rolAsignado: nombreRol,
      entidadCreada: idCliente ? 'CLIENTE' : idEmpleado ? 'EMPLEADO' : 'NINGUNA',
    });

  } catch (error) {
    // ── ROLLBACK ───────────────────────────────────────────────────
    await t.rollback();
    console.error('[UsuarioCompletoController] Error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Error de unicidad: El nombre de usuario o correo electrónico ya se encuentra registrado en el sistema institucional.' });
    }
    return res.status(500).json({
      error: 'Ocurrió un error interno del servidor al intentar realizar el registro transaccional del usuario completo.',
      detalle: error.message,
    });
  }
};

module.exports = { crearUsuarioCompleto };
