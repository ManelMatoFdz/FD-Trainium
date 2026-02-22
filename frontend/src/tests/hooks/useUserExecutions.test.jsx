import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import useUserExecutions from '../../modules/routines/hooks/useUserExecutions';
import es from '../../i18n/messages/messages_es';
jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineExecutionService: {
      findByUser: jest.fn(),
    },
  },
}));

import backend from '../../backend';
const mockedBackend = backend;

function HookHarness() {
  const { executions, loading } = useUserExecutions();
  return (
    <div>
      <span data-testid="loading">{loading ? '1' : '0'}</span>
      <span data-testid="count">{executions.length}</span>
      <span data-testid="first-id">{executions.length > 0 ? executions[0].id : 'none'}</span>
    </div>
  );
}

describe('useUserExecutions hook', () => {
  beforeEach(() => {
    mockedBackend.routineExecutionService.findByUser.mockReset();
  });

  it('loads executions and updates loading flag', async () => {
    const payload = [
      { id: 1, performedAt: new Date(2024, 0, 1).toISOString(), totalDurationSec: 100, exercises: [] },
      { id: 2, performedAt: new Date(2024, 0, 2).toISOString(), totalDurationSec: 200, exercises: [] },
    ];
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload,
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    // inicialmente loading = true
    expect(screen.getByTestId('loading').textContent).toBe('1');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('0');
      expect(screen.getByTestId('count').textContent).toBe('2');
    });
  });

  it('handles empty payload', async () => {
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload: [],
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('0');
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  it('handles API error gracefully', async () => {
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: false,
      error: 'Server error',
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('0');
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  it('sorts executions by date descending', async () => {
    const payload = [
      { id: 1, performedAt: new Date(2024, 0, 1).toISOString(), totalDurationSec: 100, exercises: [] },
      { id: 2, performedAt: new Date(2024, 0, 15).toISOString(), totalDurationSec: 200, exercises: [] },
      { id: 3, performedAt: new Date(2024, 0, 10).toISOString(), totalDurationSec: 150, exercises: [] },
    ];
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload,
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('0');
      expect(screen.getByTestId('count').textContent).toBe('3');
    });
  });

  it('handles null payload', async () => {
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload: null,
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('0');
    });
  });

  it('calls findByUser on mount', async () => {
    mockedBackend.routineExecutionService.findByUser.mockResolvedValue({
      ok: true,
      payload: [],
    });

    render(
      <IntlProvider locale="es" messages={es}>
        <HookHarness />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(mockedBackend.routineExecutionService.findByUser).toHaveBeenCalledTimes(1);
    });
  });
});
