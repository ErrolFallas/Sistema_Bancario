import { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import rolService from '../services/rolService';
import permisosService from '../services/permisosService';
import rolesPermisosService from '../services/rolesPermisosService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import ConfirmModal from '../components/ui/ConfirmModal';
import RolRow from '../components/roles/RolRow';
import { isProtectedRole } from '../helpers/roleHelpers';
import '../css/dashboard.css';
import '../css/forms.css';
import '../css/components.css';

/**
 * Gestión de Roles — Solo SUPER_ADMIN
 * ────────────────────────────────────
 * Refactorizado: sub-componentes, soft delete visual, filtros, toast.
 */
const GestionRoles = () => {
  const toast = useToastContext();

  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Formulario de creación
  const [nuevoRol, setNuevoRol] = useState({ nombre: '', descripcion: '' });
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [creando, setCreando] = useState(false);

  // Modal
  const [modal, setModal] = useState({ open: false, rol: null, action: null });
  const [processing, setProcessing] = useState(false);

  // ── Cargar datos ─────────────────────────────────────
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        rolService.getAll(showInactive),
        permisosService.getAll()
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (err) {
      toast.error(err.message || 'Error al cargar los datos del servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [showInactive]);

  // ── Checkbox de permisos ─────────────────────────────
  const handleCheckboxChange = (idPermiso) => {
    setPermisosSeleccionados(prev =>
      prev.includes(idPermiso)
        ? prev.filter(id => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  // ── Crear rol ────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();

    if (!nuevoRol.nombre.trim()) {
      toast.warning('El nombre del rol es obligatorio.');
      return;
    }
    if (permisosSeleccionados.length === 0) {
      toast.warning('Debe seleccionar al menos un permiso para el rol.');
      return;
    }

    setCreando(true);
    let rolCreado = null;

    try {
      rolCreado = await rolService.create({
        nombre: nuevoRol.nombre.toUpperCase().trim(),
        descripcion: nuevoRol.descripcion.trim() || null,
      });

      const promesasPermisos = permisosSeleccionados.map(idPermiso =>
        rolesPermisosService.create({ idRol: rolCreado.idRol, idPermiso })
      );
      await Promise.all(promesasPermisos);

      toast.success(`Rol "${rolCreado.nombre}" creado con ${permisosSeleccionados.length} permiso(s).`);
      setNuevoRol({ nombre: '', descripcion: '' });
      setPermisosSeleccionados([]);
      cargarDatos();
    } catch (err) {
      if (rolCreado) {
        toast.error(`El rol "${rolCreado.nombre}" se creó, pero hubo un error al asignarle permisos.`);
      } else {
        toast.error(err.message || 'Error al crear el rol.');
      }
    } finally {
      setCreando(false);
    }
  };

  // ── Acciones sobre roles ─────────────────────────────
  const handleDesactivar = (rol) => {
    setModal({ open: true, rol, action: 'desactivar' });
  };

  const handleReactivar = (rol) => {
    setModal({ open: true, rol, action: 'reactivar' });
  };

  const handleEliminar = (rol) => {
    if (isProtectedRole(rol.nombre)) {
      toast.error(`El rol '${rol.nombre}' es un rol base del sistema y no puede ser eliminado.`);
      return;
    }
    setModal({ open: true, rol, action: 'eliminar' });
  };

  const handleConfirmar = async () => {
    if (!modal.rol) return;
    setProcessing(true);

    try {
      if (modal.action === 'desactivar') {
        await rolService.desactivar(modal.rol.idRol);
        toast.success(`Rol "${modal.rol.nombre}" desactivado correctamente.`);
      } else if (modal.action === 'reactivar') {
        await rolService.reactivar(modal.rol.idRol);
        toast.success(`Rol "${modal.rol.nombre}" reactivado correctamente.`);
      } else if (modal.action === 'eliminar') {
        await rolService.delete(modal.rol.idRol);
        toast.success(`Rol "${modal.rol.nombre}" eliminado correctamente.`);
      }
      setModal({ open: false, rol: null, action: null });
      cargarDatos();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} el rol.`);
    } finally {
      setProcessing(false);
    }
  };

  const cerrarModal = () => {
    if (!processing) setModal({ open: false, rol: null, action: null });
  };

  // ── Columnas ─────────────────────────────────────────
  const columns = [
    { label: 'ID' },
    { label: 'Nombre' },
    { label: 'Descripción' },
    { label: 'Permisos Asignados' },
    { label: 'Estado' },
    { label: 'Tipo' },
    { label: 'Acciones' },
  ];

  // ── Modal title/variant ──────────────────────────────
  const getModalConfig = () => {
    if (modal.action === 'eliminar') return { title: 'Eliminar Rol', variant: 'danger' };
    if (modal.action === 'desactivar') return { title: 'Desactivar Rol', variant: 'warning' };
    return { title: 'Reactivar Rol', variant: 'info' };
  };

  const modalConfig = getModalConfig();

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Roles y Permisos">
        <FilterToggle
          showInactive={showInactive}
          onToggle={setShowInactive}
          label="Mostrar inactivos"
        />
      </PageHeader>

      {/* ── Formulario de creación ──────────────────── */}
      <div className="dashboard-cards" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1.2rem' }}>➕ Crear Nuevo Rol Dinámico</h3>

          <form onSubmit={handleCrear}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rolNombre">Nombre del Rol *</label>
                <input
                  type="text" id="rolNombre"
                  value={nuevoRol.nombre}
                  onChange={(e) => setNuevoRol(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. AUDITOR_JR" disabled={creando} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rolDescripcion">Descripción</label>
                <input
                  type="text" id="rolDescripcion"
                  value={nuevoRol.descripcion}
                  onChange={(e) => setNuevoRol(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción breve del rol" disabled={creando}
                />
              </div>
            </div>

            {/* ── Permisos ──────────────────────────── */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>
                Permisos del Sistema *{' '}
                <span style={{ textTransform: 'none', fontWeight: 'normal' }}>
                  ({permisosSeleccionados.length} seleccionados)
                </span>
              </label>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem',
                borderRadius: '8px', border: '1px solid var(--surface-border)',
                maxHeight: '300px', overflowY: 'auto'
              }}>
                {permisos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Cargando permisos...</p>
                ) : (
                  permisos.map(permiso => (
                    <label key={permiso.idPermiso} style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem',
                      color: 'var(--text-light)', cursor: 'pointer',
                      fontSize: '0.9rem', textTransform: 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={permisosSeleccionados.includes(permiso.idPermiso)}
                        onChange={() => handleCheckboxChange(permiso.idPermiso)}
                        disabled={creando}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--secondary-color)' }}
                      />
                      <div>
                        <strong>{permiso.nombre}</strong>
                        {permiso.descripcion && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{permiso.descripcion}</div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn-secondary"
                onClick={() => { setNuevoRol({ nombre: '', descripcion: '' }); setPermisosSeleccionados([]); }}
                disabled={creando}
              >
                Limpiar
              </button>
              <button type="submit" className="btn-primary" disabled={creando}>
                {creando ? 'Creando Rol y Asignando Permisos...' : 'Guardar Nuevo Rol'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Tabla de roles ──────────────────────────── */}
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        loadingMessage="Cargando roles del sistema..."
        emptyPreset="roles"
        renderRow={(rol) => (
          <RolRow
            key={rol.idRol}
            rol={rol}
            onDesactivar={handleDesactivar}
            onReactivar={handleReactivar}
            onEliminar={handleEliminar}
          />
        )}
      />

      {/* ── Modal ───────────────────────────────────── */}
      <ConfirmModal
        isOpen={modal.open}
        title={modalConfig.title}
        message={
          modal.rol && (
            <>
              <p>
                ¿Está seguro de <strong>{modal.action}</strong> el rol{' '}
                <strong>"{modal.rol.nombre}"</strong>?
              </p>
              {modal.action === 'eliminar' && (
                <p style={{ marginTop: '0.5rem', color: '#ff4d6d' }}>
                  Esta acción es destructiva y no se puede deshacer.
                </p>
              )}
              {modal.action === 'desactivar' && (
                <p style={{ marginTop: '0.5rem', color: 'var(--accent-color)', fontSize: '0.9rem' }}>
                  Los usuarios con este rol perderán acceso operativo.
                </p>
              )}
            </>
          )
        }
        confirmLabel={modal.action === 'eliminar' ? 'Confirmar Eliminación' : modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={cerrarModal}
        isLoading={processing}
        variant={modalConfig.variant}
      />
    </div>
  );
};

export default GestionRoles;
