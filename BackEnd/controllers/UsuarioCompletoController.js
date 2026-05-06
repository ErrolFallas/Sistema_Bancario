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

    // ── VALIDACIONES BASE ──────────────────────────────────────────
    if (!username || !password || !idRol) {
      await t.rollback();
      return res.status(400).json({ error: 'Error de validación: Los campos username, password e idRol son obligatorios.' });
    }

    // Verificar si el username ya existe
    const existeUsername = await Usuario.findOne({ where: { username }, transaction: t });
    if (existeUsername) {
      await t.rollback();
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso. Por favor elija otro.' });
    }

    // Verificar si el email de usuario ya existe
    if (usuarioEmail) {
      const existeEmail = await Usuario.findOne({ where: { email: usuarioEmail }, transaction: t });
      if (existeEmail) {
        await t.rollback();
        return res.status(400).json({ error: 'El email del usuario ya está registrado en el sistema.' });
      }
    }

    // Obtener el rol solicitado
    const rol = await Rol.findByPk(idRol, { transaction: t });
    if (!rol) {
      await t.rollback();
      return res.status(400).json({ error: `No existe un rol con el ID '${idRol}'.` });
    }

    const nombreRol = rol.nombre.toUpperCase();

    // ── VALIDACIÓN DE JERARQUÍA ────────────────────────────────────
    if (nombreRol === 'SUPER_ADMIN' && req.user.rol !== 'SUPER_ADMIN') {
      await t.rollback();
      return res.status(403).json({ error: 'Solo un SUPER_ADMIN puede crear otro SUPER_ADMIN.' });
    }
    if (nombreRol === 'SUPER_ADMIN' && req.user.rol === 'ADMIN') {
      await t.rollback();
      return res.status(403).json({ error: 'Un ADMIN no puede crear usuarios con privilegios de SUPER_ADMIN.' });
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

      // Auditoría: creación de cliente
      const descCliente = await descripcionCrearCliente(req.user, cliente);
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'CREATE',
        tablaAfectada: 'CLIENTES',
        idRegistro: cliente.idCliente,
        descripcion: descCliente,
        ip: req.ip,
      });
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
      const descEmpleado = await descripcionCrearEmpleado(req.user, empleado);
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'CREATE',
        tablaAfectada: 'EMPLEADOS',
        idRegistro: empleado.idEmpleado,
        descripcion: descEmpleado,
        ip: req.ip,
      });
    }

    // ── CASO 3: ADMIN / SUPER_ADMIN → Sin entidad asociada ─────────
    // (idCliente e idEmpleado permanecen null)

    // ── CREAR USUARIO ──────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await Usuario.create({
      username,
      passwordHash,
      email: usuarioEmail || null,
      cuentaActiva: true,
      idRol,
      idCliente,
      idEmpleado,
    }, { transaction: t });

    // Auditoría: creación de usuario
    const descUsuario = await descripcionCrearUsuario(req.user, usuario, nombreRol);
    await registrarAuditoria({
      idUsuario: req.user.idUsuario,
      accion: 'CREATE',
      tablaAfectada: 'USUARIOS',
      idRegistro: usuario.idUsuario,
      descripcion: descUsuario,
      ip: req.ip,
    });

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
    return res.status(500).json({
      error: 'Error interno del servidor al crear usuario completo.',
      detalle: error.message,
    });
  }
};

module.exports = { crearUsuarioCompleto };
