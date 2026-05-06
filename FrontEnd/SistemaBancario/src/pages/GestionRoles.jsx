import { useState, useEffect } from 'react';
import rolService from '../services/rolService';
import permisosService from '../services/permisosService';
import rolesPermisosService from '../services/rolesPermisosService';
import '../css/dashboard.css';
import '../css/forms.css';

/**
 * Gestión de Roles — Solo SUPER_ADMIN
 * Lista los roles existentes, permite crear nuevos roles (asociados a permisos),
 * y eliminar roles con protección estricta para SUPER_ADMIN.
 */
const GestionRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del mini-formulario de creación
  const [nuevoRol, setNuevoRol] = useState({ nombre: '', descripcion: '' });
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]); // Array de IDs
  const [creando, setCreando] = useState(false);

  // Estado del Modal de Eliminación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // ── Cargar roles y permisos ──────────────────────────────
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        rolService.getAll(),
        permisosService.getAll()
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // ── Handlers de Permisos ─────────────────────────────────
  const handleCheckboxChange = (idPermiso) => {
    setPermisosSeleccionados(prev => {
      if (prev.includes(idPermiso)) {
        return prev.filter(id => id !== idPermiso);
      } else {
        return [...prev, idPermiso];
      }
    });
  };

  // ── Crear rol y asociar permisos ─────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nuevoRol.nombre.trim()) {
      setError('El nombre del rol es obligatorio.');
      return;
    }

    if (permisosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un permiso para el rol.');
      return;
    }

    setCreando(true);
    let rolCreado = null;

    try {
      // 1. Crear el Rol
      rolCreado = await rolService.create({
        nombre: nuevoRol.nombre.toUpperCase().trim(),
        descripcion: nuevoRol.descripcion.trim() || null,
      });

      // 2. Asociar Permisos usando Promise.all
      const promesasPermisos = permisosSeleccionados.map(idPermiso => 
        rolesPermisosService.create({
          idRol: rolCreado.idRol,
          idPermiso: idPermiso
        })
      );

      await Promise.all(promesasPermisos);

      setSuccess(`Rol "${rolCreado.nombre}" creado exitosamente con ${permisosSeleccionados.length} permiso(s).`);
      
      // Limpiar formulario
      setNuevoRol({ nombre: '', descripcion: '' });
      setPermisosSeleccionados([]);
      
      // Refrescar lista de roles
      cargarDatos(); 
      
    } catch (err) {
      if (rolCreado) {
        setError(`El rol "${rolCreado.nombre}" se creó, pero hubo un error al asignarle los permisos. Detalle: ${err.message || 'Desconocido'}`);
      } else {
        setError(err.message || 'Error al crear el rol.');
      }
    } finally {
      setCreando(false);
    }
  };

  // ── Roles Base Protegidos ────────────────────────────────
  const rolesBase = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO', 'CLIENTE'];

  // ── Confirmar Eliminación (Modal) ────────────────────────
  const abrirModalEliminar = (rol) => {
    if (rolesBase.includes(rol.nombre.toUpperCase())) {
      setError(`Operación denegada: El rol '${rol.nombre}' es un rol base del sistema y no puede ser eliminado.`);
      return;
    }
    setError('');
    setSuccess('');
    setRolAEliminar(rol);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRolAEliminar(null);
  };

  // ── Ejecutar Eliminación ─────────────────────────────────
  const handleConfirmarEliminacion = async () => {
    if (!rolAEliminar) return;

    if (rolesBase.includes(rolAEliminar.nombre.toUpperCase())) {
      cerrarModal();
      setError(`Operación rechazada: No se puede eliminar el rol base '${rolAEliminar.nombre}'.`);
      return;
    }

    setEliminando(true);
    try {
      await rolService.delete(rolAEliminar.idRol);
      setSuccess(`Rol "${rolAEliminar.nombre}" eliminado correctamente.`);
      cerrarModal();
      cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al eliminar el rol.');
      cerrarModal();
    } finally {
      setEliminando(false);
    }
  };

  // ── Determinar badge para cada rol ───────────────────────
  const getBadgeClass = (nombre) => {
    const upper = nombre.toUpperCase();
    if (upper.includes('ADMIN') || upper === 'SUPER_ADMIN') return 'badge-admin';
    if (upper === 'CLIENTE') return 'badge-cliente';
    if (upper === 'EMPLEADO' || upper === 'GERENTE') return 'badge-empleado';
    return 'badge-admin';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Roles y Permisos</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-cards" style={{ marginBottom: '2rem' }}>
        {/* ── Formulario para crear rol ──────────────────── */}
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
                  placeholder="Ej. AUDITOR_JR"
                  disabled={creando}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rolDescripcion">Descripción</label>
                <input
                  type="text" id="rolDescripcion"
                  value={nuevoRol.descripcion}
                  onChange={(e) => setNuevoRol(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción breve del rol"
                  disabled={creando}
                />
              </div>
            </div>

            {/* ── Lista de Permisos (Checkboxes) ────────────── */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Permisos del Sistema * <span style={{ textTransform: 'none', fontWeight: 'normal' }}>({permisosSeleccionados.length} seleccionados)</span></label>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '1.5rem', 
                borderRadius: '8px',
                border: '1px solid var(--surface-border)',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {permisos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Cargando permisos...</p>
                ) : (
                  permisos.map(permiso => (
                    <label key={permiso.idPermiso} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.8rem',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textTransform: 'none'
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
              <button type="button" className="btn-secondary" onClick={() => { setNuevoRol({nombre:'', descripcion:''}); setPermisosSeleccionados([]); }} disabled={creando}>
                Limpiar
              </button>
              <button type="submit" className="btn-primary" disabled={creando}>
                {creando ? 'Creando Rol y Asignando Permisos...' : 'Guardar Nuevo Rol'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Tabla de roles ────────────────────────────────── */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Cargando roles del sistema...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="empty-state">
          <p>No hay roles registrados en el sistema.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Permisos Asignados</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(rol => {
                const nombreUpper = rol.nombre.toUpperCase();
                const esRolBase = rolesBase.includes(nombreUpper);

                return (
                  <tr key={rol.idRol}>
                    <td>{rol.idRol}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(rol.nombre)}`}>
                        {rol.nombre}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {rol.descripcion || '—'}
                    </td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'normal' }}>
                      {rol.permisos && rol.permisos.length > 0 
                        ? rol.permisos.map(p => p.nombre).join(', ')
                        : <span style={{color: 'var(--text-muted)'}}>Sin permisos específicos</span>
                      }
                    </td>
                    <td>
                      {esRolBase 
                        ? <span className="badge badge-protegido">👑 Sistema</span>
                        : <span className="badge badge-admin">Custom</span>
                      }
                    </td>
                    <td>
                      {/* LÓGICA DE VISIBILIDAD DE BOTÓN ELIMINAR */}
                      {esRolBase ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Indispensable</span>
                      ) : (
                        <button className="btn-danger" onClick={() => abrirModalEliminar(rol)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal de Confirmación ─────────────────────────── */}
      {modalAbierto && rolAEliminar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de eliminar el rol <strong>{rolAEliminar.nombre}</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#ff4d6d' }}>
                Esta acción es destructiva y no se puede deshacer.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cerrarModal} disabled={eliminando}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleConfirmarEliminacion} disabled={eliminando} style={{ background: '#ef233c', color: '#fff' }}>
                {eliminando ? 'Eliminando...' : 'Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRoles;
