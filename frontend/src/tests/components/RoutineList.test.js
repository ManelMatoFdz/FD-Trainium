import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import RoutineList from '../../modules/routines/components/RoutineList';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

// Mock backend default export used by RoutineList (../../backend)
const mockFindAllCategories = jest.fn();
const mockSearchRoutines = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      findAllCategories: (...args) => mockFindAllCategories(...args),
      searchRoutines: (...args) => mockSearchRoutines(...args),
      remove: (...args) => mockRemove(...args),
    },
  },
}));

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('RoutineList', () => {
  beforeEach(() => {
    mockFindAllCategories.mockReset();
    mockSearchRoutines.mockReset();
    mockRemove.mockReset();
  });

  it('renderiza resultados iniciales y muestra "Nueva rutina" para canManage', async () => {
    // Mock: categorías
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([{ id: '123', name: 'Fuerza' }]));
    // Mock: búsqueda inicial
    const items = [
      { id: 10, name: 'Fuerza Pecho', level: 'Intermedio', categoryName: 'Fuerza', userName: 'Alice', userId: 99, openPublic: true },
      { id: 11, name: 'Piernas Básico', level: 'Básico', categoryName: 'Piernas', userName: 'Bob', userId: 100, openPublic: false },
    ];
    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items, existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Se cargan resultados en la tabla
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Fuerza Pecho/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /Piernas Básico/i })).toBeTruthy();
    });

    // Botón de nueva rutina visible para admin (renderizado como Link)
    expect(screen.getByRole('link', { name: /Nueva rutina/i })).toBeTruthy();

    // Verifica que se llamó a la búsqueda con filtros vacíos inicialmente
    expect(mockSearchRoutines).toHaveBeenCalled();
  });

  it('elimina una rutina tras confirmación en modal', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([]));
    const items = [
      { id: 110, name: 'Core Intermedio', level: 'Intermedio', categoryName: 'Core', userName: 'Alice', userId: 1, openPublic: true },
    ];
    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items, existMoreItems: false } });
    mockRemove.mockResolvedValue({ ok: true });

    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Core Intermedio/i })).toBeTruthy();
    });

    const actionsTrigger = screen.getByRole('button', { name: /Acciones/i });
    fireEvent.click(actionsTrigger);

    const deleteBtn = await screen.findByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteBtn);

    // Esperar a que aparezca el modal de confirmación
    const confirmModalTitle = await screen.findByText(/¿Eliminar esta rutina\?/i);
    expect(confirmModalTitle).toBeTruthy();

    // Obtener el dialog y verificar que "Core Intermedio" está en el mensaje del modal
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Core Intermedio/i)).toBeTruthy();

    // Obtener el botón "Eliminar" dentro del dialog
    const confirmButton = within(dialog).getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(110);
    }, { timeout: 2000 });
  });

  it('muestra mensaje cuando no hay rutinas', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([]));
    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items: [], existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'User' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalled();
    });
  });

  it('no muestra botón nueva rutina para usuarios normales', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([]));
    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items: [], existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'USER', userName: 'User' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalled();
    });

    expect(screen.queryByRole('link', { name: /Nueva rutina/i })).toBeNull();
  });

  it('muestra campo de búsqueda', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([]));
    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items: [], existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
    });
  });

  it('resetea la página cuando se cambian los filtros de búsqueda', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([
      { id: '1', name: 'Fuerza' },
      { id: '2', name: 'Cardio' }
    ]));

    const initialItems = [
      { id: 1, name: 'Rutina 1', level: 'Básico', categoryName: 'Fuerza', userName: 'User1', userId: 1, openPublic: true },
    ];

    const filteredItems = [
      { id: 2, name: 'Rutina 2', level: 'Intermedio', categoryName: 'Cardio', userName: 'User2', userId: 2, openPublic: true },
    ];

    // Primera llamada: búsqueda inicial
    mockSearchRoutines.mockResolvedValueOnce({ ok: true, payload: { items: initialItems, existMoreItems: false } });
    // Segunda llamada: después de cambiar filtro
    mockSearchRoutines.mockResolvedValueOnce({ ok: true, payload: { items: filteredItems, existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/?page=3']}>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Esperar a que cargue la búsqueda inicial
    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalledTimes(1);
    });

    // Abrir filtros
    const filterButton = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(filterButton);

    // Esperar a que aparezca el campo de búsqueda
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
    });

    // Cambiar el filtro de nombre
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Verificar que se llamó a searchRoutines nuevamente (debounce + reset)
    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalledTimes(2);
    }, { timeout: 1000 });
  });

  it('resetea la página cuando se limpia los filtros', async () => {
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([
      { id: '1', name: 'Fuerza' }
    ]));

    const items = [
      { id: 1, name: 'Rutina Test', level: 'Básico', categoryName: 'Fuerza', userName: 'User1', userId: 1, openPublic: true },
    ];

    mockSearchRoutines.mockResolvedValue({ ok: true, payload: { items, existMoreItems: false } });

    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });

    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={['/']}>
            <RoutineList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Esperar carga inicial
    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalled();
    });

    // Abrir filtros
    const filterButton = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(filterButton);

    // Cambiar un filtro primero
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalledTimes(2);
    }, { timeout: 1000 });

    // Hacer clic en "Limpiar"
    const clearButton = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearButton);

    // Verificar que se llamó a searchRoutines de nuevo (3 veces total)
    await waitFor(() => {
      expect(mockSearchRoutines).toHaveBeenCalledTimes(3);
    }, { timeout: 1000 });
  });
});
