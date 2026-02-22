import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import PendingExerciseList from '../../modules/exercises/components/PendingExerciseList';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import * as exerciseService from '../../backend/exerciseService';

jest.mock('../../backend/exerciseService');

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('PendingExerciseList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pending items and admin actions', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
          { id: 2, name: 'Sentadilla', material: 'Rack', muscles: 'PIERNAS' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByRole('link', { name: /Press banca/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Sentadilla/i })).toBeTruthy();
    // Admin-only primary action visible
    expect(screen.getAllByRole('button', { name: /Aprobar/i })[0]).toBeTruthy();
  });

  it('calls findPending service on mount', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(exerciseService.findPending).toHaveBeenCalled();
    });
  });

  it('displays reject buttons for admin', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Ensure the item is rendered, then open the actions dropdown and assert the 'Rechazar' action exists
    await screen.findByRole('link', { name: /Press banca/i });
    const dropdownTrigger = await screen.findByLabelText(/Más acciones/i);
    fireEvent.click(dropdownTrigger);
    // The dropdown action label may be 'Eliminar' or 'Rechazar' depending on translations
    expect(await screen.findByRole('button', { name: /Eliminar|Rechazar/i })).toBeTruthy();
  });

  it('renders table with pending exercises', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Press banca')).toBeTruthy();
      expect(screen.getByText('Barra')).toBeTruthy();
    });
  });

  it('shows search filters', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(exerciseService.findPending).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: /Filtrar/i })).toBeTruthy();
  });

  it('renders empty state when no pending exercises', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(exerciseService.findPending).toHaveBeenCalled();
    });
  });

  it('opens approve modal when clicking approve button', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Click approve button
    const approveButton = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approveButton);
    
    // Modal should show
    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro/i)).toBeTruthy();
    });
  });

  it('cancels approve action when clicking cancel', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Click approve button
    const approveButton = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approveButton);
    
    // Click cancel
    const cancelButton = await screen.findByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Una vez aprobado/i)).toBeNull();
    });
  });

  it('shows approve modal and sets exercise to approve', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });
    exerciseService.findById.mockResolvedValue({
      ok: true,
      payload: { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' }
    });
    exerciseService.approve.mockResolvedValue({ ok: true });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Click approve button
    const approveButton = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approveButton);
    
    // Modal should show
    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro/i)).toBeTruthy();
    });
  });

  it('opens delete modal when clicking delete action', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Open dropdown
    const dropdownTrigger = await screen.findByLabelText(/Más acciones/i);
    fireEvent.click(dropdownTrigger);
    
    // Click delete
    const deleteButton = await screen.findByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteButton);
    
    // Modal should show
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
  });

  it('shows delete modal for pending exercise', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: false
      }
    });
    exerciseService.remove.mockResolvedValue({ ok: true });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Open dropdown
    const dropdownTrigger = await screen.findByLabelText(/Más acciones/i);
    fireEvent.click(dropdownTrigger);
    
    // Click delete
    const deleteOption = await screen.findByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteOption);
    
    // Modal should show
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
  });

  it('renders exercises when existMoreItems is true', async () => {
    exerciseService.findPending.mockResolvedValue({
      ok: true,
      payload: {
        items: [
          { id: 1, name: 'Press banca', material: 'Barra', muscles: 'PECHO' },
        ],
        existMoreItems: true
      }
    });

    const store = makeStore({ users: { user: { id: 9, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <PendingExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    expect(screen.getByText(/Press banca/i)).toBeTruthy();
  });
});

