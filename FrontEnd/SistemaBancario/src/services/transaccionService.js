import api from './api';

/**
 * Servicio de Transacciones
 * Consume /transacciones — Solo lectura + creación
 */
const transaccionService = {
  getAll: async () => {
    const response = await api.get('/transacciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transacciones/${id}`);
    return response.data;
  },

  create: async (transaccionData) => {
    const response = await api.post('/transacciones', transaccionData);
    return response.data;
  },
};

export default transaccionService;
