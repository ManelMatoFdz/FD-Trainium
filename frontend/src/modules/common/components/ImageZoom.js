import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import './imageZoom.css';
import React from 'react';

const ImageZoom = ({ src, onClose }) => {
    if (!src) return null;

    return ReactDOM.createPortal(
        <div className="image-zoom-overlay">
            <button
                type="button"
                className="image-zoom-backdrop"
                onClick={onClose}
                aria-label="Cerrar vista ampliada"
                style={{
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    background: 'transparent'
                }}
            ></button>
            <dialog
                className="image-zoom-content"
                aria-modal="true"
                open
            >
                <div>
                    <img src={src} alt="Vista ampliada" />
                    <button
                        type="button"
                        className="image-zoom-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>
            </dialog>
        </div>,
        document.body
    );
};

ImageZoom.propTypes = {
    src: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ImageZoom;
