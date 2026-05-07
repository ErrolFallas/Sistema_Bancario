import { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import transaccionService from '../services/transaccionService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import { formatCurrency, formatDate } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/components.css';

/**
 * Gestión de Transacciones — Solo lectura
 * Roles: ADMIN, GERENTE
 */
const GestionTransacciones = () => {
  const toast = useToastContext();
  const [transacciones, setTransacciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setIsLoading(true);
        const data = await transaccionService.getAll();
        setTransacciones(data);
      } catch (err) {
        toast.error(err.message || 'Error al cargar transacciones.');
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  const columns = [
    { label: 'ID' },
    { label: 'Tipo' },
    { label: 'Monto' },
    { label: 'Cuenta Origen' },
    { label: 'Cuenta Destino' },
    { label: 'Canal' },
    { label: 'Estado' },
    { label: 'Fecha' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Historial de Transacciones" />

      <DataTable
        columns={columns}
        data={transacciones}
        isLoading={isLoading}
        loadingMessage="Cargando transacciones..."
        emptyPreset="transacciones"
        renderRow={(t) => (
          <tr key={t.idTransaccion}>
            <td>{t.idTransaccion}</td>
            <td>
              <span className="badge badge-empleado">
                {t.tipoTransaccion?.nombre || '—'}
              </span>
            </td>
            <td style={{ fontWeight: 600 }}>{formatCurrency(t.monto)}</td>
            <td style={{ color: 'var(--secondary-color)' }}>{t.cuentaOrigen?.numeroCuenta || '—'}</td>
            <td style={{ color: 'var(--secondary-color)' }}>{t.cuentaDestino?.numeroCuenta || '—'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{t.canal?.nombre || '—'}</td>
            <td>
              <span className="badge badge-admin">
                {t.estadoTransaccion?.nombre || '—'}
              </span>
            </td>
            <td style={{ color: 'var(--text-muted)' }}>{formatDate(t.createdAt, true)}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default GestionTransacciones;
