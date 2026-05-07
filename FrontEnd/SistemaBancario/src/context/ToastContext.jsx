import { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

const ToastContext = createContext();

/**
 * Provider global de Toasts.
 * Envuelve la app para que cualquier componente pueda
 * mostrar notificaciones con useToastContext().
 */
export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de toasts.
 * Uso: const { success, error, warning, info } = useToastContext();
 */
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext debe usarse dentro de un ToastProvider');
  }
  return context;
};
