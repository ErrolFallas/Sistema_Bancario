import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import tarjetaService from '../services/tarjetaService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import { isOwnershipRestricted } from '../helpers/ownershipHelpers';
import { maskCardNumber, formatDate } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/components.css';

/**
 * Gestión de Tarjetas — Ownership + Soft Delete
 */
const GestionTarjetas = ({ ownership = false }) => {
  const { user } = useAuth();
  const toast = useToastContext();

  const [tarjetas, setTarjetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState({ open: false, tarjeta: null, action: null });
  const [processing, setProcessing] = useState(false);

  const isRestricted = ownership || isOwnershipRestricted(user);
  const canManage = !isRestricted;

  const cargarTarjetas = async () => {
    try {
      setIsLoading(true);
      const data = await tarjetaService.getAll(showInactive);
      setTarjetas(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar tarjetas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarTarjetas(); }, [showInactive]);

  const handleAction = (tarjeta, action) => setModal({ open: true, tarjeta, action });

  const handleConfirmar = async () => {
    if (!modal.tarjeta) return;
    setProcessing(true);
    try {
      if (modal.action === 'desactivar') {
        await tarjetaService.desactivar(modal.tarjeta.idTarjeta);
        toast.success('Tarjeta desactivada correctamente.');
      } else {
        await tarjetaService.reactivar(modal.tarjeta.idTarjeta);
        toast.success('Tarjeta reactivada correctamente.');
      }
      setModal({ open: false, tarjeta: null, action: null });
      cargarTarjetas();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} la tarjeta.`);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { label: 'ID' },
    { label: 'Número' },
    { label: 'Tipo' },
    { label: 'Marca' },
    { label: 'Vencimiento' },
    { label: 'Estado' },
    ...(canManage ? [{ label: 'Acciones' }] : []),
  ];

  return (
    <div className="page-container">
      <PageHeader title={isRestricted ? 'Mis Tarjetas' : 'Gestión de Tarjetas'}>
        {canManage && <FilterToggle showInactive={showInactive} onToggle={setShowInactive} label="Mostrar inactivas" />}
      </PageHeader>

      <DataTable
        columns={columns}
        data={tarjetas}
        isLoading={isLoading}
        loadingMessage="Cargando tarjetas..."
        emptyPreset="tarjetas"
        renderRow={(t) => (
          <tr key={t.idTarjeta} className={t.isActive === false ? 'row-inactive' : ''}>
            <td>{t.idTarjeta}</td>
            <td style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{maskCardNumber(t.numeroTarjeta)}</td>
            <td>{t.tipoTarjeta?.nombre || '—'}</td>
            <td>{t.marcaTarjeta?.nombre || '—'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{formatDate(t.fechaVencimiento)}</td>
            <td><StatusBadge isActive={t.isActive !== false} /></td>
            {canManage && (
              <td>
                <div className="action-buttons">
                  {t.isActive === false ? (
                    <button className="btn-reactivar" onClick={() => handleAction(t, 'reactivar')}>Reactivar</button>
                  ) : (
                    <button className="btn-desactivar" onClick={() => handleAction(t, 'desactivar')}>Desactivar</button>
                  )}
                </div>
              </td>
            )}
          </tr>
        )}
      />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'desactivar' ? 'Desactivar Tarjeta' : 'Reactivar Tarjeta'}
        message={<p>¿Confirmar <strong>{modal.action}</strong> de esta tarjeta?</p>}
        confirmLabel={modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={() => !processing && setModal({ open: false, tarjeta: null, action: null })}
        isLoading={processing}
        variant={modal.action === 'desactivar' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default GestionTarjetas;
