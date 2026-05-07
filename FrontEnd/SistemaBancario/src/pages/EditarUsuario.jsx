import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import usuarioService from '../services/usuarioService';
import rolService from '../services/rolService';
import { canModify } from '../helpers/roleHelpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../css/forms.css';
import '../css/dashboard.css';

/**
 * Editar Usuario — Formulario de edición
 * ───────────────────────────────────────
 * Carga los datos del usuario por ID y permite editarlos.
 * Restricciones jerárquicas: no puede editar usuario de rol superior.
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
  const [form, setForm] = useState({ username: '', email: '', idRol: '' });

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
      } catch (err) {
        toast.error(err.message || 'Error al cargar el usuario.');
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.warning('El username es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await usuarioService.update(id, form);
      toast.success('Usuario actualizado correctamente.');
      navigate('/usuarios');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Cargando usuario..." />;
  if (!usuario) {
    return (
      <div className="page-container">
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--error-color)' }}>Usuario no encontrado</h2>
          <button className="btn-primary" onClick={() => navigate('/usuarios')} style={{ marginTop: '1rem' }}>
            Volver a Usuarios
          </button>
        </div>
      </div>
    );
  }

  // Roles disponibles: solo los que puede asignar según jerarquía
  const rolesDisponibles = roles.filter(r => {
    if (!user?.rol) return false;
    if (user.rol === 'SUPER_ADMIN') return true;
    return canModify(user.rol, r.nombre);
  });

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '2rem' }}>Editar Usuario: <span style={{ color: 'var(--secondary-color)' }}>{usuario.username}</span></h1>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="editUsername">Username *</label>
              <input type="text" id="editUsername" value={form.username}
                onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                disabled={saving} required />
            </div>
            <div className="form-group">
              <label htmlFor="editEmail">Email</label>
              <input type="email" id="editEmail" value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={saving} />
            </div>
            <div className="form-group">
              <label htmlFor="editRol">Rol</label>
              <select id="editRol" value={form.idRol}
                onChange={(e) => setForm(p => ({ ...p, idRol: parseInt(e.target.value) }))}
                disabled={saving}>
                {rolesDisponibles.map(r => (
                  <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/usuarios')} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUsuario;
