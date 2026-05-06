import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import rolService from '../services/rolService';
import bancoService from '../services/bancoService';
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
  const navigate = useNavigate();

  // ── Estado del formulario ──────────────────────────────────────
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    idRol: '',
    // Campos de Cliente
    clienteNombre: '',
    clienteApellido: '',
    clienteCedula: '',
    clienteEmail: '',
    clienteTelefono: '',
    clienteDireccion: '',
    // Campos de Empleado
    empleadoNombre: '',
    empleadoApellido: '',
    empleadoPuesto: '',
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

      if (mostrarCamposCliente) {
        payload.clienteNombre = formData.clienteNombre.trim();
        payload.clienteApellido = formData.clienteApellido.trim();
        payload.clienteCedula = formData.clienteCedula.trim();
        if (formData.clienteEmail.trim()) payload.clienteEmail = formData.clienteEmail.trim();
        if (formData.clienteTelefono.trim()) payload.clienteTelefono = formData.clienteTelefono.trim();
        if (formData.clienteDireccion.trim()) payload.clienteDireccion = formData.clienteDireccion.trim();
      }

      if (mostrarCamposEmpleado) {
        payload.empleadoNombre = formData.empleadoNombre.trim();
        payload.empleadoApellido = formData.empleadoApellido.trim();
        payload.empleadoIdBanco = Number(formData.empleadoIdBanco);
        if (formData.empleadoPuesto.trim()) payload.empleadoPuesto = formData.empleadoPuesto.trim();
      }

      const resultado = await usuarioService.createCompleto(payload);
      setSuccess(`✅ ${resultado.mensaje}`);

      // Limpiar formulario
      setFormData({
        username: '', password: '', idRol: '',
        clienteNombre: '', clienteApellido: '', clienteCedula: '',
        clienteEmail: '', clienteTelefono: '', clienteDireccion: '',
        empleadoNombre: '', empleadoApellido: '', empleadoPuesto: '', empleadoIdBanco: '',
      });

    } catch (err) {
      setError(err.message || 'Error al crear el usuario. Verifique los datos e intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtrar roles que este usuario puede asignar ───────────────
  const rolesDisponibles = roles.filter(r => {
    const nombre = r.nombre.toUpperCase();
    if (nombre === 'SUPER_ADMIN' && user?.rol !== 'SUPER_ADMIN') return false;
    return true;
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
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2rem', fontWeight: 700,
            background: 'linear-gradient(90deg, #fff, var(--secondary-color))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Crear Usuario
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Formulario inteligente — un solo envío crea todo
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── SECCIÓN 1: Credenciales ────────────────────── */}
          <fieldset className="form-section">
            <legend>🔐 Credenciales de Acceso</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario *</label>
                <input
                  type="text" id="username" name="username"
                  value={formData.username} onChange={handleChange}
                  placeholder="Ej. juanperez" disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password" id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Mínimo 6 caracteres" disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="idRol">Rol a Asignar *</label>
              <select
                id="idRol" name="idRol"
                value={formData.idRol} onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">— Seleccionar Rol —</option>
                {rolesDisponibles.map(rol => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.nombre} {rol.descripcion ? `— ${rol.descripcion}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* ── SECCIÓN 2: Cliente (condicional) ────────────── */}
          {mostrarCamposCliente && (
            <fieldset className="form-section section-cliente animate-in">
              <legend>👤 Datos del Cliente</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="clienteNombre">Nombre *</label>
                  <input
                    type="text" id="clienteNombre" name="clienteNombre"
                    value={formData.clienteNombre} onChange={handleChange}
                    placeholder="Juan" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clienteApellido">Apellido *</label>
                  <input
                    type="text" id="clienteApellido" name="clienteApellido"
                    value={formData.clienteApellido} onChange={handleChange}
                    placeholder="Pérez" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="clienteCedula">Cédula *</label>
                <input
                  type="text" id="clienteCedula" name="clienteCedula"
                  value={formData.clienteCedula} onChange={handleChange}
                  placeholder="Ej. 1-1234-5678" disabled={isLoading}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="clienteEmail">Email</label>
                  <input
                    type="email" id="clienteEmail" name="clienteEmail"
                    value={formData.clienteEmail} onChange={handleChange}
                    placeholder="correo@ejemplo.com" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clienteTelefono">Teléfono</label>
                  <input
                    type="text" id="clienteTelefono" name="clienteTelefono"
                    value={formData.clienteTelefono} onChange={handleChange}
                    placeholder="8888-8888" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="clienteDireccion">Dirección</label>
                <input
                  type="text" id="clienteDireccion" name="clienteDireccion"
                  value={formData.clienteDireccion} onChange={handleChange}
                  placeholder="San José, Costa Rica" disabled={isLoading}
                />
              </div>
            </fieldset>
          )}

          {/* ── SECCIÓN 3: Empleado (condicional) ──────────── */}
          {mostrarCamposEmpleado && (
            <fieldset className="form-section section-empleado animate-in">
              <legend>🏢 Datos del Empleado</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="empleadoNombre">Nombre *</label>
                  <input
                    type="text" id="empleadoNombre" name="empleadoNombre"
                    value={formData.empleadoNombre} onChange={handleChange}
                    placeholder="María" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="empleadoApellido">Apellido *</label>
                  <input
                    type="text" id="empleadoApellido" name="empleadoApellido"
                    value={formData.empleadoApellido} onChange={handleChange}
                    placeholder="López" disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="empleadoPuesto">Puesto</label>
                  <input
                    type="text" id="empleadoPuesto" name="empleadoPuesto"
                    value={formData.empleadoPuesto} onChange={handleChange}
                    placeholder="Ej. Cajero, Gerente de Sucursal" disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="empleadoIdBanco">Banco *</label>
                  <select
                    id="empleadoIdBanco" name="empleadoIdBanco"
                    value={formData.empleadoIdBanco} onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">— Seleccionar Banco —</option>
                    {bancos.map(banco => (
                      <option key={banco.idBanco} value={banco.idBanco}>
                        {banco.nombre} ({banco.codigo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>
          )}

          {/* ── Indicador visual ────────────────────────────── */}
          {formData.idRol && (
            <div className="form-preview">
              <span>📋 Se creará:</span>
              <strong>
                {mostrarCamposCliente && ' Cliente →'}
                {mostrarCamposEmpleado && ' Empleado →'}
                {' Usuario'}
                {rolSeleccionado && ` (${rolSeleccionado})`}
              </strong>
            </div>
          )}

          {/* ── Botones ─────────────────────────────────────── */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/usuarios')} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Procesando transacción...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearUsuario;
