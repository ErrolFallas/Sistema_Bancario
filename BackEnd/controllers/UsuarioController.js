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
      return res.status(400).json({ error: 'La contraseña es obligatoria.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await Usuario.create({ ...resto, passwordHash: hash });

    // No exponer el hash en la respuesta
    const { passwordHash: _, ...usuarioPublico } = usuario.toJSON();
    return res.status(201).json(usuarioPublico);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// PATCH /usuarios/:id — Actualizar usuario (ADMIN)
// ============================================
const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Re-hashear contraseña si viene nueva
    if (req.body.password) {
      req.body.passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
      delete req.body.password;
    }

    await usuario.update(req.body);

    const { passwordHash: _, ...actualizado } = usuario.toJSON();
    return res.status(200).json(actualizado);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    await usuario.destroy();
    return res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (!usuario.activo) {
      return res.status(400).json({ error: 'La cuenta ya está desactivada.' });
    }

    // Soft delete: cambiar activo a false, NO borrar registro
    await usuario.update({ activo: false });

    return res.status(200).json({
      mensaje: 'Cuenta desactivada exitosamente. Ya no podrá iniciar sesión.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
