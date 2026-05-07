/**
 * Format Helpers — Formateo de datos bancarios
 * ─────────────────────────────────────────────
 * Funciones puras para formatear moneda, fechas,
 * números de cuenta y tarjetas.
 */

/**
 * Formatea un número como moneda (USD por defecto).
 * @param {number} amount
 * @param {string} currency - Código de moneda (default: USD)
 * @returns {string} Ej: "$1,234.56"
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea una fecha ISO a formato legible.
 * @param {string|Date} date
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Ej: "05/06/2026" o "05/06/2026 10:30 PM"
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '—';
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Date(date).toLocaleDateString('es-CR', options);
};

/**
 * Enmascara un número de tarjeta: ****-****-****-1234
 * @param {string} cardNumber
 * @returns {string}
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '****-****-****-****';
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 4) return '****-****-****-****';
  const last4 = clean.slice(-4);
  return `****-****-****-${last4}`;
};

/**
 * Formatea un número de cuenta para mejor legibilidad.
 * @param {string} accountNumber
 * @returns {string} Ej: "CR-20260505-4821"
 */
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return '—';
  return accountNumber;
};

/**
 * Trunca texto largo con ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
