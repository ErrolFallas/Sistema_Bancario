import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../helpers/roleHelpers';

/**
 * Componente Wrapper para proteger rutas
 * --------------------------------------
 * @param {Array} allowedRoles - Lista de roles permitidos para la ruta
 * 
 * Escenarios:
 * 1. Cargando sesión: Muestra un spinner o nada.
 * 2. No autenticado: Redirige a /login.
 * 3. Autenticado pero rol incorrecto: Redirige a /unauthorized.
 * 4. Todo OK: Renderiza el contenido de la ruta (Outlet).
 *
 * Usa canAccess() de roleHelpers para centralizar la lógica de
 * bypass de SUPER_ADMIN y verificación jerárquica.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Mostrar estado de carga mientras verificamos la cookie /auth/me
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Verificando credenciales bancarias...</p>
      </div>
    );
  }

  // 2. Si no hay usuario, redirigir al login guardando la ubicación actual
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si hay roles requeridos, verificar con canAccess (SUPER_ADMIN bypass incluido)
  if (allowedRoles && !canAccess(user.rol, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Acceso autorizado
  return <Outlet />;
};

export default ProtectedRoute;
