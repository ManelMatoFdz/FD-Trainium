import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getHeroIcon } from './icons';
import './Button.css';

/**
 * Componente Button unificado para toda la aplicación
 * 
 * @param {string} variant - Tipo de botón: 'primary', 'secondary', 'ghost', 'danger', 'success', 'filter'
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 * @param {string} icon - Clase del icono FontAwesome (ej: 'fa-plus', 'fa-edit')
 * @param {string} iconPosition - Posición del icono: 'left', 'right'
 * @param {boolean} iconOnly - Solo mostrar icono (sin texto)
 * @param {string} to - Ruta para Link de React Router (convierte el botón en Link)
 * @param {string} href - URL externa (convierte el botón en <a>)
 * @param {boolean} fullWidth - Botón de ancho completo
 * @param {boolean} disabled - Deshabilitar botón
 * @param {string} className - Clases CSS adicionales
 * @param {function} onClick - Manejador de click
 * @param {string} type - Tipo HTML del botón: 'button', 'submit', 'reset'
 * @param {string} ariaLabel - Etiqueta de accesibilidad
 * @param {object} style - Estilos inline adicionales
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  iconOnly = false,
  to = null,
  href = null,
  fullWidth = false,
  disabled = false,
  className = '',
  onClick = null,
  type = 'button',
  ariaLabel = null,
  style = {},
  ...rest
}) => {
  // Construir clases CSS
  const classes = [
    'trainium-btn',
    `trainium-btn--${variant}`,
    `trainium-btn--${size}`,
    iconOnly && 'trainium-btn--icon-only',
    fullWidth && 'trainium-btn--full-width',
    disabled && 'trainium-btn--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Renderizar icono
  const renderIcon = () => {
    if (!icon) return null;
    
    // Intentar obtener el icono de Heroicons
    const HeroIcon = getHeroIcon(icon);
    
    if (HeroIcon) {
      return <HeroIcon className="trainium-btn__icon" aria-hidden="true" />;
    }
    
    // Fallback a FontAwesome si el icono no está mapeado
    return <i className={`fa ${icon} trainium-btn__icon`} aria-hidden="true"></i>;
  };

  // Renderizar contenido
  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && renderIcon()}
      {!iconOnly && <span className="trainium-btn__text">{children}</span>}
      {icon && iconPosition === 'right' && renderIcon()}
      {iconOnly && renderIcon()}
    </>
  );

  // Props comunes
  const commonProps = {
    className: classes,
    style,
    'aria-label': ariaLabel || (iconOnly ? children : null),
    disabled,
    ...rest,
  };

  // Renderizar como Link de React Router
  if (to && !disabled) {
    return (
      <Link to={to} {...commonProps} onClick={onClick}>
        {renderContent()}
      </Link>
    );
  }

  // Renderizar como enlace externo
  if (href && !disabled) {
    return (
      <a href={href} {...commonProps} onClick={onClick}>
        {renderContent()}
      </a>
    );
  }

  // Renderizar como botón normal
  return (
    <button type={type} {...commonProps} onClick={onClick}>
      {renderContent()}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success', 'filter', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconOnly: PropTypes.bool,
  to: PropTypes.string,
  href: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  ariaLabel: PropTypes.string,
  style: PropTypes.object,
};

export default Button;

