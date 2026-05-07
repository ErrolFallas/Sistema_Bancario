import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import cuentaService from '../services/cuentaService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import { isAdminRole } from '../helpers/roleHelpers';
import { isOwnershipRestricted } from '../helpers/ownershipHelpers';
import { formatCurrency, formatAccountNumber } from '../helpers/formatHelpers';
import '../css/dashboard.css';
import '../css/forms.css';
import '../css/components.css';

/**
 * Gestión de Cuentas Bancarias
 * ────────────────────────────
 * CLIENTE: ve solo SUS cuentas (ownership — backend filtra por JWT)
 * EMPLEADO+: ve todas las cuentas
 * Soft delete: desactivar/reactivar
 */
const GestionCuentas = ({ ownership = false }) => {
  const { user } = useAuth();
  const toast = useToastContext();

  const [cuentas, setCuentas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState({ open: false, cuenta: null, action: null });
  const [processing, setProcessing] = useState(false);

  const isRestricted = ownership || isOwnershipRestricted(user);
  const canManage = !isRestricted;

  const cargarCuentas = async () => {
    try {
      setIsLoading(true);
      const data = await cuentaService.getAll(showInactive);
      setCuentas(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar cuentas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarCuentas(); }, [showInactive]);

  const handleAction = (cuenta, action) => {
    setModal({ open: true, cuenta, action });
  };

  const handleConfirmar = async () => {
    if (!modal.cuenta) return;
    setProcessing(true);
    try {
      if (modal.action === 'desactivar') {
        await cuentaService.desactivar(modal.cuenta.idCuenta);
        toast.success(`Cuenta "${modal.cuenta.numeroCuenta}" desactivada.`);
      } else {
        await cuentaService.reactivar(modal.cuenta.idCuenta);
        toast.success(`Cuenta "${modal.cuenta.numeroCuenta}" reactivada.`);
      }
      setModal({ open: false, cuenta: null, action: null });
      cargarCuentas();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} la cuenta.`);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { label: 'ID' },
    { label: 'Número' },
    { label: 'Tipo' },
    { label: 'Banco' },
    { label: 'Saldo' },
    { label: 'Estado' },
    ...(canManage ? [{ label: 'Acciones' }] : []),
  ];

  return (
    <div className="page-container">
      <PageHeader title={isRestricted ? 'Mis Cuentas' : 'Gestión de Cuentas'}>
        {canManage && (
          <FilterToggle showInactive={showInactive} onToggle={setShowInactive} label="Mostrar inactivas" />
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={cuentas}
        isLoading={isLoading}
        loadingMessage="Cargando cuentas bancarias..."
        emptyPreset="cuentas"
        renderRow={(cuenta) => (
          <tr key={cuenta.idCuenta} className={cuenta.isActive === false ? 'row-inactive' : ''}>
            <td>{cuenta.idCuenta}</td>
            <td style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>
              {formatAccountNumber(cuenta.numeroCuenta)}
            </td>
            <td>{cuenta.tipoCuenta?.nombre || '—'}</td>
            <td>{cuenta.banco?.nombre || '—'}</td>
            <td style={{ fontWeight: 600 }}>{formatCurrency(cuenta.saldo)}</td>
            <td><StatusBadge isActive={cuenta.isActive !== false} /></td>
            {canManage && (
              <td>
                <div className="action-buttons">
                  {cuenta.isActive === false ? (
                    <button className="btn-reactivar" onClick={() => handleAction(cuenta, 'reactivar')}>
                      Reactivar
                    </button>
                  ) : (
                    <button className="btn-desactivar" onClick={() => handleAction(cuenta, 'desactivar')}>
                      Desactivar
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        )}
      />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'desactivar' ? 'Desactivar Cuenta' : 'Reactivar Cuenta'}
        message={modal.cuenta && (
          <p>¿Está seguro de <strong>{modal.action}</strong> la cuenta <strong>"{modal.cuenta.numeroCuenta}"</strong>?</p>
        )}
        confirmLabel={modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={() => !processing && setModal({ open: false, cuenta: null, action: null })}
        isLoading={processing}
        variant={modal.action === 'desactivar' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default GestionCuentas;
