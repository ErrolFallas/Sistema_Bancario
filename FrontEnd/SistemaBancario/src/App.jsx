import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Componentes
import Navbar from './components/Navbar';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import MiCuenta from './pages/MiCuenta';
import GestionUsuarios from './pages/GestionUsuarios';
import CrearUsuario from './pages/CrearUsuario';
import EditarUsuario from './pages/EditarUsuario';
import GestionRoles from './pages/GestionRoles';
import GestionClientes from './pages/GestionClientes';
import GestionCuentas from './pages/GestionCuentas';
import GestionTarjetas from './pages/GestionTarjetas';
import GestionPrestamos from './pages/GestionPrestamos';
import GestionTransacciones from './pages/GestionTransacciones';
import GestionBancos from './pages/GestionBancos';
import HistorialAuditoria from './pages/HistorialAuditoria';

// CSS global de componentes compartidos
import './css/components.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              {/* ── Rutas Públicas ────────────────────────────── */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* ── Cualquier usuario autenticado ──────────────── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mi-cuenta" element={<MiCuenta />} />
              </Route>

              {/* ── CLIENTE: recursos propios (ownership) ──────── */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO', 'CLIENTE']} />}>
                <Route path="/mis-cuentas" element={<GestionCuentas ownership />} />
                <Route path="/mis-tarjetas" element={<GestionTarjetas ownership />} />
                <Route path="/mis-prestamos" element={<GestionPrestamos ownership />} />
              </Route>

              {/* ── Staff bancario: Crear Usuarios ──────────────
                   ADMIN, GERENTE, EMPLEADO pueden crear usuarios.
                   Cada uno filtrado por getCreatableRoles en CrearUsuario 
                   y puedeCrearRol en el backend. */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO']} />}>
                <Route path="/usuarios/crear" element={<CrearUsuario />} />
                <Route path="/clientes" element={<GestionClientes />} />
                <Route path="/cuentas" element={<GestionCuentas />} />
                <Route path="/tarjetas" element={<GestionTarjetas />} />
              </Route>

              {/* ── Gestión de Usuarios: GERENTE+ ──────────────
                   La tabla completa de usuarios y edición requiere
                   al menos nivel GERENTE. EMPLEADO usa solo /crear. */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GERENTE']} />}>
                <Route path="/usuarios" element={<GestionUsuarios />} />
                <Route path="/usuarios/:id/editar" element={<EditarUsuario />} />
              </Route>

              {/* ── Gerencia+ ─────────────────────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GERENTE']} />}>
                <Route path="/prestamos" element={<GestionPrestamos />} />
                <Route path="/transacciones" element={<GestionTransacciones />} />
              </Route>

              {/* ── Admin+ ────────────────────────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
                <Route path="/bancos" element={<GestionBancos />} />
                <Route path="/auditoria" element={<HistorialAuditoria />} />
              </Route>

              {/* ── Solo SUPER_ADMIN ──────────────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/roles" element={<GestionRoles />} />
              </Route>

              {/* ── Fallback ──────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
