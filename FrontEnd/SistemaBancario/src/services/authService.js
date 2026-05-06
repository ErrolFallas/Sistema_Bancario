import api from './api';

/**
 * Servicio de Autenticación
 * Responsable de login, logout y persistencia de sesión por cookies.
 */
const authService = {
  /**
   * Inicia sesión en el sistema.
   * Las cookies se gestionan automáticamente por el navegador.
   */
  login: async (credentials) => {
    // credentials = { username, password }
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Cierra la sesión activa.
   * El servidor limpiará la cookie httpOnly.
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Obtiene la información del usuario autenticado basado en la cookie.
   * Útil para recuperar la sesión al recargar la página.
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
