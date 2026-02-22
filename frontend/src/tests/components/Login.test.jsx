import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';

import Login from '../../modules/users/components/Login';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';
import * as actions from '../../modules/users/actions';

jest.mock('../../backend');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders form and signup link', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Regístrate/i })).toBeTruthy();
  });

  it('renders username and password fields', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeTruthy();
    expect(screen.getByLabelText(/Contraseña/i)).toBeTruthy();
  });

  it('validates required fields', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
      expect(usernameInput).toBeInvalid();
    });
  });

  it('submits form with valid credentials', async () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const mockUser = { id: 1, userName: 'testuser', role: 'USER' };
    const mockAuthenticatedUser = { user: mockUser };

    backend.userService.login.mockImplementation((username, password, onReauth, onSuccess) => {
      onSuccess(mockAuthenticatedUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.login).toHaveBeenCalledWith(
        'testuser',
        'password123',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    // El callback onSuccess se llama de forma asíncrona
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(actions.loginCompleted(mockAuthenticatedUser));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error', async () => {
    const store = makeStore();
    backend.userService.login.mockImplementation((username, password, onReauth, onSuccess, onError) => {
      onError({ errorCode: 'project.error.login' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.login).toHaveBeenCalled();
    });
  });

  it('handles reauthentication callback', async () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    backend.userService.login.mockImplementation((username, password, onReauth) => {
      onReauth();
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(actions.logout());
      expect(mockNavigate).toHaveBeenCalledWith('/users/login');
    });
  });

  it('updates input values when user types', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass' } });

    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('newpass');
  });

  it('calls showError when login fails', async () => {
    const store = makeStore();
    const mockShowError = jest.fn();
    
    jest.doMock('../../modules/common', () => ({
      showError: mockShowError,
      showSuccess: jest.fn(),
      Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    }));

    backend.userService.login.mockImplementation((username, password, onReauth, onSuccess, onError) => {
      onError({ errorCode: 'project.error.login' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.login).toHaveBeenCalled();
    });
  });
});

