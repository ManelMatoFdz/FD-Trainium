import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import PublicProfile from '../../modules/users/components/PublicProfile';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

// Avoid jdenticon side effects in Avatar
jest.mock('jdenticon', () => ({ update: jest.fn() }));

// Stub FollowButton to avoid backend interactions
const mockOnFollowChange = jest.fn();
jest.mock('../../modules/users/components/FollowButton', () => {
  return function MockFollowButton({ onFollowChange }) {
    return (
      <div data-testid="follow-button" onClick={() => onFollowChange && onFollowChange(true)}>FollowButton</div>
    );
  };
});

const mockFindUserById = jest.fn();
const mockFindByUserId = jest.fn();
const mockGetFollowers = jest.fn();
const mockGetFollowing = jest.fn();
const mockBlockUser = jest.fn();
const mockUnblockUser = jest.fn();
const mockIsBlockedUser = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    userService: {
      findUserById: (...args) => mockFindUserById(...args),
      getFollowers: (...args) => mockGetFollowers(...args),
      getFollowing: (...args) => mockGetFollowing(...args),
      blockUser: (...args) => mockBlockUser(...args),
      unblockUser: (...args) => mockUnblockUser(...args),
      isBlockedUser: (...args) => mockIsBlockedUser(...args),
    },
    routineExecutionService: {
      findByUserId: (...args) => mockFindByUserId(...args),
    },
  },
}));

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('PublicProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnFollowChange.mockClear();
    mockBlockUser.mockClear();
    mockUnblockUser.mockClear();
    mockIsBlockedUser.mockClear();
  });

  it('muestra los datos de perfil y rutinas del usuario', async () => {
    const fakeUser = {
      id: 123,
      userName: 'trainerpro',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      role: 'TRAINER',
      formation: 'Coach',
      avatarSeed: 'trainerpro',
      followersCount: 5,
      followingCount: 2,
    };
    const execs = [
      { id: 10, routineName: 'Fuerza Pecho', performedAt: new Date().toISOString(), totalDurationSec: 1800, exercises: [1,2,3] },
      { id: 11, routineName: 'Piernas Básico', performedAt: new Date().toISOString(), totalDurationSec: 900, exercises: [1] },
    ];

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });

    const store = makeStore({ users: { user: { id: 999, userName: 'me', role: 'USER' }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={[`/users/${fakeUser.id}`]}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Nombre de usuario como título
    expect(await screen.findByRole('heading', { name: /trainerpro/i })).toBeTruthy();
    // Datos básicos de perfil
    expect(screen.getByText(/alice@example.com/i)).toBeTruthy();
    expect(screen.getAllByText(/TRAINER/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Coach/i).length).toBeGreaterThan(0);

    // Bloque de rutinas realizadas con elementos
    expect(screen.getByText(/Rutinas realizadas/i)).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Fuerza Pecho/i })).toBeTruthy();
      expect(screen.getByText(/Piernas/i)).toBeTruthy();
    });
  });

  it('shows loading spinner while loading user data', () => {
    mockFindUserById.mockImplementation(() => {}); // No llama a callback
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: null, loggedIn: false } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('shows error message when user not found', async () => {
    mockFindUserById.mockImplementation((userId, onSuccess, onError) => {
      onError(new Error('User not found'));
    });
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: null, loggedIn: false } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el perfil/i)).toBeTruthy();
    });
  });

  it('shows premium badge for premium users', async () => {
    const premiumUser = {
      id: 123,
      userName: 'premiumuser',
      firstName: 'Premium',
      lastName: 'User',
      email: 'premium@example.com',
      role: 'TRAINER',
      premium: true,
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(premiumUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      const badges = screen.getAllByText(/ACTIVO/i);
      // Debe haber al menos un badge con "ACTIVO" (puede haber uno en el header y otro en los campos)
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('muestra insignias cuando el usuario las tiene', async () => {
    const fakeUser = {
      id: 123,
      userName: 'badgeUser',
      firstName: 'Badge',
      lastName: 'User',
      email: 'badge@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
      badges: ['first_workout', 'consistency_streak_3'],
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Insignias/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /Primer entrenamiento/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Consistencia I/i })).toBeTruthy();
    });
  });

  it('shows empty state when user has no routines', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Este usuario aún no tiene rutinas registradas/i)).toBeTruthy();
    });
  });

  it('opens followers modal when clicking followers count', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowers.mockImplementation((userId, onSuccess) => {
      onSuccess([{ id: 1, userName: 'follower1' }]);
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seguidores/i)).toBeTruthy();
    });

    const followersButton = screen.getByRole('button', { name: /Ver seguidores/i });
    fireEvent.click(followersButton);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalledWith(123, expect.any(Function), expect.any(Function));
    });
  });

  it('opens following modal when clicking following count', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowing.mockImplementation((userId, onSuccess) => {
      onSuccess([{ id: 2, userName: 'following1' }]);
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Siguiendo/i)).toBeTruthy();
    });

    const followingButton = screen.getByRole('button', { name: /Ver seguidos/i });
    fireEvent.click(followingButton);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalledWith(123, expect.any(Function), expect.any(Function));
    });
  });

  it('shows login button when user is not logged in', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: null, loggedIn: false } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      const loginButton = screen.getByRole('button', { name: /Regístrate/i });
      expect(loginButton).toBeTruthy();
    });
  });

  it('handles pagination for routines', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    // Crear más de 4 ejecuciones para probar paginación
    const execs = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      routineName: `Rutina ${i + 1}`,
      performedAt: new Date(Date.now() - i * 86400000).toISOString(),
      totalDurationSec: 1800,
      exercises: [1, 2, 3],
    }));

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina 1/i)).toBeTruthy();
    });

    // Verificar que se muestra el texto de paginación
    expect(screen.getByText(/Mostrando/i)).toBeTruthy();
  });

  it('handles avatar URL with different formats', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      avatarUrl: 'https://example.com/avatar.png',
      avatarSeed: 'user',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user/i })).toBeTruthy();
    });
  });

  it('handles followers list error', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowers.mockImplementation((userId, onSuccess, onError) => {
      onError();
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seguidores/i)).toBeTruthy();
    });

    const followersButton = screen.getByRole('button', { name: /Ver seguidores/i });
    fireEvent.click(followersButton);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalled();
    });
  });

  it('handles following list error', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowing.mockImplementation((userId, onSuccess, onError) => {
      onError();
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Siguiendo/i)).toBeTruthy();
    });

    const followingButton = screen.getByRole('button', { name: /Ver seguidos/i });
    fireEvent.click(followingButton);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalled();
    });
  });

  it('handles routines with no performedAt date', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    const execs = [
      { id: 1, routineName: 'Rutina sin fecha', totalDurationSec: 1800, exercises: [1, 2] },
    ];

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina sin fecha/i)).toBeTruthy();
    });
  });

  it('handles routines with likes count', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    const execs = [
      {
        id: 1,
        routineName: 'Rutina con likes',
        performedAt: new Date().toISOString(),
        totalDurationSec: 1800,
        exercises: [1, 2],
        likesCount: 5,
      },
    ];

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina con likes/i)).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  it('handles loadList when user id is missing', async () => {
    const fakeUser = {
      id: null,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seguidores/i)).toBeTruthy();
    });

    const followersButton = screen.getByRole('button', { name: /Ver seguidores/i });
    fireEvent.click(followersButton);

    // No debería llamar a getFollowers si no hay user.id
    await waitFor(() => {
      expect(mockGetFollowers).not.toHaveBeenCalled();
    });
  });

  it('handles different avatar URL formats', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      avatarUrl: 'data:image/png;base64,test',
      avatarSeed: 'user',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user/i })).toBeTruthy();
    });
  });

  it('handles blob avatar URL', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      avatarUrl: 'blob:http://localhost/test',
      avatarSeed: 'user',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user/i })).toBeTruthy();
    });
  });

  it('handles relative path avatar URL', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      avatarUrl: '/path/to/avatar.png',
      avatarSeed: 'user',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user/i })).toBeTruthy();
    });
  });

  it('handles followers list with items array in payload', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowers.mockImplementation((userId, onSuccess) => {
      onSuccess({ items: [{ id: 1, userName: 'follower1' }] });
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seguidores/i)).toBeTruthy();
    });

    const followersButton = screen.getByRole('button', { name: /Ver seguidores/i });
    fireEvent.click(followersButton);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalled();
    });
  });

  it('handles following list with items array in payload', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockGetFollowing.mockImplementation((userId, onSuccess) => {
      onSuccess({ items: [{ id: 2, userName: 'following1' }] });
    });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Siguiendo/i)).toBeTruthy();
    });

    const followingButton = screen.getByRole('button', { name: /Ver seguidos/i });
    fireEvent.click(followingButton);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalled();
    });
  });

  it('handles FollowButton onFollowChange callback', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 5,
      followingCount: 2,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({ users: { user: { id: 999, userName: 'currentuser' }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeTruthy();
    });

    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(screen.getByText('6')).toBeTruthy(); // followersCount should increase
    });
  });

  it('handles routines execution with all fields', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    const execs = [
      {
        id: 1,
        routineName: 'Rutina completa',
        performedAt: new Date().toISOString(),
        totalDurationSec: 3600,
        exercises: [1, 2, 3, 4, 5],
        likesCount: 10,
      },
    ];

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });

    const store = makeStore({ users: { user: { id: 999 }, loggedIn: true } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/users/123']}>
            <PublicProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rutina completa/i)).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
    });
  });

  it('shows block button when current user is logged in and viewing another user', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockIsBlockedUser.mockImplementation((userId, onSuccess) => onSuccess({ blockedByMe: false, blockedMe: false }));

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bloquear/i)).toBeTruthy();
    });
  });

  it('does not show block button for ADMIN users', async () => {
    const fakeUser = {
      id: 123,
      userName: 'adminuser',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Bloquear/i)).toBeFalsy();
    });
  });

  it('shows blocked alert when user is blocked by current user', async () => {
    const fakeUser = {
      id: 123,
      userName: 'blockeduser',
      firstName: 'Blocked',
      lastName: 'User',
      email: 'blocked@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockIsBlockedUser.mockImplementation((userId, onSuccess) => onSuccess({ blockedByMe: true, blockedMe: false }));

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Has bloqueado a este usuario/i)).toBeTruthy();
    });
  });

  it('shows blocked alert when current user is blocked by the user', async () => {
    const fakeUser = {
      id: 123,
      userName: 'blockinguser',
      firstName: 'Blocking',
      lastName: 'User',
      email: 'blocking@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockIsBlockedUser.mockImplementation((userId, onSuccess) => onSuccess({ blockedByMe: false, blockedMe: true }));

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Te ha bloqueado este usuario/i)).toBeTruthy();
    });
  });

  it('hides profile fields and workouts when user is blocked', async () => {
    const fakeUser = {
      id: 123,
      userName: 'blockeduser',
      firstName: 'Blocked',
      lastName: 'User',
      email: 'blocked@example.com',
      role: 'USER',
      formation: 'Test Formation',
      followersCount: 5,
      followingCount: 2,
    };

    const execs = [
      { id: 10, routineName: 'Fuerza Pecho', performedAt: new Date().toISOString(), totalDurationSec: 1800, exercises: [1,2,3] },
    ];

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: execs });
    mockIsBlockedUser.mockImplementation((userId, onSuccess) => onSuccess({ blockedByMe: true, blockedMe: false }));

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      // Debería mostrar la alerta de bloqueo
      expect(screen.getByText(/Has bloqueado a este usuario/i)).toBeTruthy();
      // No debería mostrar la formación (campo del perfil)
      expect(screen.queryByText(/Test Formation/i)).toBeFalsy();
      // No debería mostrar las rutinas realizadas
      expect(screen.queryByText(/Fuerza Pecho/i)).toBeFalsy();
    });
  });

  it('handles block/unblock toggle', async () => {
    const fakeUser = {
      id: 123,
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      followersCount: 0,
      followingCount: 0,
    };

    mockFindUserById.mockImplementation((userId, onSuccess) => onSuccess(fakeUser));
    mockFindByUserId.mockResolvedValue({ ok: true, payload: [] });
    mockIsBlockedUser.mockImplementation((userId, onSuccess) => onSuccess({ blockedByMe: false, blockedMe: false }));
    mockBlockUser.mockImplementation((userId, onSuccess) => onSuccess());

    const store = makeStore({
      users: {
        user: { id: 999, userName: 'currentuser', role: 'USER' },
        loggedIn: true
      }
    });

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={['/users/123']}>
              <PublicProfile />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bloquear/i)).toBeTruthy();
    });

    const blockButton = screen.getByText(/Bloquear/i);
    fireEvent.click(blockButton);

    await waitFor(() => {
      expect(mockBlockUser).toHaveBeenCalledWith(123, expect.any(Function), expect.any(Function));
    });
  });

});
