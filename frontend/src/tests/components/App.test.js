import React from 'react';
import renderer from 'react-test-renderer';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import App from '../../modules/app/components/App';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';

const preloadedState = {
  users: {
    user: null,
  },
  app: {},
  routines: {},
  exercises: {}
};

const makeStore = (state = preloadedState) =>
  configureStore({ reducer: rootReducer,  preloadedState: state, middleware: (getDefaultMiddleware) => getDefaultMiddleware(),});

// Avoid jdenticon errors when Header renders Avatar
jest.mock('jdenticon', () => ({ update: jest.fn() }));
jest.mock('../../backend', () => ({
  userService: {
    tryLoginFromServiceToken: jest.fn(),
    logout: jest.fn(),
  },
}));
jest.mock('../../modules/users/actions', () => ({
  __esModule: true,
  loginCompleted: ((user) => ({ type: 'project/users/loginCompleted',  authenticatedUser: { user }  })),
  logout: (() => ({ type: 'project/users/logout' })),
}));

describe('App', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks()
  });

  it('matches snapshot on auth page and hides header', () => {
    const store = makeStore();
    const tree = renderer
      .create(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/users/login"]}>
              <App />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('adds no-scroll on auth pages and removes header', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={["/users/login"]}>
            <App />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(document.body.classList.contains('no-scroll')).toBe(true);
    expect(screen.queryByRole('banner')).toBeNull();
    // Brand link inside auth layout should be present
    expect(screen.getByRole('link', { name: /Ir al inicio \(Trainium\)/i })).toBeTruthy();
  });

  it('shows header on non-auth pages', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={["/"]}>
            <App />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('logs out when stored token is invalid', () => {
    const store = makeStore();

    // Simula token inválido
    backend.userService.tryLoginFromServiceToken.mockImplementation(
        (onError) => {
          onError();
        }
    );

    render(
        <Provider store={store}>
          <IntlProvider locale="es" messages={es}>
            <MemoryRouter initialEntries={["/"]}>
              <App />
            </MemoryRouter>
          </IntlProvider>
        </Provider>
    );

    expect(backend.userService.tryLoginFromServiceToken).toHaveBeenCalled();
  });


    it('tries to restore session from service token on app load', () => {
        const store = makeStore();

        backend.userService.tryLoginFromServiceToken.mockImplementation(
            (_onError, onSuccess) => {
                onSuccess({ id: 1, userName: 'test', role: 'USER' });
            }
        );


        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/']}>
                        <App />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(backend.userService.tryLoginFromServiceToken).toHaveBeenCalledTimes(1);
        expect(store.getState().users.user).toEqual({ id: 1, userName: 'test', role: 'USER' });
    });

    it('logs out when stored token is invalid', () => {
        const store = makeStore({
            ...preloadedState,
            users: {
                user: { id: 1, userName: 'test', role: 'USER' }
            }
        });

        backend.userService.tryLoginFromServiceToken.mockImplementation(
            (onError) => {
                onError();
            }
        );

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/']}>
                        <App />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(backend.userService.tryLoginFromServiceToken).toHaveBeenCalledTimes(1);
        expect(store.getState().users.user).toBeNull();
    });


});
