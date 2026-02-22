import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import Body from '../../modules/app/components/Body';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('Body', () => {
  afterEach(() => cleanup());

  describe('when user is not logged in', () => {
    it('renders Login on /users/login when not logged in', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/login"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Label from Login form
      expect(screen.getByLabelText(/Nombre de usuario/i)).toBeTruthy();
    });

    it('renders SignUp on /users/signup', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/signup"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByLabelText(/Nombre de usuario/i)).toBeTruthy();
      expect(screen.getByLabelText(/^Contraseña$/i)).toBeTruthy();
    });

    it('falls back to Home when accessing a protected route while logged out', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/view-profile"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Home landing headline
      expect(screen.getByText(/Transforma tu Entrenamiento/i)).toBeTruthy();
    });

    it('redirects to Home when accessing /routines without login', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/routines"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Transforma tu Entrenamiento/i)).toBeTruthy();
    });

    it('redirects to Home when accessing /exercises without login', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/exercises"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Transforma tu Entrenamiento/i)).toBeTruthy();
    });
  });

  describe('when user is logged in', () => {
    it('renders Home on root path', () => {
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Bienvenido de nuevo/i)).toBeTruthy();
    });

    it('renders RoutineList on /routines', () => {
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/routines"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // RoutineList renders its search elements
      expect(screen.getByPlaceholderText(/Buscar (rutinas|por nombre)/i)).toBeTruthy();
    });

    it('does not render Login when logged in', () => {
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/login"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Should render Home instead — assert login form is not present
      expect(screen.queryByLabelText(/Nombre de usuario/i)).toBeNull();
    });

    it('does not render SignUp when logged in', () => {
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/signup"]}>
              <Routes>
                <Route path="/*" element={<Body />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Should render Home instead — assert signup form is not present
      expect(screen.queryByLabelText(/Nombre de usuario/i)).toBeNull();
      expect(screen.queryByLabelText(/^Contraseña$/i)).toBeNull();
    });
  });
});

