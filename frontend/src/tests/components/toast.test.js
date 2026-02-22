import { toast } from 'react-toastify';
import {
  handleResponse,
  showSuccess,
  showError,
  showInfo,
  showWarning,
} from '../../modules/common/components/toast';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock i18n to provide simple translations for keys
jest.mock('../../i18n', () => ({
  initReactIntl: () => ({
    messages: {
      'project.common.errorDialog.networkError': 'Error de red',
      'project.exceptions.SomeError': 'Mensaje traducido',
    },
  }),
}));

describe('toast helpers', () => {
  it('handleResponse shows success toast when ok and successMessage provided', () => {
    const response = { ok: true, payload: { id: 1 } };
    const result = handleResponse(response, {
      successMessage: 'Operación correcta',
    });
    expect(result).toBe(response);
    expect(toast.success).toHaveBeenCalledWith('Operación correcta');
  });

  it('handleResponse supports successMessage as function', () => {
    const response = { ok: true, payload: { name: 'X' } };
    handleResponse(response, {
      successMessage: (p) => `ok:${p.name}`,
    });
    expect(toast.success).toHaveBeenCalledWith('ok:X');
  });

  it('handleResponse shows translated error when payload is key string', () => {
    const response = { ok: false, payload: 'project.exceptions.SomeError' };
    handleResponse(response, { showSuccessToast: false });
    expect(toast.error).toHaveBeenCalledWith('Mensaje traducido');
  });

  it('showError delegates to showErrorFromPayload for strings and globalError', () => {
    showError('project.exceptions.SomeError');
    expect(toast.error).toHaveBeenCalledWith('Mensaje traducido');
    jest.clearAllMocks();

    showError({ globalError: 'project.exceptions.SomeError' });
    expect(toast.error).toHaveBeenCalledWith('Mensaje traducido');
  });

  it('showError handles payload.message and fieldErrors formatting', () => {
    showError({ message: 'project.exceptions.SomeError' });
    expect(toast.error).toHaveBeenCalledWith('Mensaje traducido');
    jest.clearAllMocks();

    showError({
      fieldErrors: [
        { fieldError: 'email', message: 'project.exceptions.SomeError' },
        { message: 'project.exceptions.SomeError' },
      ],
    });
    expect(toast.error).toHaveBeenCalledWith('Email: Mensaje traducido');
    expect(toast.error).toHaveBeenCalledWith('Mensaje traducido');
  });

  it('showError shows generic error for null payload', () => {
    showError(null);
    expect(toast.error).toHaveBeenCalled();
  });

  it('showSuccess/showInfo/showWarning call corresponding toast methods', () => {
    showSuccess('ok');
    showInfo('info');
    showWarning('warn');
    expect(toast.success).toHaveBeenCalledWith('ok');
    expect(toast.info).toHaveBeenCalledWith('info');
    expect(toast.warn).toHaveBeenCalledWith('warn');
  });
});

