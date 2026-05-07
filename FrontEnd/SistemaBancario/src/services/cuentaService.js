import api from './api';

/**
 * Servicio de Cuentas Bancarias
 * CRUD completo + soft delete (desactivar/reactivar)
 * Consume /cuentas
 */
const cuentaService = {
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get(`/cuentas${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cuentas/${id}`);
    return response.data;
  },

  create: async (cuentaData) => {
    const response = await api.post('/cuentas', cuentaData);
    return response.data;
  },

  update: async (id, cuentaData) => {
    const response = await api.patch(`/cuentas/${id}`, cuentaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cuentas/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/cuentas/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/cuentas/${id}/reactivar`);
    return response.data;
  },
};

export default cuentaService;
