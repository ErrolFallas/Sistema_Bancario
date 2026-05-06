import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Componentes
import Navbar from './components/Navbar';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import GestionUsuarios from './pages/GestionUsuarios';
import CrearUsuario from './pages/CrearUsuario';
import GestionRoles from './pages/GestionRoles';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* ── Rutas Públicas ────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ── Cualquier usuario logeado ──────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mi-cuenta" element={
                <div style={{padding: '2rem 5%'}}>
                  <h1>Mi Cuenta</h1>
                  <p style={{color: 'var(--text-muted)', marginTop: '1rem'}}>
                    Configuración de perfil próximamente.
                  </p>
                </div>
              } />
            </Route>

            {/* ── Staff bancario (ADMIN, GERENTE, EMPLEADO) ──── */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO']} />}>
              <Route path="/clientes" element={
                <div style={{padding: '2rem 5%'}}>
                  <h1>Gestión de Clientes</h1>
                  <p style={{color: 'var(--text-muted)', marginTop: '1rem'}}>
                    Módulo de gestión de clientes próximamente.
                  </p>
                </div>
              } />
              <Route path="/usuarios" element={<GestionUsuarios />} />
              <Route path="/usuarios/crear" element={<CrearUsuario />} />
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
    </AuthProvider>
  );
}

export default App;
