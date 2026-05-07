import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { useState } from 'react';
import usuarioService from '../services/usuarioService';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatusBadge from '../components/ui/StatusBadge';
import { getRoleLabel } from '../helpers/roleHelpers';
import { formatDate } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/components.css';

/**
 * Mi Cuenta — Perfil del usuario autenticado
 * ───────────────────────────────────────────
 * Ownership puro: solo muestra datos propios.
 * Permite desactivar la propia cuenta (soft delete).
 */
const MiCuenta = () => {
  const { user, logout } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDesactivarCuenta = async () => {
    setProcessing(true);
    try {
      await usuarioService.desactivarCuenta();
      toast.success('Tu cuenta ha sido desactivada. Serás redirigido al login.');
      setTimeout(() => logout(), 2000);
    } catch (err) {
      toast.error(err.message || 'Error al desactivar la cuenta.');
    } finally {
      setProcessing(false);
      setShowModal(false);
    }
  };

  if (!user) return null;

  const getEntidad = () => {
    if (user.idCliente) return { tipo: 'Cliente', id: user.idCliente };
    if (user.idEmpleado) return { tipo: 'Empleado', id: user.idEmpleado };
    return { tipo: 'Administrativo', id: '—' };
  };

  const entidad = getEntidad();

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Mi Cuenta</h1>

      <div className="dashboard-cards">
        {/* Card de perfil */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: '#fff', fontWeight: 700
            }}>
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user.username}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.3rem 0' }}>{user.email || 'Sin correo'}</p>
              <span className="badge badge-admin">{getRoleLabel(user.rol)}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID de Usuario</label>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.idUsuario}</p>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Entidad</label>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{entidad.tipo} (ID: {entidad.id})</p>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado de Cuenta</label>
              <div style={{ marginTop: '0.3rem' }}>
                <StatusBadge isActive={true} activeLabel="Activa" />
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sesión</label>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--success-color)' }}>🟢 En línea</p>
            </div>
          </div>
        </div>

        {/* Card de acción peligrosa */}
        <div className="glass-card" style={{ borderColor: 'rgba(239, 35, 60, 0.2)' }}>
          <h3 style={{ color: '#ff4d6d', marginBottom: '1rem' }}>⚠️ Zona de Peligro</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Desactivar tu cuenta significa que no podrás acceder al sistema hasta que un administrador la reactive.
          </p>
          <button
            className="btn-danger"
            onClick={() => setShowModal(true)}
            style={{ width: '100%' }}
          >
            Desactivar Mi Cuenta
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Desactivar tu cuenta"
        message={
          <>
            <p>¿Estás seguro de que deseas <strong>desactivar tu cuenta</strong>?</p>
            <p style={{ marginTop: '0.5rem', color: '#ff4d6d', fontSize: '0.9rem' }}>
              Perderás acceso al sistema inmediatamente. Solo un administrador podrá reactivar tu cuenta.
            </p>
          </>
        }
        confirmLabel="Sí, desactivar mi cuenta"
        onConfirm={handleDesactivarCuenta}
        onCancel={() => !processing && setShowModal(false)}
        isLoading={processing}
        variant="danger"
      />
    </div>
  );
};

export default MiCuenta;
