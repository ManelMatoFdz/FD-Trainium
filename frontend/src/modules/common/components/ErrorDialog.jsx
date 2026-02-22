import { useEffect, useRef } from 'react';
import {NetworkError} from '../../../backend';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const ErrorDialog = ({error, onClose}) => {
    const dialogRef = useRef(null);

    // Manejar apertura/cierre del dialog nativo
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (error != null) {
            // Verificar si showModal está disponible (no disponible en jsdom)
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
            }
            document.body.style.overflow = 'hidden';
        } else {
            // Verificar si close está disponible
            if (typeof dialog.close === 'function') {
                dialog.close();
            }
            document.body.style.overflow = '';
        }

        return () => {
            if (dialog) {
                if (typeof dialog.close === 'function') {
                    dialog.close();
                }
                document.body.style.overflow = '';
            }
        };
    }, [error]);

    // Cerrar con ESC
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && error != null) {
                onClose();
            }
        };

        if (error != null) {
            dialog.addEventListener('keydown', handleEscape);
        }

        return () => {
            if (dialog) {
                dialog.removeEventListener('keydown', handleEscape);
            }
        };
    }, [error, onClose]);

    if (error == null) {
        return null;
    }

    const message = error instanceof NetworkError ?
        "Network Error" :
        error.message;

    const handleBackdropClick = (e) => {
        // Cerrar cuando se hace click en el backdrop (div, no en el dialog)
        if (e.target === e.currentTarget) {
            onClose();
        }
    };


    const handleBackdropKey = (e) => {
        // Soporte teclado para el backdrop: Enter/Space cierran el dialog
        const key = e.key || e.code;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
            e.preventDefault();
            onClose();
        }
    };

    return (
        <div className="modal">
            <button
                type="button"
                className="modal-backdrop"
                onClick={handleBackdropClick}
                onKeyDown={handleBackdropKey}
                aria-label="Cerrar diálogo"
            ></button>
            <dialog 
                ref={dialogRef}
                className="modal-dialog"
                aria-labelledby="error-dialog-title"
                aria-modal="true"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 id="error-dialog-title" className="modal-title">
                            <FormattedMessage id="project.common.errorDialog.title" defaultMessage="Error" />
                        </h5>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary"
                                onClick={onClose}>
                            <FormattedMessage id="project.common.errorDialog.close" defaultMessage="Cerrar" />
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );

};

ErrorDialog.propTypes = {
    error: PropTypes.oneOfType([
        PropTypes.instanceOf(Error),
        PropTypes.instanceOf(NetworkError),
        PropTypes.object,
        PropTypes.string,
        PropTypes.any
    ]),
    onClose: PropTypes.func.isRequired
};

export default ErrorDialog;
