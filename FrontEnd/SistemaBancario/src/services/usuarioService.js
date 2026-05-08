import api from './api';

/**
 * Servicio de Usuarios
 * CRUD básico + endpoint transaccional para crear usuario completo
 */
const usuarioService = {
  /**
   * Listar todos los usuarios (Requiere permisos de ADMIN/SUPER_ADMIN)
   */
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get(`/usuarios${params}`);
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo usuario simple (Solo por administradores)
   */
  create: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  /**
   * Crear usuario completo con entidad asociada (Cliente/Empleado)
   * Endpoint transaccional: un solo submit crea TODO o nada
   */
  createCompleto: async (userData) => {
    const response = await api.post('/usuarios/completo', userData);
    return response.data;
  },

  /**
   * Actualizar usuario
   */
  update: async (id, userData) => {
    const response = await api.patch(`/usuarios/${id}`, userData);
    return response.data;
  },

  /**
   * Transición de rol con datos de empleado.
   * Para degradaciones de ADMIN/SUPER_ADMIN → GERENTE/EMPLEADO
   * cuando el usuario NO tiene id_empleado.
   * 
   * Flujo:
   *   1. Crear registro de Empleado (POST /empleados)
   *   2. Actualizar usuario con idEmpleado + nuevo idRol (PATCH /usuarios/:id)
   */
  updateWithEmpleado: async (id, empleadoData, idRol) => {
    // Paso 1: Crear empleado
    const empleadoResponse = await api.post('/empleados', empleadoData);
    const nuevoEmpleado = empleadoResponse.data;
    const idEmpleado = nuevoEmpleado.idEmpleado;

    // Paso 2: Actualizar usuario con el nuevo empleado y rol
    const response = await api.patch(`/usuarios/${id}`, {
      idRol,
      idEmpleado,
    });
    return {
      ...response.data,
      empleadoCreado: nuevoEmpleado,
    };
  },

  /**
   * Eliminar usuario
   */
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Desactivar usuario lógicamente (Soft Delete)
   */
  desactivar: async (id) => {
    const response = await api.patch(`/usuarios/${id}/desactivar`);
    return response.data;
  },

  /**
   * Reactivar usuario lógicamente
   */
  reactivar: async (id) => {
    const response = await api.patch(`/usuarios/${id}/reactivar`);
    return response.data;
  }
};

export default usuarioService;
