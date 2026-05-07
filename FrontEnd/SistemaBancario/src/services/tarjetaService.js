import api from './api';

/**
 * Servicio de Tarjetas
 * CRUD + soft delete — Consume /tarjetas
 */
const tarjetaService = {
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get(`/tarjetas${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tarjetas/${id}`);
    return response.data;
  },

  create: async (tarjetaData) => {
    const response = await api.post('/tarjetas', tarjetaData);
    return response.data;
  },

  update: async (id, tarjetaData) => {
    const response = await api.patch(`/tarjetas/${id}`, tarjetaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tarjetas/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/tarjetas/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/tarjetas/${id}/reactivar`);
    return response.data;
  },
};

export default tarjetaService;
