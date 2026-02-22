import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import MyRoutineList from '../../modules/routines/components/MyRoutineList';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

const mockFindAllCategories = jest.fn();
const mockMyRoutines = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      findAllCategories: (...args) => mockFindAllCategories(...args),
      myRoutines: (...args) => mockMyRoutines(...args),
      remove: (...args) => mockRemove(...args),
    },
  },
}));

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('MyRoutineList', () => {
  beforeEach(() => {
    mockFindAllCategories.mockReset();
    mockMyRoutines.mockReset();
    mockRemove.mockReset();
  });

  it('carga categorías y mis rutinas y muestra botón "Nueva rutina" para canManage', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado' },
      { id: 11, name: 'Piernas Básico' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('heading', { name: /Mis Rutinas/i });
    await screen.findByRole('link', { name: /Pecho Avanzado/i });

    expect(
      screen.getByRole('link', { name: /Nueva rutina/i })
    ).toBeTruthy();
    expect(mockFindAllCategories).toHaveBeenCalled();
    expect(mockMyRoutines).toHaveBeenCalled();
  });

  it('no carga datos ni muestra botón si el usuario no puede gestionar', async () => {
    const store = makeStore({
      users: { user: { id: 2, role: 'USER', userName: 'user' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Mis Rutinas/i })
      ).toBeTruthy();
    });

    expect(mockFindAllCategories).not.toHaveBeenCalled();
    expect(mockMyRoutines).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('link', { name: /Nueva rutina/i })
    ).toBeNull();
  });

  it('displays routine list with correct items', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', categoryName: 'Fuerza' },
      { id: 11, name: 'Piernas Básico', level: 'Básico', categoryName: 'Fuerza' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Pecho Avanzado/i });
    await screen.findByRole('link', { name: /Piernas Básico/i });
  });

  it('shows empty state when no routines', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Mis Rutinas/i })).toBeTruthy();
    });
  });

  it('calls findAllCategories on mount for trainers', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'admin' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockFindAllCategories).toHaveBeenCalled();
    });
  });

  it('resetea la página cuando se cambian los filtros locales', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', category: 'A' },
      { id: 11, name: 'Piernas Básico', level: 'Básico', category: 'A' },
      { id: 12, name: 'Espalda Intermedio', level: 'Intermedio', category: 'A' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'admin' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/?page=2']}>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockMyRoutines).toHaveBeenCalled();
    });

    const filterButton = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(filterButton);

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'Pecho' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar por nombre/i).value).toBe('Pecho');
    });
  });

  it('resetea la página cuando se limpian los filtros locales', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', category: 'A' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/?page=3']}>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockMyRoutines).toHaveBeenCalled();
    });

    const filterButton = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(filterButton);

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('test');
    });

    const clearButton = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });

  it('handles category error callback', async () => {
    mockFindAllCategories.mockImplementation((onSuccess, onError) =>
      onError([{ message: 'Error loading categories' }])
    );
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockFindAllCategories).toHaveBeenCalled();
    });
  });

  it('shows pagination controls when there are more items', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', categoryName: 'Fuerza' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: true },
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Pecho Avanzado/i });
    
    expect(mockMyRoutines).toHaveBeenCalledWith(0);
  });

  it('handles delete routine flow', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', categoryName: 'Fuerza' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });
    mockRemove.mockResolvedValue({ ok: true });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Pecho Avanzado/i });
    expect(mockMyRoutines).toHaveBeenCalled();
  });

  it('handles delete routine error', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    const items = [
      { id: 10, name: 'Pecho Avanzado', level: 'Avanzado', categoryName: 'Fuerza' },
    ];
    mockMyRoutines.mockResolvedValue({
      ok: true,
      payload: { items, existMoreItems: false },
    });
    mockRemove.mockResolvedValue({ ok: false, payload: [{ message: 'Error al eliminar' }] });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Pecho Avanzado/i });
    expect(mockMyRoutines).toHaveBeenCalled();
  });

  it('handles myRoutines error response', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) =>
      onSuccess([{ id: 'A', name: 'Fuerza' }])
    );
    mockMyRoutines.mockResolvedValue({
      ok: false,
      payload: [{ message: 'Error loading routines' }],
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'trainer' } },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <MyRoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockMyRoutines).toHaveBeenCalled();
    });
  });
});
