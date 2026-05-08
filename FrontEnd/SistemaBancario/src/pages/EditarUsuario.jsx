import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import usuarioService from '../services/usuarioService';
import rolService from '../services/rolService';
import bancoService from '../services/bancoService';
import CustomSelect from '../components/ui/CustomSelect';
import { getCreatableRoles, hasSeniority } from '../helpers/roleHelpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../css/forms.css';
import '../css/dashboard.css';

/**
 * Editar Usuario — Formulario Enterprise con Transición de Rol
 * ─────────────────────────────────────────────────────────────
 * Carga los datos del usuario por ID y permite su actualización.
 * Si se intenta degradar a GERENTE/EMPLEADO sin datos laborales,
 * abre un modal para completar la ficha de empleado.
 */
const EditarUsuario = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    idRol: '' 
  });

  // ── Estado del Modal de Transición de Rol ──────────────────
  const [showEmpleadoModal, setShowEmpleadoModal] = useState(false);
  const [pendingIdRol, setPendingIdRol] = useState(null);
  const [pendingTargetRole, setPendingTargetRole] = useState('');
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    idBanco: '',
  });
  const [savingTransition, setSavingTransition] = useState(false);

  // ── Cargar datos iniciales ───────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioData, rolesData, bancosData] = await Promise.all([
          usuarioService.getById(id),
          rolService.getAll(),
          bancoService.getAll(),
        ]);
        
        setUsuario(usuarioData);
        setForm({
          username: usuarioData.username || '',
          email: usuarioData.email || '',
          idRol: usuarioData.idRol || '',
        });
        setRoles(rolesData);
        setBancos(bancosData);
      } catch (err) {
        toast.error(err.message || 'Error al cargar la información del usuario.');
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [id, toast, user.rol]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmpleadoChange = (e) => {
    const { name, value } = e.target;
    setEmpleadoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username.trim()) {
      toast.warning('El nombre de usuario es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const response = await usuarioService.update(id, form);
      toast.success(response.mensaje || 'Usuario actualizado correctamente.');
      navigate('/usuarios');
    } catch (err) {
      // ── DETECTAR SEÑAL DE TRANSICIÓN DE ROL (422) ─────────────
      if (err.requiresEmpleadoData) {
        // El backend indica que el usuario necesita datos laborales
        const targetRolObj = roles.find(r => r.idRol === Number(form.idRol));
        setPendingIdRol(Number(form.idRol));
        setPendingTargetRole(targetRolObj?.nombre?.toUpperCase() || err.targetRole || '');
        setShowEmpleadoModal(true);
        // Restaurar el rol en el form al original
        setForm(prev => ({ ...prev, idRol: usuario.idRol }));
      } else {
        toast.error(err.message || 'Error al intentar actualizar el usuario.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Handler: Completar transición con datos de empleado ─────
  const handleTransitionSubmit = async (e) => {
    e.preventDefault();

    if (!empleadoForm.nombre.trim()) {
      toast.warning('El nombre del empleado es obligatorio.');
      return;
    }
    if (!empleadoForm.apellido.trim()) {
      toast.warning('El apellido del empleado es obligatorio.');
      return;
    }
    if (!empleadoForm.idBanco) {
      toast.warning('Debe seleccionar un banco para el empleado.');
      return;
    }

    setSavingTransition(true);
    try {
      const empleadoData = {
        nombre: empleadoForm.nombre.trim(),
        apellido: empleadoForm.apellido.trim(),
        telefono: empleadoForm.telefono.trim() || null,
        idBanco: Number(empleadoForm.idBanco),
      };

      const response = await usuarioService.updateWithEmpleado(id, empleadoData, pendingIdRol);
      toast.success(response.mensaje || `Usuario actualizado a ${pendingTargetRole} exitosamente.`);
      setShowEmpleadoModal(false);
      navigate('/usuarios');
    } catch (err) {
      toast.error(err.message || 'Error al completar la transición de rol.');
    } finally {
      setSavingTransition(false);
    }
  };

  const cerrarModal = () => {
    if (!savingTransition) {
      setShowEmpleadoModal(false);
      setPendingIdRol(null);
      setPendingTargetRole('');
      setEmpleadoForm({ nombre: '', apellido: '', telefono: '', idBanco: '' });
    }
  };

  // ── Filtrar roles disponibles según gobernanza RBAC ──────────
  const rolesCreables = getCreatableRoles(user?.rol);
  const rolesDisponibles = roles.filter(r => {
    const nombre = r.nombre.toUpperCase();
    // Siempre incluir el rol actual del usuario editado para visualización
    if (usuario && r.idRol === usuario.idRol) return true;
    return rolesCreables.includes(nombre);
  });

  if (isLoading) return <LoadingSpinner message="Obteniendo datos del usuario..." />;
  
  if (!usuario) {
    return (
      <div className="page-container center-content">
        <div className="glass-card animate-in" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="header-icon" style={{ color: 'var(--error-color)', fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ margin: '1rem 0' }}>Usuario no encontrado</h2>
          <p style={{ color: 'var(--text-muted)' }}>El registro que intenta editar no existe o fue eliminado.</p>
          <button className="btn-primary" onClick={() => navigate('/usuarios')} style={{ marginTop: '2rem' }}>
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  const esModoLectura = !hasSeniority(user, usuario) && user.idUsuario !== usuario.idUsuario;

  return (
    <div className="page-container center-content">
      <div className="form-card animate-in" style={{ maxWidth: '600px' }}>
        <header className="form-header">
          <div className="header-icon">📝</div>
          <div className="header-text">
            <h2>Editar Usuario</h2>
            <p>Actualizando credenciales de: <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{usuario.username}</span></p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="enterprise-form">
          <section className="form-section">
            <div className="section-title">
              <span className="icon">👤</span>
              <h3>Información de Cuenta</h3>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario *</label>
              <input
                type="text" id="username" name="username"
                value={form.username} onChange={handleChange}
                disabled={saving || esModoLectura}
                placeholder="Ej. juan.perez"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Corporativo / Personal</label>
              <input
                type="email" id="email" name="email"
                value={form.email} onChange={handleChange}
                disabled={saving || esModoLectura}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <CustomSelect
                label="Rol del Sistema"
                name="idRol"
                value={form.idRol}
                onChange={handleChange}
                options={rolesDisponibles.map(rol => ({
                  value: rol.idRol,
                  label: `${rol.nombre}${rol.descripcion ? ` — ${rol.descripcion}` : ''}`
                }))}
                placeholder="Seleccionar nuevo rol"
                disabled={saving || esModoLectura}
                required
              />
              {esModoLectura && (
                <p className="field-hint error">
                  🔒 No tiene antigüedad suficiente para modificar este SUPER_ADMIN.
                </p>
              )}
            </div>
          </section>

          <footer className="form-footer">
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/usuarios')} 
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={saving || esModoLectura}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </footer>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: Ficha de Empleado (Transición de Rol)
          Se muestra cuando el backend responde requiresEmpleadoData
          ═══════════════════════════════════════════════════════════ */}
      {showEmpleadoModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal-content"
            style={{ borderColor: 'rgba(0, 180, 216, 0.3)', maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ color: 'var(--secondary-color)' }}>
                🏛️ Ficha de Empleado Requerida
              </h3>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Para asignar el rol <strong style={{ color: 'var(--secondary-color)' }}>{pendingTargetRole}</strong> a{' '}
                <strong>{usuario.username}</strong>, primero debe completar los datos laborales.
              </p>

              <form onSubmit={handleTransitionSubmit} className="enterprise-form" id="empleadoTransitionForm">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="empNombre">Nombre(s) *</label>
                    <input
                      type="text" id="empNombre" name="nombre"
                      value={empleadoForm.nombre} onChange={handleEmpleadoChange}
                      placeholder="Nombre del empleado"
                      disabled={savingTransition}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="empApellido">Apellido(s) *</label>
                    <input
                      type="text" id="empApellido" name="apellido"
                      value={empleadoForm.apellido} onChange={handleEmpleadoChange}
                      placeholder="Apellido del empleado"
                      disabled={savingTransition}
                      required
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="empTelefono">Teléfono Interno</label>
                    <input
                      type="text" id="empTelefono" name="telefono"
                      value={empleadoForm.telefono} onChange={handleEmpleadoChange}
                      placeholder="Ext. 0000"
                      disabled={savingTransition}
                    />
                  </div>
                  <div className="form-group">
                    <CustomSelect
                      label="Banco Asignado"
                      name="idBanco"
                      value={empleadoForm.idBanco}
                      onChange={handleEmpleadoChange}
                      options={bancos.map(banco => ({
                        value: banco.idBanco,
                        label: banco.nombre
                      }))}
                      placeholder="Seleccionar Banco"
                      disabled={savingTransition}
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={cerrarModal}
                disabled={savingTransition}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleTransitionSubmit}
                disabled={savingTransition}
              >
                {savingTransition ? 'Procesando...' : `Crear Ficha y Asignar ${pendingTargetRole}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarUsuario;
