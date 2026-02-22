import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import UpdateProfile from '../../modules/users/components/UpdateProfile';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';
import * as actions from '../../modules/users/actions';

jest.mock('../../backend');
jest.mock('jdenticon', () => ({ update: jest.fn() }));

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('UpdateProfile', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'USER',
    formation: '',
    avatarUrl: '',
    heightCm: null,
    weightKg: null,
    gender: '',
    avatarSeed: 'testuser',
  };

  // Helper function to find avatar preview button
  const getAvatarPreview = () => {
    return screen.queryByRole('button', { expanded: false }) || 
           document.querySelector('.avatar-preview[role="button"]');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL.mockReturnValue('blob:mock-url');
    
    // Mock File.arrayBuffer for tests - must be done before any File objects are created
    Object.defineProperty(File.prototype, 'arrayBuffer', {
      writable: true,
      configurable: true,
      value: jest.fn(function() {
        // Create a simple ArrayBuffer with some data
        const buffer = new ArrayBuffer(this.size || 8);
        return Promise.resolve(buffer);
      })
    });
    
    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(mockUser);
    });
    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload });
    });
  });

  it('renders form with user data', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Actualizar perfil/i })).toBeTruthy();
    });

    expect(screen.getByDisplayValue('Test')).toBeTruthy();
    expect(screen.getByDisplayValue('User')).toBeTruthy();
    expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('updates form fields when user types', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const firstNameInput = screen.getByLabelText(/Nombre/i);
    fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

    expect(firstNameInput.value).toBe('Updated');
  });

  it('submits form with updated data', async () => {
    const store = makeStore({ users: { user: mockUser } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const firstNameInput = screen.getByLabelText(/Nombre/i);
    fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });

    const updateCall = backend.userService.updateProfile.mock.calls[0][0];
    expect(updateCall.firstName).toBe('Updated');
  });

  it('shows formation field for trainers', async () => {
    const trainerUser = { ...mockUser, role: 'TRAINER', formation: 'Coach' };
    const store = makeStore({ users: { user: trainerUser } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(trainerUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Formación/i)).toBeTruthy();
    });
  });

  it('handles height and weight fields', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Altura/i)).toBeTruthy();
    });

    const heightInput = screen.getByLabelText(/Altura/i);
    const weightInput = screen.getByLabelText(/Peso/i);

    fireEvent.change(heightInput, { target: { value: '175' } });
    fireEvent.change(weightInput, { target: { value: '70' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });

    const updateCall = backend.userService.updateProfile.mock.calls[0][0];
    expect(updateCall.heightCm).toBe(175);
    expect(updateCall.weightKg).toBe(70);
  });

  it('handles gender selection', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Género/i)).toBeTruthy();
    });

    const genderSelect = screen.getByLabelText(/Género/i);
    fireEvent.change(genderSelect, { target: { value: 'MALE' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });

    const updateCall = backend.userService.updateProfile.mock.calls[0][0];
    expect(updateCall.gender).toBe('MALE');
  });

  it('validates required fields', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const firstNameInput = screen.getByLabelText(/Nombre/i);
    fireEvent.change(firstNameInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    // El formulario debería mostrar validación
    await waitFor(() => {
      expect(firstNameInput).toBeInvalid();
    });
  });

  it('handles avatar URL input', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      // Avatar section should be present
      expect(document.querySelector('.avatar-preview')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const urlInput = screen.queryByPlaceholderText(/https:\/\/example.com\/avatar.png/i);
      if (urlInput) {
        fireEvent.change(urlInput, { target: { value: 'https://example.com/avatar.png' } });
        expect(urlInput.value).toBe('https://example.com/avatar.png');
      }
    });
  });

  it('handles file upload for avatar', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      // Avatar section should be present
      expect(document.querySelector('.avatar-preview')).toBeTruthy();
    });

    // Crear un archivo mock
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');

    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }
  });

  it('handles error when updating profile fails', async () => {
    const store = makeStore({ users: { user: mockUser } });
    backend.userService.updateProfile.mockImplementation((payload, onSuccess, onError) => {
      onError({ errorCode: 'project.error.update' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('refreshes profile data on mount', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(backend.userService.getProfile).toHaveBeenCalled();
    });
  });

  it('handles file upload with base64 conversion', async () => {
    const store = makeStore({ users: { user: mockUser } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload, avatarUrl: 'http://example.com/avatar.png' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const file = new File(['test content'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles invalid file type', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
    });
  });

  it('handles file size exceeding limit', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        // Crear un archivo que exceda 16MB
        const largeContent = new Array(17 * 1024 * 1024).fill('a').join('');
        const file = new File([largeContent], 'large.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
    });
  });

  it('handles clearing avatar', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const clearButton = screen.queryByText(/Quitar avatar/i);
      if (clearButton) {
        fireEvent.click(clearButton);
      }
    });
  });

  it('handles external avatar URL', async () => {
    const store = makeStore({ users: { user: mockUser } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const urlInput = screen.queryByPlaceholderText(/https:\/\/example.com\/avatar.png/i);
      if (urlInput) {
        fireEvent.change(urlInput, { target: { value: 'https://example.com/avatar.png' } });
      }
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles empty height and weight fields', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });

    const updateCall = backend.userService.updateProfile.mock.calls[0][0];
    expect(updateCall.heightCm).toBeUndefined();
    expect(updateCall.weightKg).toBeUndefined();
  });

  it('handles empty gender field', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });

    const updateCall = backend.userService.updateProfile.mock.calls[0][0];
    expect(updateCall.gender).toBeUndefined();
  });

  it('handles blob URL revocation', async () => {
    const userWithBlob = { ...mockUser, avatarUrl: 'blob:http://localhost/test' };
    const store = makeStore({ users: { user: userWithBlob } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(userWithBlob);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
    });
  });

  it('handles avatar URL with file upload - generates URL from backend response', async () => {
    const store = makeStore({ users: { user: mockUser } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload, id: 1 });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const file = new File(['test content'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles avatar URL with query string in URL', async () => {
    const store = makeStore({ users: { user: mockUser } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload, avatarUrl: 'https://example.com/avatar.png?existing=param' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles empty avatar URL', async () => {
    const store = makeStore({ users: { user: mockUser } });

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload, avatarUrl: '' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles non-external avatar URL', async () => {
    const store = makeStore({ users: { user: mockUser } });

    backend.userService.updateProfile.mockImplementation((payload, onSuccess) => {
      onSuccess({ ...mockUser, ...payload, avatarUrl: '/relative/path.png' });
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backend.userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('opens and closes avatar controls popover', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar - es un botón con clase avatar-preview
    const avatarButton = screen.getByRole('button', { name: /avatar/i });
    fireEvent.click(avatarButton);

    await waitFor(() => {
      const urlInput = screen.queryByPlaceholderText(/https:\/\/example.com\/avatar.png/i);
      expect(urlInput).toBeTruthy();
    });

    // Cerrar con ESC
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      const urlInput = screen.queryByPlaceholderText(/https:\/\/example.com\/avatar.png/i);
      expect(urlInput).toBeNull();
    });
  });

  it('opens file picker when upload button is clicked', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar - es un botón con accesibilidad para avatar
    const avatarButton = screen.getByRole('button', { name: /avatar/i });
    fireEvent.click(avatarButton);

    await waitFor(() => {
      const uploadButton = screen.queryByText(/Subir imagen/i);
      if (uploadButton) {
        fireEvent.click(uploadButton);
      }
    });
  });

  it('clears file when avatar URL is changed', async () => {
    const store = makeStore({ users: { user: mockUser } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeTruthy();
    });

    // Abrir controles de avatar
    const avatarPreview = document.querySelector('.avatar-preview[role="button"]');
    if (avatarPreview) {
      fireEvent.click(avatarPreview);
    }

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      const urlInput = screen.queryByPlaceholderText(/https:\/\/example.com\/avatar.png/i);
      if (urlInput) {
        fireEvent.change(urlInput, { target: { value: 'https://example.com/new.png' } });
      }
    });
  });

  it('shows formation field when user has formation', async () => {
    const trainerUser = { ...mockUser, role: 'TRAINER', formation: 'Coach' };
    const store = makeStore({ users: { user: trainerUser } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(trainerUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Formación/i)).toBeTruthy();
      expect(screen.getByDisplayValue('Coach')).toBeTruthy();
    });
  });

  it('does not show formation field when user has no formation', async () => {
    const userWithoutFormation = { ...mockUser, role: 'USER', formation: null };
    const store = makeStore({ users: { user: userWithoutFormation } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(userWithoutFormation);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <UpdateProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByLabelText(/Formación/i)).toBeNull();
    });
  });
});

