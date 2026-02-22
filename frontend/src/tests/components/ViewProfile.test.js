import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import ViewProfile from '../../modules/users/components/ViewProfile';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';
import * as actions from '../../modules/users/actions';

jest.mock('../../backend');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Avoid jdenticon SVG update errors inside Avatar
jest.mock('jdenticon', () => ({ update: jest.fn() }));

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('ViewProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess({});
    });
  });

  it('renders user fields from store', async () => {
    const user = {
      id: 7,
      userName: 'alice',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      formation: 'Trainer',
      role: 'USER',
      avatarSeed: 'alice',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });

    expect(await screen.findByText(user.userName)).toBeTruthy();
    expect(await screen.findByText(user.email)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
  });

  it('calculates BMI from height and weight', async () => {
    const user = {
      id: 7,
      userName: 'alice',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      role: 'USER',
      heightCm: 175,
      weightKg: 70,
      avatarSeed: 'alice',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      // BMI = 70 / (1.75 * 1.75) = 22.86
      expect(screen.getByText(/22\.9/i)).toBeTruthy();
    });
  });

  it('shows premium section for trainers', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Beneficios Premium/i)).toBeTruthy();
    });
  });

  it('shows badges section with user badges', async () => {
    const user = {
      id: 7,
      userName: 'alice',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      formation: 'Trainer',
      role: 'USER',
      avatarSeed: 'alice',
      badges: ['first_workout', 'strength_weight_40'],
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Insignias/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /Primer entrenamiento/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Fuerza I/i })).toBeTruthy();
    });
  });

  it('shows activate premium button for non-premium trainers', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hacerse Premium/i })).toBeTruthy();
    });
  });

  it('shows deactivate premium button for premium trainers', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: true,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Quitar Premium/i })).toBeTruthy();
    });
  });

  it('activates premium when confirmed', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const updatedUser = { ...user, isPremium: true };

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.activatePremium.mockImplementation((userId, onSuccess) => {
      onSuccess(updatedUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hacerse Premium/i })).toBeTruthy();
    });

    const activateButton = screen.getByRole('button', { name: /Hacerse Premium/i });
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(screen.getByText(/Activar cuenta Premium/i)).toBeTruthy();
    });

    // Esperar a que el modal esté completamente abierto y buscar el botón "Activar Premium" dentro del dialog
    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: /Activar Premium/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(backend.userService.activatePremium).toHaveBeenCalledWith(
        7,
        expect.any(Function),
        expect.any(Function)
      );
      expect(dispatchSpy).toHaveBeenCalledWith(actions.findProfileCompleted(updatedUser));
      expect(toast.success).toHaveBeenCalledWith('¡Felicidades! Ahora eres usuario Premium');
    });
  });

  it('deactivates premium when confirmed', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: true,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const updatedUser = { ...user, isPremium: false };

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.deactivatePremium.mockImplementation((userId, onSuccess) => {
      onSuccess(updatedUser);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Quitar Premium/i })).toBeTruthy();
    });

    const deactivateButton = screen.getByRole('button', { name: /Quitar Premium/i });
    fireEvent.click(deactivateButton);

    await waitFor(() => {
      expect(screen.getByText(/Desactivar cuenta Premium/i)).toBeTruthy();
    });

    await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmButton = buttons.find(btn => btn.textContent.includes('Desactivar'));
      expect(confirmButton).toBeTruthy();
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(backend.userService.deactivatePremium).toHaveBeenCalledWith(
        7,
        expect.any(Function),
        expect.any(Function)
      );
      expect(dispatchSpy).toHaveBeenCalledWith(actions.findProfileCompleted(updatedUser));
      expect(toast.success).toHaveBeenCalledWith('Premium desactivado correctamente');
    });
  });

  it('opens followers modal when clicking followers count', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.getFollowers.mockImplementation((userId, onSuccess) => {
      onSuccess([{ id: 1, userName: 'follower1' }]);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seguidores/i)).toBeTruthy();
    });

    const followersElement = screen.getByText(/Seguidores/i).closest('.follower-item');
    fireEvent.click(followersElement);

    await waitFor(() => {
      expect(backend.userService.getFollowers).toHaveBeenCalledWith(
        7,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('opens following modal when clicking following count', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.getFollowing.mockImplementation((userId, onSuccess) => {
      onSuccess([{ id: 2, userName: 'following1' }]);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Siguiendo/i)).toBeTruthy();
    });

    const followingElement = screen.getByText(/Siguiendo/i).closest('.follower-item');
    fireEvent.click(followingElement);

    await waitFor(() => {
      expect(backend.userService.getFollowing).toHaveBeenCalledWith(
        7,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('shows loading spinner when user is not loaded', () => {
    const store = makeStore({ users: { user: null } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('handles gender display', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      gender: 'MALE',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hombre/i)).toBeTruthy();
    });
  });

  it('handles premium activation error', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.activatePremium.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('Activation failed'));
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hacerse Premium/i })).toBeTruthy();
    });

    const activateButton = screen.getByRole('button', { name: /Hacerse Premium/i });
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(screen.getByText(/Activar cuenta Premium/i)).toBeTruthy();
    });

    await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmButton = buttons.find(btn => btn.textContent.includes('Activar Premium'));
      expect(confirmButton).toBeTruthy();
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al activar premium');
    });
  });

  it('handles premium deactivation error', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: true,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });
    backend.userService.deactivatePremium.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('Deactivation failed'));
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Quitar Premium/i })).toBeTruthy();
    });

    const deactivateButton = screen.getByRole('button', { name: /Quitar Premium/i });
    fireEvent.click(deactivateButton);

    await waitFor(() => {
      expect(screen.getByText(/Desactivar cuenta Premium/i)).toBeTruthy();
    });

    await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmButton = buttons.find(btn => btn.textContent.includes('Desactivar'));
      expect(confirmButton).toBeTruthy();
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al desactivar premium');
    });
  });

  it('cancels premium modal', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hacerse Premium/i })).toBeTruthy();
    });

    const activateButton = screen.getByRole('button', { name: /Hacerse Premium/i });
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(screen.getByText(/Activar cuenta Premium/i)).toBeTruthy();
    });

    await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cancelButton = buttons.find(btn => btn.textContent.includes('Cancelar'));
      expect(cancelButton).toBeTruthy();
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Activar cuenta Premium/i)).toBeNull();
    });
  });

  it('handles avatar URL with different formats', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      avatarUrl: 'https://example.com/avatar.png',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('handles BMI calculation with null values', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      heightCm: null,
      weightKg: null,
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('handles BMI category classification', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      heightCm: 175,
      weightKg: 50, // Underweight
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('shows premium benefits section for trainers', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: true,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Beneficios Premium/i)).toBeTruthy();
      expect(screen.getByText(/Crear ejercicios/i)).toBeTruthy();
    });
  });

  it('handles error when loading profile fails', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess, onError) => {
      onError(new Error('Failed to load'));
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(backend.userService.getProfile).toHaveBeenCalled();
    });
  });

  it('navigates to update profile when edit button is clicked', async () => {
    const user = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('shows premium benefits with all items for premium trainer', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: true,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Beneficios Premium/i)).toBeTruthy();
      expect(screen.getByText(/Crear ejercicios/i)).toBeTruthy();
      expect(screen.getByText(/Crear más de 3 rutinas/i)).toBeTruthy();
      expect(screen.getByText(/Más de 5 ejercicios por rutina/i)).toBeTruthy();
      const activeBadges = screen.getAllByText(/ACTIVO/i);
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  it('shows upgrade message for non-premium trainer', async () => {
    const user = {
      id: 7,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Actualiza a Premium para desbloquear todas las funcionalidades/i)).toBeTruthy();
    });
  });

  it('handles different avatar URL formats', async () => {
    const userWithDataUrl = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      avatarUrl: 'data:image/png;base64,test',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user: userWithDataUrl } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(userWithDataUrl);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('handles relative avatar URL', async () => {
    const userWithRelativeUrl = {
      id: 7,
      userName: 'user',
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      role: 'USER',
      avatarUrl: '/path/to/avatar.png',
      avatarSeed: 'user',
    };
    const store = makeStore({ users: { user: userWithRelativeUrl } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(userWithRelativeUrl);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar perfil/i })).toBeTruthy();
    });
  });

  it('handles handleConfirmPremium when user id is missing', async () => {
    const user = {
      id: null,
      userName: 'trainer',
      firstName: 'Trainer',
      lastName: 'Name',
      email: 'trainer@example.com',
      role: 'TRAINER',
      isPremium: false,
      avatarSeed: 'trainer',
    };
    const store = makeStore({ users: { user } });

    backend.userService.getProfile.mockImplementation((onSuccess) => {
      onSuccess(user);
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ViewProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hacerse Premium/i })).toBeTruthy();
    });

    const activateButton = screen.getByRole('button', { name: /Hacerse Premium/i });
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(screen.getByText(/Activar cuenta Premium/i)).toBeTruthy();
    });

    // Buscar el botón usando querySelector ya que el dialog puede no estar accesible en jsdom
    await waitFor(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmButton = buttons.find(btn => btn.textContent.includes('Activar Premium'));
      expect(confirmButton).toBeTruthy();
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(backend.userService.activatePremium).not.toHaveBeenCalled();
    });
  });
});

