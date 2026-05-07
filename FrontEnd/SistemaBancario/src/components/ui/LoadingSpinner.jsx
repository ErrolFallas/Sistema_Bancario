/**
 * LoadingSpinner — Spinner de carga reutilizable
 * Usa las clases existentes de dashboard.css
 */
const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
