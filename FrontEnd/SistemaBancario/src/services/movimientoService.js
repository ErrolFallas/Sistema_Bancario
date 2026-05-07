import api from './api';

/**
 * Servicio de Movimientos
 * Consume /movimientos — Solo lectura
 */
const movimientoService = {
  getAll: async () => {
    const response = await api.get('/movimientos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/movimientos/${id}`);
    return response.data;
  },
};

export default movimientoService;
