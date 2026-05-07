import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

/**
 * Provider de Autenticación Global
 * --------------------------------
 * Maneja el estado del usuario, carga inicial y logout.
 * 
 * IMPORTANTE: Después de login, se llama a /auth/me para obtener
 * el objeto de usuario completo y normalizado. Esto garantiza que
 * user.rol siempre sea un STRING (ej: "SUPER_ADMIN") sin importar
 * si el usuario acaba de logearse o si recargó la página.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Normaliza los datos del usuario provenientes de /auth/me
   * para que la estructura sea siempre consistente en toda la app.
   * /auth/me devuelve el objeto Sequelize completo con rol como objeto anidado.
   */
  const normalizeUser = (data) => {
    if (!data) return null;
    return {
      idUsuario: data.idUsuario,
      username: data.username,
      rol: data.rol?.nombre?.toUpperCase() || data.rol || null,
      cuentaActiva: data.cuentaActiva,
      idCliente: data.idCliente,
      idEmpleado: data.idEmpleado,
    };
  };

  // Al cargar la app, verificamos si hay una sesión activa en las cookies
  const checkAuth = async () => {
    try {
      const data = await authService.getMe();
      setUser(normalizeUser(data));
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listener para invalidación automática de sesión
    const handleSessionExpired = async () => {
      // Limpiar estado
      setUser(null);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    // Después del login exitoso, consultar /auth/me para obtener datos completos
    // Esto garantiza consistencia: user.rol siempre será un string normalizado
    const meData = await authService.getMe();
    setUser(normalizeUser(meData));
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
