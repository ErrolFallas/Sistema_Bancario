import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import usuarioService from '../services/usuarioService';
import rolService from '../services/rolService';
import CustomSelect from '../components/ui/CustomSelect';
import { getCreatableRoles, hasSeniority } from '../helpers/roleHelpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../css/forms.css';
import '../css/dashboard.css';

/**
 * Editar Usuario — Formulario Enterprise
 * ───────────────────────────────────────
 * Carga los datos del usuario por ID y permite su actualización.
 * Implementa gobernanza estricta de roles y estética Glassmorphism.
 */
const EditarUsuario = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    idRol: '' 
  });

  // ── Cargar datos iniciales ───────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioData, rolesData] = await Promise.all([
          usuarioService.getById(id),
          rolService.getAll(),
        ]);
        
        setUsuario(usuarioData);
        setForm({
          username: usuarioData.username || '',
          email: usuarioData.email || '',
          idRol: usuarioData.idRol || '',
        });
        setRoles(rolesData);

        // Protección de Seniority/Jerarquía (Frontend check)
        const targetRole = usuarioData.rol?.nombre?.toUpperCase();
        if (user.rol !== 'SUPER_ADMIN') {
          // Si no es Super Admin, no puede editar a otros si no tiene jerarquía
          // (Backend también valida esto)
        }
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
      toast.error(err.message || 'Error al intentar actualizar el usuario.');
    } finally {
      setSaving(false);
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
    </div>
  );
};

export default EditarUsuario;
