import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import '../css/dashboard.css';
import '../css/forms.css';

/**
 * Gestión de Usuarios — ADMIN / SUPER_ADMIN
 * Lista todos los usuarios del sistema con su rol y entidad asociada.
 */
const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleEliminar = async (usuario) => {
    const rolNombre = usuario.rol?.nombre?.toUpperCase() || '';
    if (rolNombre === 'SUPER_ADMIN') {
      setError('No se puede eliminar un SUPER_ADMIN desde esta interfaz.');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar al usuario "${usuario.username}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await usuarioService.delete(usuario.idUsuario);
      setSuccess(`Usuario "${usuario.username}" eliminado correctamente.`);
      cargarUsuarios();
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario.');
    }
  };

  const getBadge = (rolNombre) => {
    if (!rolNombre) return 'badge-admin';
    const upper = rolNombre.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'badge-admin';
    if (upper === 'CLIENTE') return 'badge-cliente';
    if (upper === 'EMPLEADO' || upper === 'GERENTE') return 'badge-empleado';
    return 'badge-admin';
  };

  const getEntidadAsociada = (usuario) => {
    if (usuario.cliente) {
      return `${usuario.cliente.nombre} ${usuario.cliente.apellido}`;
    }
    if (usuario.empleado) {
      return `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;
    }
    return '—';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <Link to="/usuarios/crear" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Crear Usuario
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Cargando usuarios...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios registrados en el sistema.</p>
          <Link to="/usuarios/crear" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
            Crear primer usuario
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Entidad Asociada</th>
                <th>Estado</th>
                <th>Sesión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const rolNombre = u.rol?.nombre || 'Sin rol';
                return (
                  <tr key={u.idUsuario}>
                    <td>{u.idUsuario}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>
                      <span className={`badge ${getBadge(rolNombre)}`}>
                        {rolNombre}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {getEntidadAsociada(u)}
                    </td>
                    <td>
                      {u.cuentaActiva
                        ? <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>● Activa</span>
                        : <span style={{ color: 'var(--error-color)', fontWeight: 600 }}>● Inactiva</span>
                      }
                    </td>
                    <td>
                      {u.usuarioLogeado
                        ? <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>🟢 En línea</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⚪ Desconectado</span>
                      }
                    </td>
                    <td>
                      {rolNombre.toUpperCase() === 'SUPER_ADMIN' ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Protegido</span>
                      ) : (
                        <button className="btn-danger" onClick={() => handleEliminar(u)}>
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
    </div>
  );
};

export default GestionUsuarios;
