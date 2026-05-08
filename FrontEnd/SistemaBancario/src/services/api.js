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
    const message = error.response?.data?.error || error.response?.data?.mensaje || 'Error inesperado en la comunicación con el servidor institucional.';
    
    // Si el backend devuelve 401, forzamos logout (Sesión expirada o inválida)
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizada.');
      window.dispatchEvent(new Event('session-expired'));
    }

    // Si el backend devuelve 403, solo forzamos logout si es un error de seguridad de sesión
    // (Cuenta desactivada, token corrupto, etc.)
    const sessionErrorKeywords = ['inactiva', 'suspendida', 'corrupto', 'inválido'];
    const isSessionError = sessionErrorKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (error.response?.status === 403 && isSessionError) {
      console.warn('Acceso denegado por seguridad de cuenta o token.');
      window.dispatchEvent(new Event('session-expired'));
    }

    return Promise.reject({
      status: error.response?.status,
      message: message,
      detail: error.response?.data?.detalle || null,
      // Señales de transición de rol (422 desde roleTransitionValidator)
      requiresEmpleadoData: error.response?.data?.requiresEmpleadoData || false,
      targetRole: error.response?.data?.targetRole || null,
      userId: error.response?.data?.userId || null,
    });
  }
);

export default api;
