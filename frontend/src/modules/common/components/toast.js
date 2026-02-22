import { toast } from 'react-toastify';
import { initReactIntl } from '../../../i18n';

const { messages: i18nMessages } = initReactIntl();

const translateIfKey = (text) => {
    if (typeof text !== 'string') return text;
    // Si el backend nos manda una clave (p. ej. "project.exceptions.*"), traducimos con el diccionario del frontend
    if (i18nMessages?.[text]) {
        return i18nMessages[text];
    }
    return text;
};


const showErrorFromPayload = (payload) => {
    if (!payload) {
        toast.error('Ha ocurrido un error');
        return;
    }

    if (typeof payload === 'string') {
        toast.error(translateIfKey(payload));
        return;
    }

    if (payload.globalError) {
        toast.error(translateIfKey(payload.globalError));
        return;
    }

    if (payload.message) {
        toast.error(translateIfKey(payload.message));
        return;
    }

    if (payload.fieldErrors && Array.isArray(payload.fieldErrors)) {
        payload.fieldErrors.forEach(e => {
            const msg = translateIfKey(e.message);
            if (e.fieldError) {
                const fieldName = String(e.fieldError).charAt(0).toUpperCase() + String(e.fieldError).slice(1);
                toast.error(`${fieldName}: ${msg}`);
            } else {
                toast.error(msg);
            }
        });
        return;
    }

    toast.error(translateIfKey('project.common.errorDialog.networkError') || 'Ha ocurrido un error');
};

// Muestra automáticamente las respuestas del backend
export const handleResponse = (response, options = {}) => {
    const {
        successMessage = null,
        showErrorToast = true,
        showSuccessToast = Boolean(successMessage),
    } = options;

    if (response.ok) {
        if (showSuccessToast && successMessage) {
        const message = typeof successMessage === 'function' 
            ? successMessage(response.payload) 
            : successMessage;
        toast.success(message);
        }
    } else if (showErrorToast) {
        showErrorFromPayload(response.payload);
    }

    return response;
};


// Mostrar mensajes directamente
export const showSuccess = (message) => {
    toast.success(message);
};

export const showError = (errors) => {
    showErrorFromPayload(errors);
};

export const showInfo = (message) => {
    toast.info(message);
};

export const showWarning = (message) => {
    toast.warn(message);
};
