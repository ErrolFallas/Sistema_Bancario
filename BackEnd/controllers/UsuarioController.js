// ============================================
// Controlador: UsuarioController
// CRUD para la entidad Usuario
// ============================================

const { Usuario, Rol, Cliente, Empleado } = require("../models");

const crearUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { model: Rol, as: "rol" },
        { model: Cliente, as: "cliente" },
        { model: Empleado, as: "empleado" },
      ],
    });
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarUsuarioId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [
        { model: Rol, as: "rol" },
        { model: Cliente, as: "cliente" },
        { model: Empleado, as: "empleado" },
      ],
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    await usuario.update(req.body);
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    await usuario.destroy();
    return res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
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
};
