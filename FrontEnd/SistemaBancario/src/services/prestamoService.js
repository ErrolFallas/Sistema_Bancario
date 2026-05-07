import api from './api';

/**
 * Servicio de Préstamos
 * CRUD + soft delete — Consume /prestamos
 */
const prestamoService = {
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get(`/prestamos${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/prestamos/${id}`);
    return response.data;
  },

  create: async (prestamoData) => {
    const response = await api.post('/prestamos', prestamoData);
    return response.data;
  },

  update: async (id, prestamoData) => {
    const response = await api.patch(`/prestamos/${id}`, prestamoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/prestamos/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/prestamos/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/prestamos/${id}/reactivar`);
    return response.data;
  },
};

export default prestamoService;
