// ============================================
// Controller: AuthController
// Responsabilidad única: autenticación y JWT
// ============================================

// REGLAS DE CREACIÓN:
// - Primer usuario → SUPER_ADMIN sin relaciones
// - Registro público → rol CLIENTE, requiere id_cliente previo
// REGLAS DE SESIÓN:
// - Login → valida cuenta_activa, genera JWT, marca usuario_logeado = true
// - Logout → marca usuario_logeado = false (requiere JWT válido)
// ============================================

const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { Usuario, Rol, Cliente } = require('../models');
const { registrarAuditoria } = require('../utils/auditoria');

// ============================================
// POST /auth/login
// Valida credenciales y emite un JWT (30 min)
// Marca usuario_logeado = true
// ============================================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Campos obligatorios
    if (!username || !password) {
      return res.status(400).json({ error: 'Error de validación: Los campos "username" y "password" son estrictamente obligatorios para iniciar sesión.' });
    }

    // 2. Buscar usuario con su rol
    const usuario = await Usuario.findOne({
      where: { username },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Error de autenticación: El nombre de usuario ingresado no existe en el sistema.' });
    }

    // 3. Verificar si la cuenta está activa
    if (!usuario.cuentaActiva) {
      return res.status(403).json({ error: 'Acceso denegado: Su cuenta se encuentra inactiva o ha sido suspendida. Por favor, contacte al administrador del sistema.' });
    }

    // 4. Verificar si el rol está activo
    if (usuario.rol && !usuario.rol.isActive) {
      return res.status(403).json({ error: 'Su rol de acceso ha sido desactivado. Contacte al administrador del sistema.' });
    }

    // 4. Comparar contraseña con hash bcrypt
    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({ error: 'Error de autenticación: La contraseña ingresada es incorrecta.' });
    }

    // 5. Marcar usuario como logeado
    await usuario.update({ usuarioLogeado: true });

    // 6. Construir payload del JWT
    const payload = {
      idUsuario    : usuario.idUsuario,
      username     : usuario.username,
      rol          : usuario.rol ? usuario.rol.nombre.toUpperCase() : null,
      cuentaActiva : usuario.cuentaActiva,
      idCliente    : usuario.idCliente,
      idEmpleado   : usuario.idEmpleado
    };

    // 7. Firmar token — 30 minutos de expiración
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    // 8. Enviar Token en Cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', // O 'Strict' según necesidad
      maxAge: 30 * 60 * 1000 // 30 minutos en ms
    });

    // 9. Respuesta — ya no incluimos el token en el JSON por seguridad
    return res.status(200).json({
      mensaje   : 'Inicio de sesión exitoso. Bienvenido al sistema.',
      usuario: {
        idUsuario    : usuario.idUsuario,
        username     : usuario.username,
        rol          : payload.rol,
        cuentaActiva : usuario.cuentaActiva,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Ocurrió un error interno del servidor al intentar procesar su inicio de sesión.', detalle: error.message });
  }
};

// ============================================
// POST /auth/logout
// Cierra la sesión del usuario autenticado
// Marca usuario_logeado = false
// (requiere autenticarToken middleware)
// ============================================
const logout = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.idUsuario);

    if (!usuario) {
      return res.status(404).json({ error: 'Error: No se encontró la información de su usuario en la base de datos.' });
    }

    // Marcar sesión como cerrada
    await usuario.update({ usuarioLogeado: false });

    // Limpiar cookie del token
    res.clearCookie('token');

    return res.status(200).json({
      mensaje: 'Sesión cerrada correctamente.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// GET /auth/me
// Retorna información del usuario autenticado
// (requiere autenticarToken middleware)
// ============================================
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.idUsuario, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Error de búsqueda: No se pudo encontrar la información de su usuario en la base de datos empresarial. Verifique que su cuenta exista.' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Ocurrió un error interno del servidor al intentar obtener su perfil.', detalle: error.message });
  }
};

