import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RoutineDetails from '../../modules/routines/components/RoutineDetails';
import SavedUsers from '../../modules/routines/components/SavedUsers';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import backend from '../../backend';
import es from '../../i18n/messages/messages_es';
import { IntlProvider } from 'react-intl';

jest.mock('../../backend');

const makeStore = (preloadedState) =>
    configureStore({ reducer: (state = preloadedState) => state });

describe('Guardar rutina y ver usuarios que la guardaron', () => {
    const routineMock = {
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
                sets: 3,
            },
        ],
    };

    beforeEach(() => {
        backend.routineService.findById.mockResolvedValue({
            ok: true,
            payload: routineMock,
        });
        backend.routineService.savedRoutines.mockResolvedValue({
            ok: true,
            payload: { items: [] },
        });
        backend.routineService.save.mockResolvedValue({ ok: true });
        backend.routineService.getUsersWhoSavedRoutine.mockResolvedValue({
            ok: true,
            payload: { items: [] },
        });
    });

    it('Usuario guarda rutina y entrenador lo ve en ver guardados', async () => {
        let store = makeStore({ users: { user: { id: 2, role: 'TRAINER', userName: 'Entrenador Pro' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => screen.getByText('Rutina de fuerza'));

        backend.routineService.getUsersWhoSavedRoutine.mockResolvedValue({
            ok: true,
            payload: { items: [] },
        });
        const savedBtn = await screen.findByText(/Ver guardados/i);
        fireEvent.click(savedBtn);

        await waitFor(() => {
            expect(screen.getByText(/Usuarios que guardaron esta rutina/i)).toBeTruthy();
            expect(screen.getByText('Avatar')).toBeTruthy();
            expect(screen.getByText('Usuario')).toBeTruthy();
            expect(screen.getByText(/Ningún usuario ha guardado esta rutina./i)).toBeTruthy();
        });


        store = makeStore({ users: { user: { id: 3, role: 'USER', userName: 'Pepe' } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/routines/1']}>
                        <RoutineDetails />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => screen.getByText('Rutina de fuerza'));

        const moreActionsBtn = await screen.findByRole('button', { name: /Más acciones/i });
        fireEvent.click(moreActionsBtn);

        backend.routineService.save.mockResolvedValue({ ok: true });
        const saveBtn = await screen.findByText(/Guardar rutina/i);
        fireEvent.click(saveBtn);
    });

    it('shows error toast when getUsersWhoSavedRoutine fails with ok:false', async () => {
        backend.routineService.getUsersWhoSavedRoutine.mockResolvedValue({
            ok: false,
            payload: null,
        });
        
        const onClose = jest.fn();
        const store = makeStore({ users: { user: { id: 2, role: 'TRAINER', userName: 'Entrenador Pro' } } });
        
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <SavedUsers routineId={1} onClose={onClose} />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(backend.routineService.getUsersWhoSavedRoutine).toHaveBeenCalledWith(1);
        });
    });

    it('handles exception when loading users', async () => {
        backend.routineService.getUsersWhoSavedRoutine.mockRejectedValue(new Error('Network error'));
        
        const onClose = jest.fn();
        const store = makeStore({ users: { user: { id: 2, role: 'TRAINER', userName: 'Entrenador Pro' } } });
        
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter>
                        <SavedUsers routineId={1} onClose={onClose} />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(backend.routineService.getUsersWhoSavedRoutine).toHaveBeenCalledWith(1);
        });
    });
});
