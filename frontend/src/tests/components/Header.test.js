import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import Header from '../../modules/app/components/Header';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

import backend from '../../backend';

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    userService: {
      searchUsers: jest.fn(),
    },
  },
}));

jest.mock('../../modules/users/components/Notifications', () => {
  const React = require('react');
  return function NotificationsMock() {
    return <div data-testid="notifications" />;
  };
});

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

// Avoid jdenticon errors in JSDOM/Node
jest.mock('jdenticon', () => ({ update: jest.fn() }));

describe('Header', () => {
  afterEach(() => cleanup());

  describe('when user is not logged in', () => {
    it('renders brand and login link when logged out', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Brand link labeled "Inicio"
      expect(screen.getByRole('link', { name: /Inicio/i })).toBeTruthy();
      // Login link visible for anonymous users (menuitem role)
      expect(screen.getByRole('menuitem', { name: /Iniciar/i })).toBeTruthy();
    });

    it('does not require signup link to be present (login shown)', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Current header shows login link for anonymous users; signup may be absent
      expect(screen.getByRole('menuitem', { name: /Iniciar/i })).toBeTruthy();
      expect(screen.queryByRole('menuitem', { name: /Registrarse/i })).toBeNull();
    });

    it('does not show main navigation links', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.queryByRole('menuitem', { name: /^Rutinas$/i })).toBeNull();
      expect(screen.queryByRole('menuitem', { name: /Ejercicios/i })).toBeNull();
    });

    it('matches snapshot (logged out)', () => {
      const store = makeStore();
      const tree = renderer
        .create(
          <Provider store={store}>
            <IntlProvider locale="es" messages={es}>
              <MemoryRouter>
                <Header />
              </MemoryRouter>
            </IntlProvider>
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('when user is logged in with USER role', () => {
    it('renders main nav for logged user (USER role)', () => {
      const preloadedState = {
        users: { user: { userName: 'Alice', role: 'USER' } },
      };
      const store = makeStore(preloadedState);
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Visible items for regular users
      expect(screen.getByRole('menuitem', { name: /^Rutinas$/i })).toBeTruthy();
      expect(screen.getByRole('menuitem', { name: /^Rutinas Guardadas$/i })).toBeTruthy();
      expect(screen.getByRole('menuitem', { name: /Ranking/i })).toBeTruthy();
      expect(screen.getByRole('menuitem', { name: /^Historial$/i })).toBeTruthy();
      // Login link should not be visible
      expect(screen.queryByRole('link', { name: /Iniciar sesión/i })).toBeNull();
      // Exercises link should not appear for USER (no canManage)
      expect(screen.queryByRole('menuitem', { name: /Ejercicios/i })).toBeNull();
    });

    it('shows statistics link for USER role', () => {
      const store = makeStore({ users: { user: { userName: 'Alice', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByRole('menuitem', { name: /Estadísticas/i })).toBeTruthy();
    });

    it('does not show signup/login links', () => {
      const store = makeStore({ users: { user: { userName: 'Alice', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.queryByRole('menuitem', { name: /Iniciar sesión/i })).toBeNull();
      expect(screen.queryByRole('menuitem', { name: /Registrarse/i })).toBeNull();
    });
  });

  describe('when user is logged in with TRAINER role', () => {
    it('shows exercises link for TRAINER role (canManage)', () => {
      const store = makeStore({ users: { user: { userName: 'Bob', role: 'TRAINER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByRole('menuitem', { name: /Ejercicios/i })).toBeTruthy();
    });

    it('shows my routines link for TRAINER role', () => {
      const store = makeStore({ users: { user: { userName: 'Bob', role: 'TRAINER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByRole('menuitem', { name: /Mis Rutinas/i })).toBeTruthy();
    });
  });

  describe('when user is logged in with ADMIN role', () => {
    it('shows exercises link for ADMIN role (canManage)', () => {
      const store = makeStore({ users: { user: { userName: 'Admin', role: 'ADMIN' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByRole('menuitem', { name: /Ejercicios/i })).toBeTruthy();
    });

    it('shows my routines link for ADMIN role', () => {
      const store = makeStore({ users: { user: { userName: 'Admin', role: 'ADMIN' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByRole('menuitem', { name: /Mis Rutinas/i })).toBeTruthy();
    });
  });

  describe('user menu interactions', () => {
    it('displays user avatar when logged in', () => {
      const store = makeStore({ users: { user: { userName: 'TestUser', role: 'USER' } } });
      const { container } = render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Header uses .user-avatar / .user-avatar-img for the avatar element
      const avatar = container.querySelector('.user-avatar') || container.querySelector('.user-avatar-img');
      expect(avatar).toBeTruthy();
    });

    it('renders user dropdown structure', () => {
      const store = makeStore({ users: { user: { userName: 'TestUser', role: 'USER' } } });
      const { container } = render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Get all user dropdowns (may have multiple due to responsive design)
      const dropdownEls = container.querySelectorAll('.user-dropdown');
      expect(dropdownEls.length).toBeGreaterThan(0);

      // Verify user-menu elements exist within the dropdown structure
      const userMenus = container.querySelectorAll('.user-menu');
      expect(userMenus.length).toBeGreaterThan(0);

      // User menu should have profile-related links
      expect(container.querySelector('.user-menu')).toBeTruthy();
    });

    it('searches users with debounce and shows results', async () => {
      jest.useFakeTimers();

      backend.userService.searchUsers.mockImplementation((term, _ignored, onSuccess) => {
        onSuccess([
          { id: 1, userName: 'bob', firstName: 'Bob', lastName: 'Test', avatarSeed: 'a', avatarUrl: '' },
        ]);
      });

      const store = makeStore({ users: { user: { id: 99, userName: 'TestUser', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Header />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Get all search inputs (may have multiple due to responsive design)
      const inputs = screen.getAllByRole('textbox', { name: /Buscar usuarios/i });
      const input = inputs[0]; // Use the first one
      fireEvent.change(input, { target: { value: 'bo' } });

      jest.advanceTimersByTime(300);

      expect(await screen.findByText('bob')).toBeTruthy();
      expect(backend.userService.searchUsers).toHaveBeenCalledWith(
        'bo',
        undefined,
        expect.any(Function),
        expect.any(Function)
      );

      jest.useRealTimers();
    });
  });
});
