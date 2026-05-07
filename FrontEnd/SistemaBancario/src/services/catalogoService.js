import api from './api';

/**
 * Servicio de Catálogos Base
 * Consume los endpoints de catálogos para poblar selects dinámicos.
 * NO se crean páginas admin para estos — solo uso interno.
 */
const catalogoService = {
  // Tipos de cuenta (Ahorro, Corriente, etc.)
  getTiposCuenta: async () => {
    const response = await api.get('/tipos-cuenta');
    return response.data;
  },

  // Tipos de tarjeta (Débito, Crédito)
  getTiposTarjeta: async () => {
    const response = await api.get('/tipos-tarjeta');
    return response.data;
  },

  // Marcas de tarjeta (Visa, Mastercard, etc.)
  getMarcasTarjeta: async () => {
    const response = await api.get('/marcas-tarjeta');
    return response.data;
  },

  // Estados de tarjeta (Activa, Bloqueada, Vencida, etc.)
  getEstadosTarjeta: async () => {
    const response = await api.get('/estados-tarjeta');
    return response.data;
  },

  // Tipos de transacción (Depósito, Retiro, Transferencia, etc.)
  getTiposTransaccion: async () => {
    const response = await api.get('/tipos-transaccion');
    return response.data;
  },

  // Estados de transacción (Completada, Pendiente, Fallida, etc.)
  getEstadosTransaccion: async () => {
    const response = await api.get('/estados-transaccion');
    return response.data;
  },

  // Canales (Web, Cajero, Sucursal, etc.)
  getCanales: async () => {
    const response = await api.get('/canales');
    return response.data;
  },

  // Estados de préstamo (Al día, Mora, Cancelado, etc.)
  getEstadosPrestamo: async () => {
    const response = await api.get('/estados-prestamo');
    return response.data;
  },
};

export default catalogoService;
