/**
 * FilterToggle — Toggle para filtrar activos/inactivos
 * Usado en páginas con soft delete (usuarios, roles, cuentas, etc.)
 */
const FilterToggle = ({ showInactive, onToggle, label = 'Mostrar inactivos' }) => {
  return (
    <label className="filter-toggle" title={label}>
      <input
        type="checkbox"
        checked={showInactive}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span className="filter-toggle-slider" />
      <span className="filter-toggle-label">{label}</span>
    </label>
  );
};

export default FilterToggle;
