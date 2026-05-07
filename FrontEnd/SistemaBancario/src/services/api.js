import axios from 'axios';

// Configuración de la URL base - Puede venir de variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Instancia centralizada de Axios
 * --------------------------------
 * withCredentials: true es IMPRESCINDIBLE para que el navegador 
 * envíe y reciba las cookies httpOnly de forma automática.
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Errores
 * ---------------------
 * Centraliza la extracción de mensajes de error del backend
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extraer mensaje de error del backend o usar uno genérico
    const message = error.response?.data?.error || error.response?.data?.mensaje || 'Error inesperado en el servidor';
    
    // Si el backend devuelve 401 o 403, forzamos logout automático
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Sesión no autorizada, expirada o rol desactivado.');
      window.dispatchEvent(new Event('session-expired'));
    }

    return Promise.reject({
      status: error.response?.status,
      message: message,
      detail: error.response?.data?.detalle || null
    });
  }
);

export default api;
