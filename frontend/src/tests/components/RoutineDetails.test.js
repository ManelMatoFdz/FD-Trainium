import { render, screen, waitFor } from '@testing-library/react';
import RoutineDetails from '../../modules/routines/components/RoutineDetails';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';

jest.mock('../../backend/appFetch', () => ({
    appFetch: (path, options, onSuccess ) => {
        // Mock para obtener rutina
        if (path.includes('/routines/') && !path.includes('/saved')) {
            onSuccess({
                id: 1,
                name: 'Rutina de fuerza',
                level: 'Avanzado',
                description: 'Entrenamiento de fuerza general',
                category: 'Fuerza',
                categoryName: 'Fuerza',
                userId: 2,
                userName: 'Entrenador Pro',
                exercises: [
                    {
                        id: 101,
                        name: 'Press de banca',
                        muscles: ['Pecho', 'Tríceps'],
                        material: 'Banco y barra',
                        repetitions: 10,
                        sets: 3
                    }
                ]
            });
        }
        // Mock para rutinas guardadas
        else if (path.includes('/saved')) {
            onSuccess({ items: [] });
        }
    },
    fetchConfig: () => ({}),
}));

// Mock para userService.isFollowingUser
jest.mock('../../backend/userService', () => ({
    ...jest.requireActual('../../backend/userService'),
    isFollowingUser: (userId, onSuccess) => {
        onSuccess(false);
    }
}));

// Mock store simple que devuelve el estado que le pases
const makeStore = (preloadedState) =>
    configureStore({
        reducer: (state = preloadedState) => state
    });

describe('RoutineDetails', () => {
    it('Muestra correctamente los detalles de la rutina para un usuario', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Rutina de fuerza/i })).toBeTruthy();

            expect(screen.getByText('Nivel')).toBeTruthy();
            expect(screen.getByText('Avanzado')).toBeTruthy();

            expect(screen.getByText('Categoría')).toBeTruthy();
            expect(screen.getByText('Fuerza')).toBeTruthy();

            expect(screen.getByText('Creador')).toBeTruthy();
            expect(screen.getByText('Entrenador Pro')).toBeTruthy();

            expect(screen.getByText('Descripción')).toBeTruthy();
            expect(screen.getByText('Entrenamiento de fuerza general')).toBeTruthy();

            expect(screen.getByText(/Volver/i)).toBeTruthy();
            expect(screen.getByText(/Realizar rutina/i)).toBeTruthy();
            expect(screen.getByText(/Seguir/i)).toBeTruthy();

            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
            expect(screen.getByText(/Pecho/i)).toBeTruthy();
            expect(screen.getByText(/tr[ií]ceps/i)).toBeTruthy();
            expect(screen.getByText(/Banco y barra/i)).toBeTruthy();
            expect(screen.getByText(/10/i)).toBeTruthy();
            expect(screen.getByText(/3/i)).toBeTruthy();
        });
    });
    it('Muestra correctamente los detalles de la rutina para un entrenador', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'TRAINER', userName: 'Entrenador' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Rutina de fuerza/i })).toBeTruthy();

            expect(screen.getByText('Nivel')).toBeTruthy();
            expect(screen.getByText('Avanzado')).toBeTruthy();

            expect(screen.getByText('Categoría')).toBeTruthy();
            expect(screen.getByText('Fuerza')).toBeTruthy();

            expect(screen.getByText('Creador')).toBeTruthy();
            expect(screen.getByText('Entrenador Pro')).toBeTruthy();

            expect(screen.getByText('Descripción')).toBeTruthy();
            expect(screen.getByText('Entrenamiento de fuerza general')).toBeTruthy();

            expect(screen.getByText(/Volver/i)).toBeTruthy();
            expect(screen.getByText(/Seguir/i)).toBeTruthy();

            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
            expect(screen.getByText(/Pecho/i)).toBeTruthy();
            expect(screen.getByText(/tr[ií]ceps/i)).toBeTruthy();
            expect(screen.getByText(/Banco y barra/i)).toBeTruthy();
            expect(screen.getByText(/10/i)).toBeTruthy();
            expect(screen.getByText(/3/i)).toBeTruthy();
        });
    });
    it('Muestra correctamente los detalles de la rutina para un admin', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Rutina de fuerza/i })).toBeTruthy();

            expect(screen.getByText('Nivel')).toBeTruthy();
            expect(screen.getByText('Avanzado')).toBeTruthy();

            expect(screen.getByText('Categoría')).toBeTruthy();
            expect(screen.getByText('Fuerza')).toBeTruthy();

            expect(screen.getByText('Creador')).toBeTruthy();
            expect(screen.getByText('Entrenador Pro')).toBeTruthy();

            expect(screen.getByText('Descripción')).toBeTruthy();
            expect(screen.getByText('Entrenamiento de fuerza general')).toBeTruthy();

            expect(screen.getByText(/Volver/i)).toBeTruthy();
            expect(screen.getByText(/Realizar Rutina/i)).toBeTruthy();
            expect(screen.getByText(/Ver Guardados/i)).toBeTruthy();

            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
            expect(screen.getByText(/Pecho/i)).toBeTruthy();
            expect(screen.getByText(/tr[ií]ceps/i)).toBeTruthy();
            expect(screen.getByText(/Banco y barra/i)).toBeTruthy();
            expect(screen.getByText(/10/i)).toBeTruthy();
            expect(screen.getByText(/3/i)).toBeTruthy();
        });
    });

    it('Muestra botón de realizar rutina para todos los roles', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Realizar rutina/i)).toBeTruthy();
        });
    });

    it('Muestra información de ejercicios correctamente', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
            expect(screen.getByText(/Banco y barra/i)).toBeTruthy();
        });
    });

    it('Muestra botón de volver', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Volver/i)).toBeTruthy();
        });
    });

    it('Muestra información de ejercicios de tipo CARDIO correctamente', async () => {
        jest.resetModules();
        jest.doMock('../../backend/appFetch', () => ({
            appFetch: (path, options, onSuccess ) => {
                if (path.includes('/routines/') && !path.includes('/saved')) {
                    onSuccess({
                        id: 1,
                        name: 'Rutina Cardio',
                        level: 'Intermedio',
                        description: 'Entrenamiento cardiovascular',
                        category: 'Cardio',
                        categoryName: 'Cardio',
                        userId: 2,
                        userName: 'Entrenador Pro',
                        exercises: [
                            {
                                id: 102,
                                name: 'Correr',
                                muscles: ['Piernas'],
                                material: 'Cinta',
                                type: 'CARDIO',
                                sets: 5000,
                                repetitions: 1800,
                            }
                        ]
                    });
                } else if (path.includes('/saved')) {
                    onSuccess({ items: [] });
                }
            },
            fetchConfig: () => ({}),
        }));
        
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Rutina/i })).toBeTruthy();
        });
    });

    it('Muestra ejercicio sin repeticiones ni series', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
        });
    });

    it('Muestra ejercicio con muscles como string', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'Usuario' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Press de banca/i)).toBeTruthy();
        });
    });
});

