import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import WrappedModal, { isWrappedVisible } from './WrappedModal';

const WrappedButton = ({ className, style }) => {
    const [showWrapped, setShowWrapped] = useState(false);

    if (!isWrappedVisible()) {
        return null;
    }

    return (
        <>
            <button
                className={`wrapped-button ${className || ''}`}
                style={style}
                onClick={() => setShowWrapped(true)}
                data-testid="wrapped-button"
            >
                <i className="fas fa-gift" />
                <FormattedMessage id="project.wrapped.button" defaultMessage="Tu Año Fitness" />
            </button>
            {showWrapped && (
                <WrappedModal
                    onClose={() => setShowWrapped(false)}
                />
            )}
        </>
    );
};

WrappedButton.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object
};

export { isWrappedVisible };
export default WrappedButton;
