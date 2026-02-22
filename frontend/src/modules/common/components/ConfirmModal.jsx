import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ExclamationTriangleIcon, QuestionMarkCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // danger, warning, success, info
  isLoading = false,
}) => {
  const dialogRef = useRef(null);

  // Manejar apertura/cierre del dialog nativo
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Verificar si showModal está disponible (no disponible en jsdom)
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        // Fallback para entornos que no soportan showModal
        dialog.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
    } else {
      // Verificar si close está disponible
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        // Fallback para entornos que no soportan close
        dialog.removeAttribute('open');
      }
      document.body.style.overflow = '';
    }

    return () => {
      if (dialog) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Cerrar con ESC (el dialog nativo ya maneja esto, pero lo mantenemos por compatibilidad)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      dialog.addEventListener('keydown', handleEscape);
    }

    return () => {
      if (dialog) {
        dialog.removeEventListener('keydown', handleEscape);
      }
    };
  }, [isOpen, onClose, isLoading]);

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <ExclamationTriangleIcon className="confirm-modal__icon confirm-modal__icon--danger" />;
      case 'warning':
        return <ExclamationTriangleIcon className="confirm-modal__icon confirm-modal__icon--warning" />;
      case 'success':
        return <CheckCircleIcon className="confirm-modal__icon confirm-modal__icon--success" />;
      case 'info':
        return <InformationCircleIcon className="confirm-modal__icon confirm-modal__icon--info" />;
      default:
        return <QuestionMarkCircleIcon className="confirm-modal__icon confirm-modal__icon--info" />;
    }
  };

  const handleBackdropClick = (e) => {
    // El dialog nativo cierra cuando se hace click en el backdrop (::backdrop)
    // pero necesitamos manejar el click en el overlay
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleBackdropKey = (e) => {
    // Hacer accesible el backdrop para teclado: Enter o Space cierran el modal
    const key = e.key || e.code;
    if (!isLoading && (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space')) {
      e.preventDefault();
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!isLoading) {
      await onConfirm();
    }
  };

  // No renderizar nada si el modal no está abierto
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-modal-overlay">
      <button
        type="button"
        className="confirm-modal-backdrop"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKey}
        aria-label="Cerrar diálogo"
      ></button>
      <dialog
        ref={dialogRef}
        className="confirm-modal"
        aria-labelledby="confirm-modal-title"
        aria-modal="true"
      >
        <div className="confirm-modal__icon-wrapper">
          {getIcon()}
        </div>

        <div className="confirm-modal__content">
          <h2 id="confirm-modal-title" className="confirm-modal__title">
            {title}
          </h2>
          
          {message && (
            <p className="confirm-modal__message">
              {message}
            </p>
          )}
        </div>

        <div className="confirm-modal__actions">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
          >
            {cancelText}
          </Button>
          
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="lg"
            onClick={handleConfirm}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </dialog>
    </div>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'success', 'info']),
  isLoading: PropTypes.bool,
};

export default ConfirmModal;
