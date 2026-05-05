// ============================================
// Controlador: EmpleadoController
// CRUD para la entidad Empleado
// ============================================

const { Empleado, Banco } = require("../models");

const crearEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.create(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      include: [{ model: Banco, as: "banco" }],
    });
    return res.status(200).json(empleados);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarEmpleadoId = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id, {
      include: [{ model: Banco, as: "banco" }],
    });
    if (!empleado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Empleado con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(empleado);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Empleado con el ID proporcionado en la base de datos.` });
    }
    await empleado.update(req.body);
    return res.status(200).json(empleado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Empleado con el ID proporcionado en la base de datos.` });
    }
    await empleado.destroy();
    return res.status(200).json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearEmpleado,
  buscarEmpleados,
  buscarEmpleadoId,
  actualizarEmpleado,
  eliminarEmpleado,
};
