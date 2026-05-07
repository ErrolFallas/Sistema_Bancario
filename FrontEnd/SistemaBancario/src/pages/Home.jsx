import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { isStaffRole, isAdminRole, getRoleLabel } from '../helpers/roleHelpers';
import '../css/dashboard.css';

/**
 * Home — Dashboard dinámico por rol + ownership
 * ──────────────────────────────────────────────
 * CLIENTE: resumen personal, accesos rápidos a sus recursos
 * EMPLEADO: acciones operativas
 * GERENTE: gestión avanzada
 * ADMIN/SUPER_ADMIN: panel de control con métricas
 */
const Home = () => {
  const { user } = useAuth();

  const isCliente = user?.rol?.toUpperCase() === 'CLIENTE';
  const isStaff = isStaffRole(user?.rol);
  const isAdmin = isAdminRole(user?.rol);

  return (
    <div className="page-container">
      {!user ? (
        /* ── Vista pública ─────────────────────────── */
        <div className="hero-section">
          <h1>Bienvenido a Tu Banco de Confianza</h1>
          <p>
            Gestiona tus finanzas de forma segura y rápida con nuestra plataforma digital.
            Inicia sesión para acceder a tus cuentas, solicitar préstamos y realizar transferencias.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none', fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Iniciar Sesión
          </Link>
        </div>
      ) : (
        /* ── Dashboard autenticado ─────────────────── */
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Hola, {user.username}! 👋</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            {getRoleLabel(user.rol)} — Panel de {isCliente ? 'Cliente' : 'Control'}
          </p>

          <div className="dashboard-cards">

            {/* ── Card de Rol ──────────────────────── */}
            <div className="card">
              <h3>🔑 Tu Rol: {user.rol}</h3>
              <p>
                {isCliente
                  ? 'Accede a tus cuentas, tarjetas y préstamos desde el menú de navegación.'
                  : 'Panel de control administrativo activo. Accede a las herramientas desde la barra de navegación.'}
              </p>
            </div>

            {/* ── CLIENTE: Accesos rápidos personales ─ */}
            {isCliente && (
              <>
                <div className="card highlight">
                  <h3>🏦 Mis Cuentas</h3>
                  <p style={{ marginBottom: '1rem' }}>Consulta el estado y saldo de tus cuentas bancarias.</p>
                  <Link to="/mis-cuentas" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Cuentas
                  </Link>
                </div>
                <div className="card">
                  <h3>💳 Mis Tarjetas</h3>
                  <p style={{ marginBottom: '1rem' }}>Gestiona tus tarjetas de débito y crédito.</p>
                  <Link to="/mis-tarjetas" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Tarjetas
                  </Link>
                </div>
                <div className="card">
                  <h3>📋 Mis Préstamos</h3>
                  <p style={{ marginBottom: '1rem' }}>Revisa el estado de tus préstamos activos.</p>
                  <Link to="/mis-prestamos" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Préstamos
                  </Link>
                </div>
              </>
            )}

            {/* ── STAFF: Acciones rápidas operativas ── */}
            {isStaff && (
              <>
                <div className="card highlight">
                  <h3>⚡ Acciones Rápidas</h3>
                  <p style={{ marginBottom: '1rem' }}>Crea un nuevo usuario con su entidad asociada en un solo paso.</p>
                  <Link to="/usuarios/crear" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Crear Usuario
                  </Link>
                </div>
                <div className="card">
                  <h3>👥 Gestión de Clientes</h3>
                  <p style={{ marginBottom: '1rem' }}>Administra clientes bancarios, consulta sus cuentas y estado.</p>
                  <Link to="/clientes" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Clientes
                  </Link>
                </div>
                <div className="card">
                  <h3>🏦 Cuentas Bancarias</h3>
                  <p style={{ marginBottom: '1rem' }}>Gestiona las cuentas bancarias del sistema.</p>
                  <Link to="/cuentas" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Cuentas
                  </Link>
                </div>
              </>
            )}

            {/* ── ADMIN: Panel de administración ───── */}
            {isAdmin && (
              <>
                <div className="card">
                  <h3>📊 Auditoría del Sistema</h3>
                  <p style={{ marginBottom: '1rem' }}>Revisa el historial de acciones y operaciones del sistema.</p>
                  <Link to="/auditoria" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Auditoría
                  </Link>
                </div>
                <div className="card">
                  <h3>🏛️ Instituciones Bancarias</h3>
                  <p style={{ marginBottom: '1rem' }}>Administra los bancos registrados en el sistema.</p>
                  <Link to="/bancos" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Ver Bancos
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
