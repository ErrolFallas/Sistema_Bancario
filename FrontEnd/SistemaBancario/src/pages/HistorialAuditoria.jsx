import { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import auditoriaService from '../services/auditoriaService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import { formatDate } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/components.css';

/**
 * Historial de Auditoría — Solo lectura
 * Roles: ADMIN / SUPER_ADMIN
 */
const HistorialAuditoria = () => {
  const toast = useToastContext();
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setIsLoading(true);
        const data = await auditoriaService.getAll();
        setRegistros(data);
      } catch (err) {
        toast.error(err.message || 'Error al cargar auditoría.');
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  const registrosFiltrados = filtroAccion
    ? registros.filter(r => r.accion?.toUpperCase().includes(filtroAccion.toUpperCase()))
    : registros;

  const columns = [
    { label: 'ID' },
    { label: 'Usuario' },
    { label: 'Acción' },
    { label: 'Tabla' },
    { label: 'Registro' },
    { label: 'Descripción' },
    { label: 'IP' },
    { label: 'Fecha' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Historial de Auditoría">
        <div className="form-group" style={{ margin: 0 }}>
          <input
            type="text"
            placeholder="Filtrar por acción..."
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '200px' }}
          />
        </div>
      </PageHeader>

      <DataTable
        columns={columns}
        data={registrosFiltrados}
        isLoading={isLoading}
        loadingMessage="Cargando registros de auditoría..."
        emptyPreset="auditoria"
        renderRow={(r) => (
          <tr key={r.idHistorial || r.idAuditoria || Math.random()}>
            <td>{r.idHistorial || r.idAuditoria}</td>
            <td style={{ fontWeight: 600 }}>{r.usuario?.username || r.idUsuario || '—'}</td>
            <td>
              <span className="badge badge-admin" style={{ fontSize: '0.75rem' }}>
                {r.accion}
              </span>
            </td>
            <td style={{ color: 'var(--secondary-color)' }}>{r.tablaAfectada || '—'}</td>
            <td>{r.idRegistro || '—'}</td>
            <td style={{ color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.85rem' }}>
              {r.descripcion || '—'}
            </td>
            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.ip || '—'}</td>
            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(r.createdAt, true)}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default HistorialAuditoria;
