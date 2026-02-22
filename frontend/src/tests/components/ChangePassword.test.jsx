import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';

import ChangePassword from '../../modules/users/components/ChangePassword';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';

jest.mock('../../backend');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('ChangePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders title and submit button', () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    expect(screen.getByRole('heading', { name: /Cambiar contraseña/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeTruthy();
  });

  it('renders all password input fields', () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    expect(screen.getByLabelText(/Contraseña actual/i)).toBeTruthy();
    expect(document.getElementById('newPassword')).toBeTruthy();
    expect(screen.getByLabelText(/Confirmar nueva contraseña/i)).toBeTruthy();
  });

  it('validates required fields', async () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const oldPasswordInput = screen.getByLabelText(/Contraseña actual/i);
      expect(oldPasswordInput).toBeInvalid();
    });
  });

  it('shows error when passwords do not match', async () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const oldPasswordInput = screen.getByLabelText(/Contraseña actual/i);
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = screen.getByLabelText(/Confirmar nueva contraseña/i);

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // El mensaje está en el div invalid-feedback, que solo se muestra cuando el input es inválido
      const confirmInput = screen.getByLabelText(/Confirmar nueva contraseña/i);
      expect(confirmInput).toBeInvalid();
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeTruthy();
    });
  });

  it('successfully changes password when all fields are valid', async () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    backend.userService.changePassword.mockImplementation((userId, oldPass, newPass, onSuccess) => {
      onSuccess();
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const oldPasswordInput = screen.getByLabelText(/Contraseña actual/i);
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = screen.getByLabelText(/Confirmar nueva contraseña/i);

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.changePassword).toHaveBeenCalledWith(
        1,
        'oldpass123',
        'newpass123',
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles error when password change fails', async () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    const mockShowError = jest.fn();
    backend.userService.changePassword.mockImplementation((userId, oldPass, newPass, onSuccess, onError) => {
      onError({ errorCode: 'project.error.password' });
    });

    // Mock showError
    jest.mock('../../modules/common', () => ({
      showError: mockShowError,
      showSuccess: jest.fn(),
    }));

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const oldPasswordInput = screen.getByLabelText(/Contraseña actual/i);
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = screen.getByLabelText(/Confirmar nueva contraseña/i);

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.changePassword).toHaveBeenCalled();
    });
  });

  it('clears password mismatch error when user types in confirm password', async () => {
    const store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Llenar todos los campos requeridos
    const oldPasswordInput = screen.getByLabelText(/Contraseña actual/i);
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = screen.getByLabelText(/Confirmar nueva contraseña/i);

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // El mensaje de error solo se muestra cuando el input es inválido
      // y el formulario tiene la clase was-validated
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeTruthy();
    });

    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    await waitFor(() => {
      // Cuando las contraseñas coinciden, el error se limpia
      expect(screen.queryByText(/Las contraseñas no coinciden/i)).toBeNull();
    });
  });
});

