import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';

import SignUp from '../../modules/users/components/SignUp';
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

describe('SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders title and submit button', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    expect(screen.getByRole('heading', { name: /Registro/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Crear cuenta/i })).toBeTruthy();
  });

  it('renders all form fields', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeTruthy();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeTruthy();
    // "Nombre" puede aparecer en "Nombre de usuario" también, usar getAllByLabelText
    const nombreInputs = screen.getAllByLabelText(/^Nombre$/i);
    expect(nombreInputs.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Apellidos/i)).toBeTruthy();
    // "Contraseña" puede aparecer en "Confirmar contraseña" también
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    expect(passwordInputs.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeTruthy();
  });

  it('shows role toggle buttons', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    expect(screen.getByRole('button', { name: /Usuario/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Entrenador/i })).toBeTruthy();
  });

  it('switches between User and Trainer roles', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    const trainerButton = screen.getByRole('button', { name: /Entrenador/i });
    fireEvent.click(trainerButton);

    expect(screen.getByLabelText(/Experiencia/i)).toBeTruthy();
  });

  it('shows formation field when Trainer role is selected', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
    
    const trainerButton = screen.getByRole('button', { name: /Entrenador/i });
    fireEvent.click(trainerButton);

    expect(screen.getByLabelText(/Experiencia/i)).toBeTruthy();
  });

  it('validates required fields', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
      expect(usernameInput).toBeInvalid();
    });
  });

  it('shows error when passwords do not match', async () => {
    const store = makeStore();
    
    // Mock para evitar que falle si intenta hacer submit
    backend.userService.signUp.mockImplementation(() => {});
    
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Llenar todos los campos requeridos
    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    // El mensaje de error solo se muestra cuando el formulario se valida
    // y las contraseñas no coinciden
    await waitFor(() => {
      // Verificar que el formulario tiene la clase was-validated
      const form = document.querySelector('form');
      expect(form).toHaveClass('was-validated');
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('submits form with valid User data', async () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const mockUser = { id: 1, userName: 'testuser', role: 'USER' };
    const mockAuthenticatedUser = { user: mockUser };

    backend.userService.signUp.mockImplementation((user, onReauth, onSuccess) => {
      onSuccess(mockAuthenticatedUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.signUp).toHaveBeenCalled();
    });

    const signUpCall = backend.userService.signUp.mock.calls[0][0];
    expect(signUpCall.userName).toBe('testuser');
    expect(signUpCall.role).toBe('User');
    expect(signUpCall.formation).toBe('');

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(actions.signUpCompleted(mockAuthenticatedUser));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('submits form with valid Trainer data including formation', async () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const mockUser = { id: 1, userName: 'trainer', role: 'TRAINER' };
    const mockAuthenticatedUser = { user: mockUser };

    backend.userService.signUp.mockImplementation((user, onReauth, onSuccess) => {
      onSuccess(mockAuthenticatedUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Switch to Trainer role
    const trainerButton = screen.getByRole('button', { name: /Entrenador/i });
    fireEvent.click(trainerButton);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);
    const formationInput = screen.getByLabelText(/Experiencia/i);

    fireEvent.change(usernameInput, { target: { value: 'trainer' } });
    fireEvent.change(emailInput, { target: { value: 'trainer@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Trainer' } });
    fireEvent.change(lastNameInput, { target: { value: 'Name' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(formationInput, { target: { value: 'Certified Coach' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.signUp).toHaveBeenCalled();
    });

    const signUpCall = backend.userService.signUp.mock.calls[0][0];
    expect(signUpCall.role).toBe('Trainer');
    expect(signUpCall.formation).toBe('Certified Coach');
  });

  it('handles signup error', async () => {
    const store = makeStore();
    backend.userService.signUp.mockImplementation((user, onReauth, onSuccess, onError) => {
      onError({ errorCode: 'project.error.signup' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.signUp).toHaveBeenCalled();
    });
  });

  it('handles reauthentication callback', async () => {
    const store = makeStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    backend.userService.signUp.mockImplementation((user, onReauth) => {
      onReauth();
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(actions.logout());
      expect(mockNavigate).toHaveBeenCalledWith('/users/login');
    });
  });

  it('trims whitespace from input fields', async () => {
    const store = makeStore();
    backend.userService.signUp.mockImplementation((user, onReauth, onSuccess) => {
      onSuccess({ user: { id: 1, userName: 'testuser', role: 'USER' } });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: '  testuser  ' } });
    fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
    fireEvent.change(firstNameInput, { target: { value: '  Test  ' } });
    fireEvent.change(lastNameInput, { target: { value: '  User  ' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.signUp).toHaveBeenCalled();
    });

    const signUpCall = backend.userService.signUp.mock.calls[0][0];
    expect(signUpCall.userName).toBe('testuser');
    expect(signUpCall.email).toBe('test@example.com');
    expect(signUpCall.firstName).toBe('Test');
    expect(signUpCall.lastName).toBe('User');
  });

  it('clears password mismatch error when typing in confirm password', async () => {
    const store = makeStore();
    
    // Mock para evitar que falle si intenta hacer submit después de corregir
    backend.userService.signUp.mockImplementation(() => {});
    
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Primero llenar todos los campos requeridos
    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    // El mensaje de error solo se muestra cuando el formulario se valida
    // y las contraseñas no coinciden
    await waitFor(() => {
      // Verificar que el formulario tiene la clase was-validated
      const form = document.querySelector('form');
      expect(form).toHaveClass('was-validated');
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeTruthy();
    }, { timeout: 3000 });

    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    await waitFor(() => {
      expect(screen.queryByText(/Las contraseñas no coinciden/i)).toBeNull();
    });
  });

  it('does not submit form when validation fails', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.signUp).not.toHaveBeenCalled();
    });
  });

  it('updates all input fields when user types', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(firstNameInput.value).toBe('Test');
    expect(lastNameInput.value).toBe('User');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('updates formation field when Trainer role is selected', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const trainerButton = screen.getByRole('button', { name: /Entrenador/i });
    fireEvent.click(trainerButton);

    const formationInput = screen.getByLabelText(/Experiencia/i);
    fireEvent.change(formationInput, { target: { value: 'Certified Coach' } });

    expect(formationInput.value).toBe('Certified Coach');
  });

  it('shows password mismatch error message correctly', async () => {
    const store = makeStore();
    
    // Mock para evitar que falle si intenta hacer submit
    backend.userService.signUp.mockImplementation(() => {});
    
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Primero llenar todos los campos requeridos
    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const firstNameInputs = screen.getAllByLabelText(/^Nombre$/i);
    const firstNameInput = firstNameInputs[0];
    const lastNameInput = screen.getByLabelText(/Apellidos/i);
    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    // El mensaje de error solo se muestra cuando el formulario se valida
    // y las contraseñas no coinciden
    await waitFor(() => {
      // Verificar que el formulario tiene la clase was-validated
      const form = document.querySelector('form');
      expect(form).toHaveClass('was-validated');
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('shows required field error when confirm password is empty', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const passwordInputs = screen.getAllByLabelText(/^Contraseña$/i);
    const passwordInput = passwordInputs[0];
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);
      expect(confirmPasswordInput).toBeInvalid();
    });
  });
});

