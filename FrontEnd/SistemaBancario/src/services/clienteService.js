import api from './api';

/**
 * Servicio de Clientes
 * CRUD para la gestión de clientes bancarios
 */
const clienteService = {
  /**
   * Listar clientes
   */
  getAll: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  /**
   * Obtener detalle de un cliente
   */
  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  /**
   * Crear cliente
   */
  create: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  /**
   * Actualizar cliente
   */
  update: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  }
};

export default clienteService;
