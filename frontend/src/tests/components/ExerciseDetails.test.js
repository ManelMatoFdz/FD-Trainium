import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock appFetch to simulate backend response used by exerciseService
jest.mock('../../backend/appFetch', () => ({
  appFetch: (path, options, onSuccess /*, onErrors*/ ) => {
    // Simulate a detailed exercise payload for any call
    onSuccess({
      id: 123,
      name: 'Dominadas',
      material: 'Barra de dominadas',
      muscles: ['BACK', 'BICEPS'],
      description: 'Ejercicio de tracción para espalda y bíceps',
      image: 'data:image/png;base64,xxx',
    });
  },
  fetchConfig: () => ({}),
}));

import ExerciseDetails from '../../modules/exercises/components/ExerciseDetails';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('ExerciseDetails', () => {
  it('muestra detalles completos del ejercicio', async () => {
    const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin' } } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={["/exercises/123"]}>
            <Routes>
              <Route path="/exercises/:exerciseId" element={<ExerciseDetails />} />
            </Routes>
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );

    // Loading state visible initially (spinner role status)
    expect(screen.getByRole('status', { name: /Cargando/i })).toBeTruthy();

    // Then the fetched exercise fields appear
    await waitFor(() => {
      // Title with name (unique heading)
      expect(screen.getByRole('heading', { name: /Dominadas/i })).toBeTruthy();
      // Info rows
      expect(screen.getByText(/ID/i)).toBeTruthy();
      expect(screen.getByText('123')).toBeTruthy();
      expect(screen.getByText(/Nombre/i)).toBeTruthy();
      expect(screen.getAllByText(/Dominadas/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Material/i)).toBeTruthy();
      expect(screen.getByText(/Barra de dominadas/i)).toBeTruthy();
      expect(screen.getByText(/(Grupos Musculares|Muscle groups)/i)).toBeTruthy();
      expect(screen.getByText(/^ESPALDA$/i)).toBeTruthy();
      expect(screen.getByText(/^B[ií]ceps$/i)).toBeTruthy();
      expect(screen.getByText(/(Descripción|Description)/i)).toBeTruthy();
      expect(screen.getByText(/tracción/i)).toBeTruthy();

      // Admin actions
      expect(screen.getByRole('button', { name: /Volver/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Editar/i })).toBeTruthy();
    });
  });
});
