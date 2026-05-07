import { useState, useRef, useEffect } from 'react';
import '../../css/components.css';

/**
 * CustomSelect Enterprise
 * ────────────────────────────────────────────────────────────
 * Componente de selección estabilizado con scroll optimizado,
 * cierre automático y posicionamiento robusto.
 */
const CustomSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Seleccionar...',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`custom-select-container ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      {label && <label className="custom-select-label">{label}{required && ' *'}</label>}
      
      <div 
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`} 
        onClick={handleToggle}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`selected-text ${!selectedOption ? 'placeholder' : ''}`}>
          {displayLabel}
        </span>
        <span className={`select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </div>

      {isOpen && (
        <ul className="custom-select-dropdown stable-render">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li 
                key={`${option.value}-${index}`}
                className={`custom-select-option ${String(option.value) === String(value) ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="custom-select-no-options">Sin opciones</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