// ============================================
// POST /auth/register
// Registro de usuario con reglas estrictas:
// - Primer usuario → SUPER_ADMIN (sin relaciones)
// - Siguientes → CLIENTE (requiere id_cliente previo)
// ============================================
const register = async (req, res) => {
  try {
    const { username, password, email, idCliente } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Error de validación: Username y password son obligatorios para registrarse.' });
    }

    // Normalizar username
    const usernameNormalizado = username.trim().toLowerCase();

    // Normalizar email si se provee
    let emailNormalizado = null;
    if (email) {
      emailNormalizado = email.trim().toLowerCase();
    }

    // ── DOBLE VALIDACIÓN (CAPA APLICACIÓN) ──
    const existeUsername = await Usuario.findOne({ where: { username: usernameNormalizado } });
    if (existeUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya se encuentra registrado.' });
    }

    if (emailNormalizado) {
      const existeEmail = await Usuario.findOne({ where: { email: emailNormalizado } });
      if (existeEmail) {
        return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }
    }

    const totalUsuarios = await Usuario.count();
    let rolAsignado;
    let idClienteFinal = null;

    // ============================================
    // CASO 1: Primer usuario → SUPER_ADMIN
    // Sin relaciones (id_cliente e id_empleado = null)
    // ============================================
    if (totalUsuarios === 0) {
      let rolAdmin = await Rol.findOne({ where: { nombre: 'SUPER_ADMIN' } });
      if (!rolAdmin) {
        rolAdmin = await Rol.create({ nombre: 'SUPER_ADMIN', descripcion: 'Administrador Supremo' });
      }
      rolAsignado = rolAdmin;
      idClienteFinal = null;

    // ============================================
    // CASO 2: Usuarios subsiguientes → CLIENTE
    // Requiere id_cliente previo en la BD
    // ============================================
    } else {
      let rolCliente = await Rol.findOne({ where: { nombre: 'CLIENTE' } });
      if (!rolCliente) {
        rolCliente = await Rol.create({ nombre: 'CLIENTE', descripcion: 'Cliente estándar' });
      }
      rolAsignado = rolCliente;

      if (!idCliente) {
        return res.status(400).json({
          error: 'Error de validación: Para registrarse como CLIENTE, debe proporcionar un id_cliente válido. El registro de cliente debe ser creado previamente por un ADMIN, GERENTE o EMPLEADO a través de POST /clientes.',
        });
      }

      const clienteExiste = await Cliente.findByPk(idCliente);
      if (!clienteExiste) {
        return res.status(404).json({
          error: `Error de validación: No se encontró un registro de Cliente con el ID '${idCliente}'. Verifique que el cliente haya sido creado previamente.`,
        });
      }

      idClienteFinal = idCliente;
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario (cuenta_activa = true, usuario_logeado = false por defecto)
    const nuevoUsuario = await Usuario.create({
      username: usernameNormalizado,
      passwordHash,
      email: emailNormalizado,
      cuentaActiva: true,
      idRol: rolAsignado.idRol,
      idCliente: idClienteFinal,
      idEmpleado: null,
    });

    // --- AUDITORÍA AUTOMÁTICA ---
    let descripcionAuditoria;
    if (totalUsuarios === 0) {
      descripcionAuditoria = `Registro automático del primer SUPER_ADMIN: ${username}`;
    } else {
      const clienteInfo = await Cliente.findByPk(idClienteFinal);
      const nombreCliente = clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : `id_cliente: ${idClienteFinal}`;
      descripcionAuditoria = `Auto-registro del usuario ${username} como CLIENTE (Cliente: ${nombreCliente})`;
    }
    await registrarAuditoria({
      idUsuario: nuevoUsuario.idUsuario,
      accion: 'CREATE',
      tablaAfectada: 'USUARIOS',
      idRegistro: nuevoUsuario.idUsuario,
      descripcion: descripcionAuditoria,
      ip: req.ip,
    });
    // -----------------------------

    const { passwordHash: _, ...usuarioResponse } = nuevoUsuario.toJSON();
    
    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: usuarioResponse,
      rolAsignado: rolAsignado.nombre
    });
  } catch (error) {
    // ── DOBLE VALIDACIÓN (CAPA BASE DE DATOS) ──
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Error de unicidad: El nombre de usuario o correo electrónico ya se encuentra registrado en el sistema institucional.' });
    }
    return res.status(500).json({
      error: 'Ocurrió un error interno del servidor al intentar realizar el registro transaccional del usuario completo.',
      detalle: error.message,
    });
  }
};

module.exports = { login, logout, me, register };
