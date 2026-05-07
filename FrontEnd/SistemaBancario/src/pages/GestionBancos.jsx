import { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import bancoService from '../services/bancoService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import '../css/dashboard.css';
import '../css/forms.css';
import '../css/components.css';

/**
 * Gestión de Bancos — CRUD + Soft Delete
 * Solo ADMIN / SUPER_ADMIN
 */
const GestionBancos = () => {
  const toast = useToastContext();
  const [bancos, setBancos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState({ open: false, banco: null, action: null });
  const [processing, setProcessing] = useState(false);

  // Formulario crear
  const [form, setForm] = useState({ nombre: '', codigoSWIFT: '', pais: '' });
  const [creando, setCreando] = useState(false);

  const cargarBancos = async () => {
    try {
      setIsLoading(true);
      const data = await bancoService.getAll(showInactive);
      setBancos(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar bancos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarBancos(); }, [showInactive]);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.warning('El nombre del banco es obligatorio.');
      return;
    }
    setCreando(true);
    try {
      await bancoService.create(form);
      toast.success(`Banco "${form.nombre}" creado correctamente.`);
      setForm({ nombre: '', codigoSWIFT: '', pais: '' });
      cargarBancos();
    } catch (err) {
      toast.error(err.message || 'Error al crear el banco.');
    } finally {
      setCreando(false);
    }
  };

  const handleAction = (banco, action) => setModal({ open: true, banco, action });

  const handleConfirmar = async () => {
    if (!modal.banco) return;
    setProcessing(true);
    try {
      if (modal.action === 'desactivar') {
        await bancoService.desactivar(modal.banco.idBanco);
        toast.success(`Banco "${modal.banco.nombre}" desactivado.`);
      } else if (modal.action === 'reactivar') {
        await bancoService.reactivar(modal.banco.idBanco);
        toast.success(`Banco "${modal.banco.nombre}" reactivado.`);
      } else if (modal.action === 'eliminar') {
        await bancoService.delete(modal.banco.idBanco);
        toast.success(`Banco "${modal.banco.nombre}" eliminado.`);
      }
      setModal({ open: false, banco: null, action: null });
      cargarBancos();
    } catch (err) {
      toast.error(err.message || `Error al ${modal.action} el banco.`);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { label: 'ID' },
    { label: 'Nombre' },
    { label: 'SWIFT' },
    { label: 'País' },
    { label: 'Estado' },
    { label: 'Acciones' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Bancos">
        <FilterToggle showInactive={showInactive} onToggle={setShowInactive} label="Mostrar inactivos" />
      </PageHeader>

      {/* Formulario crear banco */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>🏛️ Registrar Nuevo Banco</h3>
        <form onSubmit={handleCrear}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bancoNombre">Nombre *</label>
              <input type="text" id="bancoNombre" value={form.nombre}
                onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej. Banco Nacional" disabled={creando} required />
            </div>
            <div className="form-group">
              <label htmlFor="bancoSwift">Código SWIFT</label>
              <input type="text" id="bancoSwift" value={form.codigoSWIFT}
                onChange={(e) => setForm(p => ({ ...p, codigoSWIFT: e.target.value }))}
                placeholder="Ej. BNCRCRSJ" disabled={creando} />
            </div>
            <div className="form-group">
              <label htmlFor="bancoPais">País</label>
              <input type="text" id="bancoPais" value={form.pais}
                onChange={(e) => setForm(p => ({ ...p, pais: e.target.value }))}
                placeholder="Ej. Costa Rica" disabled={creando} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={creando}>
              {creando ? 'Creando...' : 'Guardar Banco'}
            </button>
          </div>
        </form>
      </div>

      <DataTable
        columns={columns} data={bancos} isLoading={isLoading}
        loadingMessage="Cargando bancos..." emptyPreset="bancos"
        renderRow={(b) => (
          <tr key={b.idBanco} className={b.isActive === false ? 'row-inactive' : ''}>
            <td>{b.idBanco}</td>
            <td style={{ fontWeight: 600 }}>{b.nombre}</td>
            <td style={{ color: 'var(--secondary-color)', fontFamily: 'monospace' }}>{b.codigoSWIFT || '—'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{b.pais || '—'}</td>
            <td><StatusBadge isActive={b.isActive !== false} /></td>
            <td>
              <div className="action-buttons">
                {b.isActive === false ? (
                  <button className="btn-reactivar" onClick={() => handleAction(b, 'reactivar')}>Reactivar</button>
                ) : (
                  <button className="btn-desactivar" onClick={() => handleAction(b, 'desactivar')}>Desactivar</button>
                )}
                <button className="btn-danger" onClick={() => handleAction(b, 'eliminar')}>Eliminar</button>
              </div>
            </td>
          </tr>
        )}
      />

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'eliminar' ? 'Eliminar Banco' : modal.action === 'desactivar' ? 'Desactivar Banco' : 'Reactivar Banco'}
        message={modal.banco && <p>¿Confirmar <strong>{modal.action}</strong> del banco <strong>"{modal.banco.nombre}"</strong>?</p>}
        confirmLabel={modal.action === 'eliminar' ? 'Eliminar' : modal.action === 'desactivar' ? 'Desactivar' : 'Reactivar'}
        onConfirm={handleConfirmar}
        onCancel={() => !processing && setModal({ open: false, banco: null, action: null })}
        isLoading={processing}
        variant={modal.action === 'eliminar' ? 'danger' : modal.action === 'desactivar' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default GestionBancos;
