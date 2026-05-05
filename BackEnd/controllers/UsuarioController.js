// ============================================
// Controlador: UsuarioController
// CRUD de usuarios + soft-delete
// Login/JWT → AuthController (separado)
// ============================================

const bcrypt = require('bcrypt');
const { Usuario, Rol, Cliente, Empleado } = require('../models');

const SALT_ROUNDS = 10;

// ============================================
// POST /usuarios — Crear usuario (ADMIN)
// ============================================
const crearUsuario = async (req, res) => {
  try {
    const { password, ...resto } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Error de validación: La contraseña es un campo obligatorio para crear un usuario. Por favor proporcione un valor válido.' });
    }

    // --- LOGICA DE JERARQUÍA DE ROLES ---
    if (req.body.idRol && req.user && req.user.rol === 'ADMIN') {
      const rolSolicitado = await Rol.findByPk(req.body.idRol);
      if (rolSolicitado && rolSolicitado.nombre === 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Operación denegada: Un ADMIN no puede crear usuarios con privilegios de SUPER_ADMIN.' });
      }
    }
    // -------------------------------------

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await Usuario.create({ ...resto, passwordHash: hash });

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

    if (!usuario.activo) {
      return res.status(400).json({ error: 'Error de estado: Su cuenta ya se encuentra desactivada actualmente.' });
    }

    // Soft delete: cambiar activo a false, NO borrar registro
    await usuario.update({ activo: false });

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
