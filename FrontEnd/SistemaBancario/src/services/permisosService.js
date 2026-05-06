import api from './api';

/**
 * Servicio de Permisos
 * Consume /permisos para obtener los permisos disponibles en el sistema
 */
const permisosService = {
  /**
   * Listar todos los permisos disponibles
   */
  getAll: async () => {
    const response = await api.get('/permisos');
    return response.data;
  },

  /**
   * Obtener un permiso por ID
   */
  getById: async (id) => {
    const response = await api.get(`/permisos/${id}`);
    return response.data;
  },
};

export default permisosService;
