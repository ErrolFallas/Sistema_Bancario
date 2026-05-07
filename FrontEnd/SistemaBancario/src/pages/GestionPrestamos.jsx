import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import prestamoService from '../services/prestamoService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import { isOwnershipRestricted } from '../helpers/ownershipHelpers';
import { formatCurrency } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/components.css';

/**
 * Gestión de Préstamos — Ownership + Soft Delete
 */
const GestionPrestamos = ({ ownership = false }) => {
  const { user } = useAuth();
  const toast = useToastContext();

  const [prestamos, setPrestamos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState({ open: false, prestamo: null, action: null });
  const [processing, setProcessing] = useState(false);

  const isRestricted = ownership || isOwnershipRestricted(user);
  const canManage = !isRestricted;

  const cargarPrestamos = async () => {
    try {
      setIsLoading(true);
      const data = await prestamoService.getAll(showInactive);
      setPrestamos(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar préstamos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarPrestamos(); }, [showInactive]);

  const handleAction = (prestamo, action) => setModal({ open: true, prestamo, action });

  const handleConfirmar = async () => {
    if (!modal.prestamo) return;
    setProcessing(true);
    try {
      if (modal.action === 'desactivar') {
        await prestamoService.desactivar(modal.prestamo.idPrestamo);
        toast.success('Préstamo desactivado correctamente.');
      } else {
        await prestamoService.reactivar(modal.prestamo.idPrestamo);
        toast.success('Préstamo reactivado correctamente.');
      }
      setModal({ open: false, prestamo: null, action: null });
      cargarPrestamos();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} el préstamo.`);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { label: 'ID' },
    { label: 'Monto' },
    { label: 'Tasa (%)' },
    { label: 'Plazo (meses)' },
    { label: 'Estado Préstamo' },
    { label: 'Activo' },
    ...(canManage ? [{ label: 'Acciones' }] : []),
  ];

  return (
    <div className="page-container">
      <PageHeader title={isRestricted ? 'Mis Préstamos' : 'Gestión de Préstamos'}>
        {canManage && <FilterToggle showInactive={showInactive} onToggle={setShowInactive} label="Mostrar inactivos" />}
      </PageHeader>

      <DataTable
        columns={columns}
        data={prestamos}
        isLoading={isLoading}
        loadingMessage="Cargando préstamos..."
        emptyPreset="prestamos"
        renderRow={(p) => (
          <tr key={p.idPrestamo} className={p.isActive === false ? 'row-inactive' : ''}>
            <td>{p.idPrestamo}</td>
            <td style={{ fontWeight: 600 }}>{formatCurrency(p.monto)}</td>
            <td>{p.tasaInteres != null ? `${p.tasaInteres}%` : '—'}</td>
            <td>{p.plazoMeses || '—'}</td>
            <td>
              <span className="badge badge-empleado">
                {p.estadoPrestamo?.nombre || '—'}
              </span>
            </td>
            <td><StatusBadge isActive={p.isActive !== false} /></td>
            {canManage && (
              <td>
                <div className="action-buttons">
                  {p.isActive === false ? (
                    <button className="btn-reactivar" onClick={() => handleAction(p, 'reactivar')}>Reactivar</button>
                  ) : (
                    <button className="btn-desactivar" onClick={() => handleAction(p, 'desactivar')}>Desactivar</button>
                  )}
                </div>
              </td>
            )}
          </tr>
        )}
      />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'desactivar' ? 'Desactivar Préstamo' : 'Reactivar Préstamo'}
        message={<p>¿Confirmar <strong>{modal.action}</strong> de este préstamo?</p>}
        confirmLabel={modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={() => !processing && setModal({ open: false, prestamo: null, action: null })}
        isLoading={processing}
        variant={modal.action === 'desactivar' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default GestionPrestamos;
