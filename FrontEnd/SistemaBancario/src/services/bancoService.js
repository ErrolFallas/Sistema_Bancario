import api from './api';

/**
 * Servicio de Bancos
 * Consume /bancos para obtener los bancos disponibles en el sistema
 */
const bancoService = {
  /**
   * Listar todos los bancos disponibles
   */
  getAll: async () => {
    const response = await api.get('/bancos');
    return response.data;
  },
};

export default bancoService;
