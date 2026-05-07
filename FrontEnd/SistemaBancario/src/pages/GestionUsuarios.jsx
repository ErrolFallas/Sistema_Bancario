import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import usuarioService from '../services/usuarioService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import ConfirmModal from '../components/ui/ConfirmModal';
import UserRow from '../components/users/UserRow';
import '../css/dashboard.css';
import '../css/forms.css';
import '../css/components.css';

/**
 * Gestión de Usuarios — ADMIN / SUPER_ADMIN
 * ──────────────────────────────────────────
 * Refactorizado: usa sub-componentes, soft delete, filtros activos/inactivos.
 */
const GestionUsuarios = () => {
  const { user } = useAuth();
  const toast = useToastContext();

  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Modal de confirmación
  const [modal, setModal] = useState({ open: false, usuario: null, action: null });
  const [processing, setProcessing] = useState(false);

  // ── Cargar usuarios ──────────────────────────────────
  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuarioService.getAll(showInactive);
      setUsuarios(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, [showInactive]);

  // ── Handlers de soft delete ──────────────────────────
  const handleDesactivar = (usuario) => {
    setModal({
      open: true,
      usuario,
      action: 'desactivar',
    });
  };

  const handleReactivar = (usuario) => {
    setModal({
      open: true,
      usuario,
      action: 'reactivar',
    });
  };

  const handleConfirmar = async () => {
    if (!modal.usuario) return;
    setProcessing(true);

    try {
      if (modal.action === 'desactivar') {
        await usuarioService.desactivar(modal.usuario.idUsuario);
        toast.success(`Usuario "${modal.usuario.username}" desactivado correctamente.`);
      } else {
        await usuarioService.reactivar(modal.usuario.idUsuario);
        toast.success(`Usuario "${modal.usuario.username}" reactivado correctamente.`);
      }
      setModal({ open: false, usuario: null, action: null });
      cargarUsuarios();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} el usuario.`);
    } finally {
      setProcessing(false);
    }
  };

  const cerrarModal = () => {
    if (!processing) {
      setModal({ open: false, usuario: null, action: null });
    }
  };

  // ── Columnas de la tabla ─────────────────────────────
  const columns = [
    { label: 'ID' },
    { label: 'Username' },
    { label: 'Rol' },
    { label: 'Entidad Asociada' },
    { label: 'Estado' },
    { label: 'Sesión' },
    { label: 'Acciones' },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Gestión de Usuarios"
        actionLabel="+ Crear Usuario"
        actionTo="/usuarios/crear"
      >
        <FilterToggle
          showInactive={showInactive}
          onToggle={setShowInactive}
          label="Mostrar inactivos"
        />
      </PageHeader>

      <DataTable
        columns={columns}
        data={usuarios}
        isLoading={isLoading}
        loadingMessage="Cargando usuarios..."
        emptyPreset="usuarios"
        emptyActionLabel="Crear primer usuario"
        emptyActionTo="/usuarios/crear"
        renderRow={(u) => (
          <UserRow
            key={u.idUsuario}
            usuario={u}
            onDesactivar={handleDesactivar}
            onReactivar={handleReactivar}
            currentUser={user}
          />
        )}
      />

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'desactivar' ? 'Desactivar Usuario' : 'Reactivar Usuario'}
        message={
          modal.usuario && (
            <>
              <p>
                ¿Está seguro de <strong>{modal.action}</strong> al usuario{' '}
                <strong>"{modal.usuario.username}"</strong>?
              </p>
              {modal.action === 'desactivar' && (
                <p style={{ marginTop: '0.5rem', color: 'var(--accent-color)', fontSize: '0.9rem' }}>
                  {modal.usuario.rol?.nombre?.toUpperCase() === 'ADMIN' && modal.usuario.idUsuario === user.idUsuario
                    ? 'Al desactivar esta cuenta, solo un SUPER_ADMIN podrá reactivarla.'
                    : 'El usuario no podrá iniciar sesión hasta ser reactivado.'}
                </p>
              )}
              {modal.action === 'reactivar' && modal.usuario.rol?.nombre?.toUpperCase() === 'SUPER_ADMIN' && (
                <p style={{ marginTop: '0.5rem', color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                  Aviso: Solo un SUPER_ADMIN puede realizar esta acción para este nivel de cuenta.
                </p>
              )}
            </>
          )
        }
        confirmLabel={modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={cerrarModal}
        isLoading={processing}
        variant={modal.action === 'desactivar' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default GestionUsuarios;
