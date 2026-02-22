import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import backend from '../../backend';
import BlockedUsers from '../../modules/users/components/BlockedUsers';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

// Mocks
jest.mock('../../backend', () => ({
    userService: { getBlockedUsers: jest.fn() },
}));

jest.mock('jdenticon', () => ({ update: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Store helper
const makeStore = (preloadedState) =>
    configureStore({ reducer: rootReducer, preloadedState });

describe('BlockedUsers component', () => {
    let store;

    beforeEach(() => {
        jest.clearAllMocks();
        store = makeStore({ users: { user: { id: 1, userName: 'alice' } } });
    });

    it('renders loading spinner initially', () => {
        backend.userService.getBlockedUsers.mockImplementation(() => {});
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <BlockedUsers />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(screen.getByText(/Cargando usuarios bloqueados/i)).toBeInTheDocument();
    });

    it('renders blocked users after fetch', async () => {
        const mockUsers = [
            { id: 2, userName: 'bob', firstName: 'Bob', lastName: 'Smith', avatarSeed: 'b' },
            { id: 3, userName: 'carol', firstName: 'Carol', lastName: 'Jones', avatarSeed: 'c' },
        ];
        backend.userService.getBlockedUsers.mockImplementation((userId, onSuccess) => onSuccess(mockUsers));

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <BlockedUsers />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('bob')).toBeInTheDocument();
            expect(screen.getByText('Bob Smith')).toBeInTheDocument();
            expect(screen.getByText('carol')).toBeInTheDocument();
            expect(screen.getByText('Carol Jones')).toBeInTheDocument();
        });
    });

    it('shows empty message when no blocked users', async () => {
        backend.userService.getBlockedUsers.mockImplementation((userId, onSuccess) => onSuccess([]));

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <BlockedUsers />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/No tienes usuarios bloqueados/i)).toBeInTheDocument();
        });
    });

    it('handles fetch error gracefully', async () => {
        backend.userService.getBlockedUsers.mockImplementation((userId, onSuccess, onError) => onError());

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <BlockedUsers />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/No tienes usuarios bloqueados/i)).toBeInTheDocument();
        });
    });

    it('navigates when clicking a blocked user', async () => {
        const mockUsers = [{ id: 2, userName: 'bob' }];
        backend.userService.getBlockedUsers.mockImplementation((userId, onSuccess) => onSuccess(mockUsers));

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <BlockedUsers />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('bob')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('bob'));

        expect(mockNavigate).toHaveBeenCalledWith('/users/2');
    });
});
