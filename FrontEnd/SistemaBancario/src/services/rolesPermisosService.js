import api from './api';

/**
 * Servicio de Roles-Permisos
 * Consume /roles-permisos para asociar permisos a roles (Tabla pivote)
 */
const rolesPermisosService = {
  /**
   * Listar todas las asociaciones rol-permiso
   */
  getAll: async () => {
    const response = await api.get('/roles-permisos');
    return response.data;
  },

  /**
   * Crear nueva asociación (Asignar un permiso a un rol)
   * data = { idRol, idPermiso }
   */
  create: async (data) => {
    const response = await api.post('/roles-permisos', data);
    return response.data;
  },
  
  /**
   * Eliminar una asociación rol-permiso por su ID en la tabla pivote
   */
  delete: async (idRolPermiso) => {
    const response = await api.delete(`/roles-permisos/${idRolPermiso}`);
    return response.data;
  }
};

export default rolesPermisosService;
