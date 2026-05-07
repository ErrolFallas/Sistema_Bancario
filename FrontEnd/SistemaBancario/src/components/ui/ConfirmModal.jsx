import '../../css/forms.css';

/**
 * ConfirmModal — Modal reutilizable de confirmación
 * ─────────────────────────────────────────────────
 * Variantes: danger (rojo), warning (amarillo), info (cyan)
 * Extraído del patrón usado en GestionRoles.
 */
const ConfirmModal = ({
  isOpen,
  title = '¿Confirmar acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger', // danger | warning | info
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      borderColor: 'rgba(239, 35, 60, 0.3)',
      titleColor: '#ff4d6d',
      btnBg: '#ef233c',
    },
    warning: {
      borderColor: 'rgba(255, 183, 3, 0.3)',
      titleColor: 'var(--accent-color)',
      btnBg: '#ffb703',
    },
    info: {
      borderColor: 'rgba(0, 180, 216, 0.3)',
      titleColor: 'var(--secondary-color)',
      btnBg: 'var(--secondary-color)',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ borderColor: styles.borderColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ color: styles.titleColor }}>
            {variant === 'danger' && '⚠️ '}{title}
          </h3>
        </div>
        <div className="modal-body">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={isLoading}
            style={variant === 'danger' ? { background: styles.btnBg, color: '#fff' } : {}}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
