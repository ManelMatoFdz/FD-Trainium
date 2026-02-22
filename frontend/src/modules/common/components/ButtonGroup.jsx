import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { getHeroIcon } from './icons';
import Button from './Button';
import './ButtonGroup.css';

/**
 * ButtonGroup - Agrupa botones con un dropdown para acciones secundarias
 * Útil para evitar "apelotonamiento" de botones en detalles
 * 
 * @param {array} primaryActions - Acciones principales que siempre se muestran
 * @param {array} dropdownActions - Acciones secundarias en dropdown
 * @param {string} dropdownLabel - Texto del botón dropdown
 * @param {string} className - Clases adicionales
 */
const ButtonGroup = ({
  primaryActions = [],
  dropdownActions = [],
  dropdownLabel = 'Más acciones',
  dropdownIcon = 'fa-ellipsis-v',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Cerrar dropdown al hacer click fuera o al hacer scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // true = captura en fase de captura
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Calcular posición del dropdown cuando se abre
  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`trainium-button-group ${className}`}>
      {/* Acciones principales */}
      {primaryActions.map((action) => {
        const keyParts = [
          action.id,
          typeof action.label === 'string' ? action.label : (action.label?.props?.id),
          action.to,
          action.icon,
          action.variant
        ].filter(Boolean);
        const key = keyParts.join('|') || `action-${action.icon || 'default'}`;
        return (
          <Button
            key={key}
            variant={action.variant || 'secondary'}
            icon={action.icon}
            onClick={action.onClick}
            to={action.to}
            disabled={action.disabled}
            size={action.size || 'md'}
          >
            {action.label}
          </Button>
        );
      })}

      {/* Dropdown de acciones secundarias */}
      {dropdownActions.length > 0 && (
        <div className="trainium-dropdown" ref={dropdownRef}>
          <button
            ref={triggerRef}
            className={`trainium-dropdown-trigger ${isOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-label={dropdownLabel}
            aria-expanded={isOpen}
          >
            <EllipsisVerticalIcon className="trainium-dropdown-icon" />
          </button>

          {isOpen && (
            <div 
              className="trainium-dropdown-menu" 
              style={{ 
                top: `${dropdownPosition.top}px`, 
                right: `${dropdownPosition.right}px` 
              }}
            >
              {dropdownActions.map((action) => {
                const HeroIcon = action.icon ? getHeroIcon(action.icon) : null;
                const keyParts = [
                  action.id,
                  typeof action.label === 'string' ? action.label : (action.label?.props?.id),
                  action.icon,
                  action.variant
                ].filter(Boolean);
                const key = keyParts.join('|') || `dropdown-${action.icon || 'default'}`;
                return (
                  <button
                    key={key}
                    className={`trainium-dropdown-item ${action.variant || ''}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (action.onClick) action.onClick();
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon && (
                      HeroIcon ? (
                        <HeroIcon className="trainium-dropdown-item__icon" aria-hidden="true" />
                      ) : (
                        <i className={`fas ${action.icon} trainium-dropdown-item__icon`}></i>
                      )
                    )}
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ButtonGroup.propTypes = {
  primaryActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      variant: PropTypes.string,
      icon: PropTypes.string,
      onClick: PropTypes.func,
      to: PropTypes.string,
      disabled: PropTypes.bool,
      size: PropTypes.string,
    })
  ),
  dropdownActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      variant: PropTypes.string,
    })
  ),
  dropdownLabel: PropTypes.string,
  dropdownIcon: PropTypes.string,
  className: PropTypes.string,
};

export default ButtonGroup;

