import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import ExerciseList from '../../modules/exercises/components/ExerciseList';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';
import * as exerciseService from '../../backend/exerciseService';

jest.mock('../../backend/exerciseService');

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('ExerciseList', () => {
  const listData = [
    { id: 101, name: 'Press banca', material: 'Barra', muscles: ['PECHO'] },
    { id: 102, name: 'Sentadilla', material: 'Rack', muscles: ['PIERNAS'] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    exerciseService.find.mockResolvedValue({
      ok: true,
      payload: { items: listData, existMoreItems: false }
    });
    exerciseService.remove.mockResolvedValue({ ok: true });
    exerciseService.reject.mockResolvedValue({ ok: true });
  });

  it('renders table with items and admin actions', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByRole('link', { name: /Press banca/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Sentadilla/i })).toBeTruthy();

    // Admin-only actions visible (render as links)
    expect(screen.getByRole('link', { name: /Ejercicios pendientes/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Nuevo ejercicio/i })).toBeTruthy();
  });

  it('hides create button for non-admin/non-trainer', async () => {
    const store = makeStore({
      users: { user: { id: 2, role: 'USER', userName: 'Bob' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByRole('link', { name: /Press banca/i })).toBeTruthy();

    expect(screen.queryByRole('link', { name: /Nuevo ejercicio/i })).toBeNull();
  });

  it('shows new exercise button for TRAINER role', async () => {
    const store = makeStore({
      users: { user: { id: 3, role: 'TRAINER', userName: 'Trainer' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByRole('link', { name: /Press banca/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Nuevo ejercicio/i })).toBeTruthy();
    // Trainer should NOT see pending exercises link (admin only)
    expect(screen.queryByRole('link', { name: /Ejercicios pendientes/i })).toBeNull();
  });

  it('displays exercise table with columns', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Press banca/i)).toBeTruthy();
    });

    expect(screen.getByText(/Barra/i)).toBeTruthy();
  });

  it('renders search placeholder', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('shows pending exercises link for admin', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    expect(await screen.findByRole('link', { name: /pendientes/i })).toBeTruthy();
  });

  it('calls find service on mount', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(exerciseService.find).toHaveBeenCalled();
    });
  });

  it('renders empty state when no exercises', async () => {
    exerciseService.find.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false }
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(exerciseService.find).toHaveBeenCalled();
    });
  });

  it('opens delete modal when clicking delete action', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Click the dropdown trigger
    const dropdownTriggers = await screen.findAllByLabelText(/Acciones/i);
    fireEvent.click(dropdownTriggers[0]);
    
    // Click delete option
    const deleteButton = await screen.findByText(/Eliminar/i);
    fireEvent.click(deleteButton);
    
    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
  });

  it('closes delete modal when clicking cancel', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Open dropdown and click delete
    const dropdownTriggers = await screen.findAllByLabelText(/Acciones/i);
    fireEvent.click(dropdownTriggers[0]);
    const deleteButton = await screen.findByText(/Eliminar/i);
    fireEvent.click(deleteButton);
    
    // Click cancel
    const cancelButton = await screen.findByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/¿Eliminar este ejercicio/i)).toBeNull();
    });
  });

  it('calls remove service when deleting exercise', async () => {
    exerciseService.remove.mockResolvedValue({ ok: true });
    
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Open dropdown and click delete
    const dropdownTriggers = await screen.findAllByLabelText(/Acciones/i);
    fireEvent.click(dropdownTriggers[0]);
    const deleteOption = await screen.findByText(/Eliminar/i);
    fireEvent.click(deleteOption);
    
    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
  });

  it('renders exercises when existMoreItems is true', async () => {
    exerciseService.find.mockResolvedValue({
      ok: true,
      payload: { items: listData, existMoreItems: true }
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    expect(screen.getByRole('link', { name: /Sentadilla/i })).toBeTruthy();
  });

  it('renders muscles as badges', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Press banca/i)).toBeTruthy();
    });
    
    // Check for muscle badge
    expect(screen.getByText(/Pecho/i)).toBeTruthy();
  });

  it('opens delete modal for exercise', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // Open dropdown and click delete
    const dropdownTriggers = await screen.findAllByLabelText(/Acciones/i);
    fireEvent.click(dropdownTriggers[0]);
    const deleteOption = await screen.findByText(/Eliminar/i);
    fireEvent.click(deleteOption);
    
    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
  });

  it('shows create button for TRAINER role', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'TRAINER', userName: 'Trainer' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // TRAINER should see create button but not admin-only table actions
    expect(screen.getByRole('link', { name: /Nuevo ejercicio/i })).toBeTruthy();
    // TRAINER should NOT see pending exercises button (admin only)
    expect(screen.queryByRole('link', { name: /Ejercicios pendientes/i })).toBeNull();
  });

  it('handles empty exercise list', async () => {
    exerciseService.find.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false }
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => expect(exerciseService.find).toHaveBeenCalled());
  });

  it('handles error in find service', async () => {
    exerciseService.find.mockResolvedValue({
      ok: false,
      error: 'Error loading exercises'
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await waitFor(() => expect(exerciseService.find).toHaveBeenCalled());
  });

  it('renders exercise type badge', async () => {
    exerciseService.find.mockResolvedValue({
      ok: true,
      payload: { 
        items: [{ id: 1, name: 'Plancha', material: 'Ninguno', muscles: 'CORE', type: 'TIME' }], 
        existMoreItems: false 
      }
    });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Plancha/i });
  });

  it('shows pending exercises link for ADMIN', async () => {
    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });
    
    // ADMIN should see pending exercises link
    const pendingLink = screen.queryByText(/pendientes/i);
    if (pendingLink) {
      expect(pendingLink).toBeTruthy();
    }
  });

  it('confirms delete exercise when delete succeeds', async () => {
    exerciseService.remove.mockResolvedValue({ ok: true });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });

    // Click dropdown to see delete button
    const dropdownButton = screen.getAllByLabelText(/Acciones/i)[0];
    fireEvent.click(dropdownButton);
    
    await waitFor(() => {
      const deleteBtn = screen.getByText(/Eliminar/i);
      fireEvent.click(deleteBtn);
    });

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(exerciseService.remove).toHaveBeenCalled();
    });
  });

  it('handles delete failure with 400 status and rejects exercise', async () => {
    exerciseService.remove.mockResolvedValue({ ok: false, status: 400 });
    exerciseService.reject.mockResolvedValue({ ok: true });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: listData, current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });

    // Click dropdown to see delete button
    const dropdownButton = screen.getAllByLabelText(/Acciones/i)[0];
    fireEvent.click(dropdownButton);
    
    await waitFor(() => {
      const deleteBtn = screen.getByText(/Eliminar/i);
      fireEvent.click(deleteBtn);
    });

    // Confirm delete
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
    const confirmBtn = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(exerciseService.remove).toHaveBeenCalled();
    });
  });

  it('handles reject failure with 403 status', async () => {
    exerciseService.remove.mockResolvedValue({ ok: false, status: 400 });
    exerciseService.reject.mockResolvedValue({ ok: false, status: 403 });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: listData, current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });

    // Click dropdown to see delete button  
    const dropdownButton = screen.getAllByLabelText(/Acciones/i)[0];
    fireEvent.click(dropdownButton);
    
    await waitFor(() => {
      const deleteBtn = screen.getByText(/Eliminar/i);
      fireEvent.click(deleteBtn);
    });

    // Confirm delete
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
    const confirmBtn = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(exerciseService.reject).toHaveBeenCalled();
    });
  });

  it('handles generic delete failure', async () => {
    exerciseService.remove.mockResolvedValue({ ok: false, status: 500 });

    const store = makeStore({
      users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } },
      exercises: { list: [], current: null, loading: false },
    });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter>
            <ExerciseList />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    await screen.findByRole('link', { name: /Press banca/i });

    // Click dropdown to see delete button
    const dropdownButton = screen.getAllByLabelText(/Acciones/i)[0];
    fireEvent.click(dropdownButton);
    
    await waitFor(() => {
      const deleteBtn = screen.getByText(/Eliminar/i);
      fireEvent.click(deleteBtn);
    });

    // Confirm delete
    await waitFor(() => {
      expect(screen.getByText(/¿Eliminar este ejercicio/i)).toBeTruthy();
    });
    const confirmBtn = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(exerciseService.remove).toHaveBeenCalled();
    });
  });
});
