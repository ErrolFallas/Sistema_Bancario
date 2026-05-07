import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

/**
 * DataTable — Tabla genérica reutilizable
 * ────────────────────────────────────────
 * Encapsula: headers, filas, loading, empty state.
 * Cada módulo provee su propio renderRow.
 */
const DataTable = ({
  columns,
  data,
  isLoading,
  loadingMessage = 'Cargando datos...',
  emptyPreset = 'generic',
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionTo,
  renderRow,
}) => {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        preset={emptyPreset}
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionTo={emptyActionTo}
      />
    );
  }

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
