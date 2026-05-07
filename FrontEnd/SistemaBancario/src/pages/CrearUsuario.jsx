import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import usuarioService from '../services/usuarioService';
import rolService from '../services/rolService';
import bancoService from '../services/bancoService';
import { canModify } from '../helpers/roleHelpers';
import '../css/forms.css';
import '../css/dashboard.css';

/**
 * Formulario Inteligente — Crear Usuario Completo
 * ────────────────────────────────────────────────
 * Un solo submit crea:
 *   - Si CLIENTE → Cliente + Usuario (vía POST /usuarios/completo)
 *   - Si EMPLEADO/GERENTE → Empleado + Usuario (vía POST /usuarios/completo)
 *   - Si ADMIN → Solo Usuario (vía POST /usuarios/completo)
 *
 * Los campos dinámicos se muestran/ocultan según el rol seleccionado.
 * La transacción atómica la maneja el backend (rollback si falla).
 */
const CrearUsuario = () => {
  const { user } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();

  // ── Estado del formulario ──────────────────────────────────────
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    usuarioEmail: '',
    idRol: '',
    // Campos de Cliente
    clienteNombre: '',
    clienteApellido: '',
    clienteCedula: '',
    clienteTelefono: '',
    clienteDireccion: '',
    // Campos de Empleado
    empleadoNombre: '',
    empleadoApellido: '',
    empleadoTelefono: '',
    empleadoIdBanco: '',
  });

  // ── Estado de carga ────────────────────────────────────────────
  const [roles, setRoles] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Cargar roles y bancos al montar ────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rolesData, bancosData] = await Promise.all([
          rolService.getAll(),
          bancoService.getAll(),
        ]);
        setRoles(rolesData);
        setBancos(bancosData);
      } catch (err) {
        setError('Error al cargar los datos iniciales. Verifique su sesión.');
      } finally {
        setLoadingDatos(false);
      }
    };
    cargarDatos();
  }, []);

  // ── Determinar qué campos mostrar según el rol ────────────────
  const getRolNombre = () => {
    if (!formData.idRol) return null;
    const rol = roles.find(r => r.idRol === Number(formData.idRol));
    return rol ? rol.nombre.toUpperCase() : null;
  };

  const rolSeleccionado = getRolNombre();
  const mostrarCamposCliente = rolSeleccionado === 'CLIENTE';
  const mostrarCamposEmpleado = rolSeleccionado === 'EMPLEADO' || rolSeleccionado === 'GERENTE';

  // ── Handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  // ── Validaciones del frontend ──────────────────────────────────
  const validarFormulario = () => {
    if (!formData.username.trim()) return 'El nombre de usuario es obligatorio.';
    if (formData.username.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres.';
    if (!formData.password) return 'La contraseña es obligatoria.';
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (!formData.idRol) return 'Debe seleccionar un rol para el nuevo usuario.';

    if (mostrarCamposCliente) {
      if (!formData.clienteNombre.trim()) return 'El nombre del cliente es obligatorio.';
      if (!formData.clienteApellido.trim()) return 'El apellido del cliente es obligatorio.';
      if (!formData.clienteCedula.trim()) return 'La cédula del cliente es obligatoria.';
    }

    if (mostrarCamposEmpleado) {
      if (!formData.empleadoNombre.trim()) return 'El nombre del empleado es obligatorio.';
      if (!formData.empleadoApellido.trim()) return 'El apellido del empleado es obligatorio.';
      if (!formData.empleadoIdBanco) return 'Debe seleccionar un banco para el empleado.';
    }

    return null; // Sin errores
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación frontend primero
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setIsLoading(true);

    try {
      // Construir payload limpio según el rol
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        idRol: Number(formData.idRol),
      };

      if (formData.usuarioEmail.trim()) {
        payload.usuarioEmail = formData.usuarioEmail.trim();
      }

      if (mostrarCamposCliente) {
        payload.clienteNombre = formData.clienteNombre.trim();
        payload.clienteApellido = formData.clienteApellido.trim();
        payload.clienteCedula = formData.clienteCedula.trim();
        if (formData.clienteTelefono.trim()) payload.clienteTelefono = formData.clienteTelefono.trim();
        if (formData.clienteDireccion.trim()) payload.clienteDireccion = formData.clienteDireccion.trim();
      }

      if (mostrarCamposEmpleado) {
        payload.empleadoNombre = formData.empleadoNombre.trim();
        payload.empleadoApellido = formData.empleadoApellido.trim();
        payload.empleadoIdBanco = Number(formData.empleadoIdBanco);
        if (formData.empleadoTelefono.trim()) payload.empleadoTelefono = formData.empleadoTelefono.trim();
      }

      const resultado = await usuarioService.createCompleto(payload);
      toast.success(resultado.mensaje || 'Usuario creado exitosamente.');
      setSuccess(`✅ ${resultado.mensaje}`);

      // Limpiar formulario
      setFormData({
        username: '', password: '', usuarioEmail: '', idRol: '',
        clienteNombre: '', clienteApellido: '', clienteCedula: '',
        clienteTelefono: '', clienteDireccion: '',
        empleadoNombre: '', empleadoApellido: '', empleadoTelefono: '', empleadoIdBanco: '',
      });

    } catch (err) {
      const msg = err.message || 'Error al crear el usuario. Verifique los datos e intente de nuevo.';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtrar roles que este usuario puede asignar ───────────────
  // Filtrar roles usando jerarquía: solo puede asignar roles inferiores
  const rolesDisponibles = roles.filter(r => {
    const nombre = r.nombre.toUpperCase();
    if (!user?.rol) return false;
    // SUPER_ADMIN puede asignar cualquier rol
    if (user.rol === 'SUPER_ADMIN') return true;
    // Los demás solo roles sobre los que tienen jerarquía
    return canModify(user.rol, nombre);
  });

  if (loadingDatos) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Cargando datos del formulario...</p>
      </div>
    );
  }

  return (
    <div className="page-container center-content">
      <div className="form-card animate-in">
        <header className="form-header">
          <div className="header-icon">👤</div>
          <div className="header-text">
            <h2>Crear Usuario</h2>
            <p>Formulario inteligente para gestión de personal y clientes</p>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="enterprise-form">
          {/* ── SECCIÓN 1: Credenciales ────────────────────── */}
          <section className="form-section">
            <div className="section-title">
              <span className="icon">🔐</span>
              <h3>Credenciales de Acceso</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario *</label>
                <input
                  type="text" id="username" name="username"
                  value={formData.username} onChange={handleChange}
                  placeholder="Ej. juan.perez" disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password" id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Mínimo 6 caracteres" disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="idRol">Rol del Sistema *</label>
                <select
                  id="idRol" name="idRol"
                  value={formData.idRol} onChange={handleChange}
                  disabled={isLoading}
                  required
                >
                  <option value="">Seleccionar Rol</option>
                  {rolesDisponibles.map(rol => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="usuarioEmail">Email de Usuario</label>
                <input
                  type="email" id="usuarioEmail" name="usuarioEmail"
                  value={formData.usuarioEmail} onChange={handleChange}
                  placeholder="email@ejemplo.com" disabled={isLoading}
                />
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 2: Cliente (condicional) ────────────── */}
          {mostrarCamposCliente && (
            <section className="form-section highlight-blue animate-in">
              <div className="section-title">
                <span className="icon">💼</span>
                <h3>Datos del Cliente</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="clienteNombre">Nombre(s) *</label>
                  <input
                    type="text" id="clienteNombre" name="clienteNombre"
                    value={formData.clienteNombre} onChange={handleChange}
                    placeholder="Juan" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clienteApellido">Apellido(s) *</label>
                  <input
                    type="text" id="clienteApellido" name="clienteApellido"
                    value={formData.clienteApellido} onChange={handleChange}
                    placeholder="Pérez" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="clienteCedula">Identificación *</label>
                  <input
                    type="text" id="clienteCedula" name="clienteCedula"
                    value={formData.clienteCedula} onChange={handleChange}
                    placeholder="0-0000-0000" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clienteTelefono">Teléfono</label>
                  <input
                    type="text" id="clienteTelefono" name="clienteTelefono"
                    value={formData.clienteTelefono} onChange={handleChange}
                    placeholder="0000-0000" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="clienteDireccion">Dirección Completa</label>
                <textarea
                  id="clienteDireccion" name="clienteDireccion"
                  value={formData.clienteDireccion} onChange={handleChange}
                  placeholder="Provincia, Cantón, Distrito..." disabled={isLoading}
                  rows="2"
                />
              </div>
            </section>
          )}

          {/* ── SECCIÓN 3: Empleado (condicional) ──────────── */}
          {mostrarCamposEmpleado && (
            <section className="form-section highlight-gold animate-in">
              <div className="section-title">
                <span className="icon">🏛️</span>
                <h3>Ficha de Empleado</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="empleadoNombre">Nombre(s) *</label>
                  <input
                    type="text" id="empleadoNombre" name="empleadoNombre"
                    value={formData.empleadoNombre} onChange={handleChange}
                    placeholder="María" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="empleadoApellido">Apellido(s) *</label>
                  <input
                    type="text" id="empleadoApellido" name="empleadoApellido"
                    value={formData.empleadoApellido} onChange={handleChange}
                    placeholder="López" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="empleadoTelefono">Teléfono Interno</label>
                  <input
                    type="text" id="empleadoTelefono" name="empleadoTelefono"
                    value={formData.empleadoTelefono} onChange={handleChange}
                    placeholder="Ext. 0000" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="empleadoIdBanco">Banco Asignado *</label>
                  <select
                    id="empleadoIdBanco" name="empleadoIdBanco"
                    value={formData.empleadoIdBanco} onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar Banco</option>
                    {bancos.map(banco => (
                      <option key={banco.idBanco} value={banco.idBanco}>
                        {banco.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          <footer className="form-footer">
            <div className="form-summary">
              {formData.idRol ? (
                <p>Configuración: <strong>{rolSeleccionado}</strong></p>
              ) : (
                <p>Complete los datos para continuar</p>
              )}
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/usuarios')} 
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary btn-large" 
                disabled={isLoading || !formData.idRol}
              >
                {isLoading ? 'Procesando...' : 'Crear Usuario'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CrearUsuario;
