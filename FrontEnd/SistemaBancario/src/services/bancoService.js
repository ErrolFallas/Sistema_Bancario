import api from './api';

/**
 * Servicio de Bancos
 * CRUD completo + soft delete — Consume /bancos
 */
const bancoService = {
  /**
   * Listar todos los bancos disponibles
   */
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get(`/bancos${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bancos/${id}`);
    return response.data;
  },

  create: async (bancoData) => {
    const response = await api.post('/bancos', bancoData);
    return response.data;
  },

  update: async (id, bancoData) => {
    const response = await api.patch(`/bancos/${id}`, bancoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/bancos/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/bancos/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/bancos/${id}/reactivar`);
    return response.data;
  },
};

export default bancoService;
