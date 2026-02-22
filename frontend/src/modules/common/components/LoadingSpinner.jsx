import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * LoadingSpinner - Spinner de carga personalizado con el estilo de Trainium
 * 
 * @param {string} message - Mensaje a mostrar debajo del spinner
 * @param {string} size - Tamaño del spinner ('sm', 'md', 'lg')
 * @param {boolean} overlay - Si debe mostrar overlay de fondo
 * @param {string} className - Clases adicionales
 */
const LoadingSpinner = ({
  message = 'Cargando...',
  size = 'md',
  overlay = true,
  className = '',
}) => {
  const rootClass = overlay ? 'trainium-loading-spinner trainium-loading-spinner--overlay' : 'trainium-loading-spinner trainium-loading-spinner--inline';
  const accessibleLabel = message && message.trim().length > 0 ? message : 'Cargando...';

  return (
    <output
      className={`${rootClass} ${className}`}
      aria-live="polite"
      aria-label={accessibleLabel}
    >
      <div className={`trainium-spinner-container trainium-spinner-container--${size}`}>
        <div className="trainium-spinner">
          <div className="trainium-spinner__ring"></div>
        </div>
        {message && (
          <p className="trainium-spinner__message">{message}</p>
        )}
      </div>
    </output>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  overlay: PropTypes.bool,
  className: PropTypes.string,
};

export default LoadingSpinner;
