import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import RoutineTable from '../../modules/routines/components/RoutineTable';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('RoutineTable', () => {
  const sample = [
    { id: 1, name: 'Fuerza Pecho', level: 'Intermedio', categoryName: 'Fuerza', userName: 'Alice', userId: 10, openPublic: true },
    { id: 2, name: 'Piernas Básico', level: 'Básico', categoryName: 'Piernas', userName: 'Bob', userId: 11, openPublic: false },
  ];

  it('renders empty state', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={[]} onDelete={() => {}} />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByText(/No hay rutinas\./i)).toBeTruthy();
  });

  it('renders rows and shows owner/admin actions', () => {
    // admin user sees actions on any row
    const store = makeStore({ users: { user: { id: 99, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={sample} onDelete={() => {}} showVisibility />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Two routine names present as links
    expect(screen.getByRole('link', { name: /Fuerza Pecho/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Piernas Básico/i })).toBeTruthy();

    // Visibility labels present
    expect(screen.getByText(/^Público|Pública$/i) || screen.getByText(/^Privado|Privada$/i)).toBeTruthy();

    // Dropdown de acciones disponible por fila
    const actionTriggers = screen.getAllByRole('button', { name: /Acciones/i });
    expect(actionTriggers).toHaveLength(sample.length);

    // Al abrir el menú se muestran acciones
    fireEvent.click(actionTriggers[0]);
    expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eliminar/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={[]} onDelete={() => {}} isLoading={true} loadingMessage="Cargando..." />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(screen.getByText(/Cargando/i)).toBeTruthy();
  });

  it('hides actions for non-owner non-admin users', () => {
    const store = makeStore({ users: { user: { id: 50, role: 'USER', userName: 'User' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={sample} onDelete={() => {}} />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // User 50 is not owner of routines (userId 10, 11) so no action buttons
    expect(screen.queryByRole('button', { name: /Acciones/i })).toBeNull();
  });

  it('shows actions only for owner when not admin', () => {
    // User is owner of first routine
    const store = makeStore({ users: { user: { id: 10, role: 'TRAINER', userName: 'Alice' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={sample} onDelete={() => {}} />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Should see 1 action button (for own routine only)
    const actionTriggers = screen.getAllByRole('button', { name: /Acciones/i });
    expect(actionTriggers).toHaveLength(1);
  });

  it('handles onDelete callback', () => {
    const onDelete = jest.fn();
    const store = makeStore({ users: { user: { id: 99, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <RoutineTable list={sample} onDelete={onDelete} />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    const actionTriggers = screen.getAllByRole('button', { name: /Acciones/i });
    fireEvent.click(actionTriggers[0]);
    
    const deleteBtn = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteBtn);
    
    expect(onDelete).toHaveBeenCalledWith(sample[0]);
  });

});
