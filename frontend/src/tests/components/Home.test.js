import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import { isWrappedVisible } from '../../modules/users/components/WrappedModal';
import Home from '../../modules/app/components/Home';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

jest.mock('../../modules/users/components/WrappedModal', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: ({ onClose }) => (
      <div data-testid="wrapped-modal">
        <button type="button" onClick={onClose}>
          cerrar
        </button>
      </div>
    ),
    isWrappedVisible: jest.fn(),
  };
});

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('Home', () => {
  afterEach(() => cleanup());

  describe('when user is not logged in (landing page)', () => {
    it('renders landing correctly (snapshot)', () => {
      const store = makeStore();
      const tree = renderer
        .create(
          <Provider store={store}>
            <IntlProvider locale="es" messages={es}>
              <MemoryRouter>
                <Home />
              </MemoryRouter>
            </IntlProvider>
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('shows CTA buttons when logged out', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Primary CTA "Comenzar" and secondary login link present on landing
      expect(screen.getByRole('link', { name: /Comenzar/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /Iniciar/i })).toBeTruthy();
    });

    it('displays hero section with title', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Transforma tu Entrenamiento/i)).toBeTruthy();
    });

    it('shows feature cards', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      // Feature card headings may appear also inside paragraphs; check at least one match each
      expect(screen.queryAllByText(/Rutinas Personalizadas/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Seguimiento Avanzado/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Gestión Integral/i).length).toBeGreaterThan(0);
    });

    it('renders footer with copyright', () => {
      const store = makeStore();
      const { container } = render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/© Trainium 2025/i)).toBeTruthy();
      expect(container.querySelector('.landing-footer')).toBeTruthy();
    });

    it('signup link points to correct path', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      const signupLink = screen.getByRole('link', { name: /Comenzar/i });
      expect(signupLink).toHaveAttribute('href', '/users/signup');
    });

    it('login link points to correct path', () => {
      const store = makeStore();
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      const loginLink = screen.getByRole('link', { name: /Iniciar/i });
      expect(loginLink).toHaveAttribute('href', '/users/login');
    });
  });

  describe('when user is logged in (dashboard)', () => {
    it('renders dashboard with welcome message', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'JohnDoe', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Bienvenido de nuevo/i)).toBeTruthy();
    });

    it('displays username in welcome message', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'TestUser', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText('TestUser')).toBeTruthy();
    });

    it('shows motivational content', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Tu entrenamiento comienza aquí/i)).toBeTruthy();
      expect(screen.getByText(/Cada repetición cuenta/i)).toBeTruthy();
    });

    it('displays visual elements (Constancia, Disciplina, Progreso)', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Constancia/i)).toBeTruthy();
      expect(screen.getByText(/Disciplina/i)).toBeTruthy();
      // 'Progreso' may appear multiple times or be split; assert at least one match
      const progresoMatches = screen.queryAllByText(/Progreso/i);
      expect(progresoMatches.length).toBeGreaterThan(0);
    });

    it('shows showcase cards', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/Entrena con Propósito/i)).toBeTruthy();
      expect(screen.getByText(/Evoluciona Constantemente/i)).toBeTruthy();
    });

    it('renders inspirational quote', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/El éxito no es final/i)).toBeTruthy();
    });

    it('renders footer with copyright', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      const { container } = render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.getByText(/© Trainium 2025/i)).toBeTruthy();
      expect(container.querySelector('.dashboard-footer')).toBeTruthy();
    });

    it('does not render signup/login buttons', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.queryByRole('link', { name: /Comenzar Ahora/i })).toBeFalsy();
    });

    it('does not render feature cards section', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      const { container } = render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(container.querySelector('.features-section')).toBeFalsy();
    });

    it('shows wrapped button and opens/closes wrapped modal when visible', () => {
      isWrappedVisible.mockReturnValue(true);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      const openButton = screen.getByTestId('wrapped-button');
      expect(openButton).toBeTruthy();

      fireEvent.click(openButton);
      expect(screen.getByTestId('wrapped-modal')).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
      expect(screen.queryByTestId('wrapped-modal')).toBeNull();
    });

    it('does not render wrapped button when wrapped is not visible', () => {
      isWrappedVisible.mockReturnValue(false);
      const store = makeStore({ users: { user: { userName: 'Test', role: 'USER' } } });
      render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter>
              <Home />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );

      expect(screen.queryByTestId('wrapped-button')).toBeNull();
    });
  });
});
