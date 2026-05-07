import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import clienteService from '../services/clienteService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import FilterToggle from '../components/ui/FilterToggle';
import StatusBadge from '../components/ui/StatusBadge';
import { getBadgeClass } from '../helpers/roleHelpers';
import '../css/dashboard.css';
import '../css/forms.css';
import '../css/components.css';

/**
 * Gestión de Clientes — Administración posterior
 * ───────────────────────────────────────────────
 * NO duplica CrearUsuario — aquí se administra, consulta y edita
 * la información de clientes existentes.
 *
 * Roles: ADMIN, GERENTE, EMPLEADO
 */
const GestionClientes = () => {
  const { user } = useAuth();
  const toast = useToastContext();

  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const columns = [
    { label: 'ID' },
    { label: 'Nombre' },
    { label: 'Apellido' },
    { label: 'Cédula' },
    { label: 'Teléfono' },
    { label: 'Dirección' },
    { label: 'Acciones' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Clientes" />

      <DataTable
        columns={columns}
        data={clientes}
        isLoading={isLoading}
        loadingMessage="Cargando clientes..."
        emptyPreset="clientes"
        renderRow={(cliente) => (
          <tr key={cliente.idCliente}>
            <td>{cliente.idCliente}</td>
            <td style={{ fontWeight: 600 }}>{cliente.nombre}</td>
            <td>{cliente.apellido}</td>
            <td style={{ color: 'var(--secondary-color)' }}>{cliente.cedula || '—'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{cliente.telefono || '—'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{cliente.direccion || '—'}</td>
            <td>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Detalle en Prioridad 2
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default GestionClientes;
