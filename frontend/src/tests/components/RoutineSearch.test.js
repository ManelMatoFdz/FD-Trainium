import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import RoutineSearch, { useRoutineFilter } from '../../modules/routines/components/RoutineSearch';

describe('RoutineSearch', () => {
  jest.useFakeTimers();

  const makeStore = (preloadedState) => configureStore({ reducer: rootReducer, preloadedState });

  it('toggles filter panel and renders rightActions', () => {
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            rightActions={<button>Acción Extra</button>}
          />
        </IntlProvider>
      </Provider>
    );

    // Right action present
    expect(screen.getByRole('button', { name: /Acción Extra/i })).toBeTruthy();

    // Initially collapsed, clicking Filtrar opens panel (toggle button switches label)
    const toggle = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /Ocultar filtros/i })).toBeTruthy();
  });

  it('debounces onSearch when useBackendSearch=true', () => {
    const onSearch = jest.fn();
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={(f) => setFilters(f)}
            resetFilters={() => {}}
            onSearch={onSearch}
            useBackendSearch={true}
          />
        </IntlProvider>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(input, { target: { value: 'fuerza' } });
    // Debounce 300ms
    jest.advanceTimersByTime(350);
    expect(onSearch).toHaveBeenCalled();
  });

  it('filtra rutinas por nombre, nivel y categoría con useRoutineFilter', () => {
    const list = [
      { id: 1, name: 'Fuerza Pecho', level: 'Intermedio', category: '123' },
      { id: 2, name: 'Piernas Básico', level: 'Básico', category: '456' },
      { id: 3, name: 'Fuerza Hombros', level: 'Avanzado', category: '123' },
    ];

    const Probe = ({ query }) => {
      const { filters, setFilters, filteredList } = useRoutineFilter(list);
      React.useEffect(() => setFilters(query), [JSON.stringify(query)]);
      return (
        <ul>
          {filteredList.map((r) => (
            <li key={r.id}>{r.name}</li>
          ))}
        </ul>
      );
    };

    // Nombre: "Fuerza" -> devuelve 2
    const { rerender } = render(
      <Probe query={{ name: 'Fuerza', level: '', category: '' }} />
    );
    expect(screen.getAllByRole('listitem').length).toBe(2);

    // Nivel: Intermedio -> 1
    rerender(<Probe query={{ name: '', level: 'Intermedio', category: '' }} />);
    expect(screen.getAllByRole('listitem').length).toBe(1);
    expect(screen.getByText('Fuerza Pecho')).toBeTruthy();

    // Categoría: 123 -> 2
    rerender(<Probe query={{ name: '', level: '', category: '123' }} />);
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('renders search input field', () => {
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('allows applying filters', () => {
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </IntlProvider>
      </Provider>
    );

    const toggle = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(toggle);

    // The component exposes inputs and a 'Limpiar' button; ensure the search input is visible
    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('allows resetting filters', () => {
    const filters = { name: 'test', level: 'Básico', category: '123' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </IntlProvider>
      </Provider>
    );

    const toggle = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(toggle);

    const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearBtn);
    expect(resetFilters).toHaveBeenCalled();
  });

  it('renders without rightActions', () => {
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('renders with categories from redux store', () => {
    const filters = { name: '', level: '', category: '' };
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const store = makeStore({
      routines: {
        categories: [
          { id: 1, name: 'Fuerza' },
          { id: 2, name: 'Cardio' }
        ]
      }
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <RoutineSearch
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </IntlProvider>
      </Provider>
    );

    // Open filters panel
    const toggle = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(toggle);
    
    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('filters list with empty query returns all', () => {
    const list = [
      { id: 1, name: 'Rutina A', level: 'Básico', category: '1' },
      { id: 2, name: 'Rutina B', level: 'Avanzado', category: '2' }
    ];

    const Probe = ({ query }) => {
      const { filters, setFilters, filteredList } = useRoutineFilter(list);
      React.useEffect(() => setFilters(query), [JSON.stringify(query)]);
      return (
        <ul>
          {filteredList.map((r) => (
            <li key={r.id}>{r.name}</li>
          ))}
        </ul>
      );
    };

    render(<Probe query={{ name: '', level: '', category: '' }} />);
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });
});
