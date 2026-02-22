import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import RoutineExecutionsList from '../../modules/routines/components/RoutineExecutionsList';
import es from '../../i18n/messages/messages_es';
import backend from '../../backend';
import { handleResponse, showError } from '../../modules/common';

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineExecutionService: {
      findByUser: jest.fn(),
    },
  },
}));

jest.mock('../../modules/common', () => ({
  __esModule: true,
  handleResponse: jest.fn(),
  showError: jest.fn(),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

describe('RoutineExecutionsList', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  function renderSubject() {
    return render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <RoutineExecutionsList />
        </MemoryRouter>
      </IntlProvider>
    );
  }

  it('renders a loading spinner initially', () => {
    backend.routineExecutionService.findByUser.mockResolvedValue({ ok: true, payload: [] });
    renderSubject();

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders empty state when no executions exist', async () => {
    backend.routineExecutionService.findByUser.mockResolvedValue({ ok: true, payload: [] });
    renderSubject();

    expect(await screen.findByText(/Historial de rutinas/i)).toBeTruthy();
    expect(screen.getByText(/Aún no has registrado ninguna rutina/i)).toBeTruthy();

    expect(handleResponse).toHaveBeenCalledWith(expect.anything(), { showSuccessToast: false });
  });

  it('renders executions list with routine name and exercises count', async () => {
    backend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload: [
        {
          id: 123,
          routineName: 'Rutina A',
          performedAt: null,
          exercises: [{ id: 1 }, { id: 2 }],
        },
      ],
    });

    renderSubject();

    expect(await screen.findByText('Rutina A')).toBeTruthy();
    expect(screen.getByText(/Fecha no disponible/i)).toBeTruthy();
    expect(screen.getByText(/2\s+ejercicios/i)).toBeTruthy();

    const link = screen.getByRole('link', { name: /Rutina A/i });
    expect(link).toHaveAttribute('href', '/routines/executions/123');
  });

  it('shows an error toast when backend returns not ok', async () => {
    backend.routineExecutionService.findByUser.mockResolvedValue({ ok: false, payload: null });
    renderSubject();

    await waitFor(() => {
      expect(showError).toHaveBeenCalled();
    });

    expect(showError.mock.calls[0][0]).toMatch(/No se pudieron cargar las rutinas realizadas/i);
  });
});
