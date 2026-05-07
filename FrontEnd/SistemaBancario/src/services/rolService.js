import api from './api';

/**
 * Servicio de Roles
 * CRUD completo — consume /roles (endpoints existentes del backend)
 */
const rolService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  create: async (rolData) => {
    const response = await api.post('/roles', rolData);
    return response.data;
  },

  update: async (id, rolData) => {
    const response = await api.patch(`/roles/${id}`, rolData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/roles/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/roles/${id}/reactivar`);
    return response.data;
  },
};

export default rolService;
