import api from './api';

/**
 * Servicio de Usuarios
 * CRUD básico + endpoint transaccional para crear usuario completo
 */
const usuarioService = {
  /**
   * Listar todos los usuarios (Requiere permisos de ADMIN/SUPER_ADMIN)
   */
  getAll: async () => {
    const response = await api.get('/usuarios');
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
