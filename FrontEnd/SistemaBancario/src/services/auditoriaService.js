import api from './api';

/**
 * Servicio de Historial de Auditoría
 * Consume /historial-auditoria — Solo lectura (ADMIN+)
 */
const auditoriaService = {
  getAll: async () => {
    const response = await api.get('/historial-auditoria');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/historial-auditoria/${id}`);
    return response.data;
  },
};

export default auditoriaService;
