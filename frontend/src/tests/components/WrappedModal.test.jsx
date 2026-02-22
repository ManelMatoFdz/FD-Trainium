import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import WrappedModal, { isWrappedVisible } from '../../modules/users/components/WrappedModal';
import es from '../../i18n/messages/messages_es';
import { getWrapped } from '../../backend/userService';

jest.mock('../../backend/userService', () => ({
  __esModule: true,
  getWrapped: jest.fn(),
}));

jest.mock('../../modules/common', () => ({
  __esModule: true,
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

describe('WrappedModal', () => {
  beforeEach(() => {
    if (!window.HTMLDialogElement) {
      window.HTMLDialogElement = function HTMLDialogElement() {};
    }

    // JSDOM no implementa <dialog>; simulamos la accesibilidad añadiendo/quitarndo el atributo `open`.
    window.HTMLDialogElement.prototype.showModal = jest.fn(function showModal() {
      this.setAttribute('open', '');
    });

    window.HTMLDialogElement.prototype.close = jest.fn(function close() {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
    delete process.env.REACT_APP_WRAPPED_START_DATE;
    delete process.env.REACT_APP_WRAPPED_END_DATE;
  });

  function renderSubject(props = {}) {
    const onClose = props.onClose || jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <WrappedModal onClose={onClose} year={props.year} />
      </IntlProvider>
    );
    return { onClose };
  }

  it('renders loading then intro section on success', async () => {
    getWrapped.mockImplementation((_year, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          topExercises: [{ id: 1, name: 'Press banca', count: 3 }],
          topRoutines: [],
          topTrainers: [],
          totalKgLifted: 1000,
          totalHoursTrained: 12.5,
          bestFriend: null,
        });
      }, 0);
    });

    renderSubject({ year: 2025 });

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('wrapped-section-intro')).toBeTruthy();
    });

    expect(window.HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('shows error state when backend fails', async () => {
    getWrapped.mockImplementation((_year, _onSuccess, onError) => {
      setTimeout(() => onError(new Error('boom')), 0);
    });

    renderSubject({ year: 2025 });

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar/i)).toBeTruthy();
    });
  });

  it('navigates between sections with next/prev and dots', async () => {
    getWrapped.mockImplementation((_year, onSuccess) => {
      onSuccess({
        topExercises: [{ id: 1, name: 'Press banca', count: 3 }],
        topRoutines: [{ id: 2, name: 'Full body', count: 2 }],
        topTrainers: [{ id: 3, userName: 'trainer1', routineCount: 4 }],
        totalKgLifted: 1000,
        totalHoursTrained: 12.5,
        bestFriend: { userName: 'friend', interactionCount: 7 },
      });
    });

    renderSubject({ year: 2025 });

    expect(await screen.findByTestId('wrapped-section-intro')).toBeTruthy();

    const dotButtons = screen.getAllByRole('button', { name: /Go to section/i });
    expect(dotButtons.length).toBe(6);

    // Next should go to exercises
    fireEvent.click(screen.getByRole('button', { name: /Next section/i }));
    expect(await screen.findByTestId('wrapped-section-exercises')).toBeTruthy();

    // Dot to stats
    fireEvent.click(screen.getByRole('button', { name: /Go to section 5/i }));
    expect(await screen.findByTestId('wrapped-section-stats')).toBeTruthy();

    // Prev should move back
    fireEvent.click(screen.getByRole('button', { name: /Previous section/i }));
    expect(await screen.findByTestId('wrapped-section-trainers')).toBeTruthy();
  });

  it('close button closes dialog and calls onClose', async () => {
    getWrapped.mockImplementation((_year, onSuccess) => {
      onSuccess({ topExercises: [], topRoutines: [], topTrainers: [] });
    });

    const { onClose } = renderSubject({ year: 2025 });

    expect(await screen.findByTestId('wrapped-section-intro')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));

    expect(window.HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('isWrappedVisible', () => {
  afterEach(() => {
    jest.useRealTimers();
    delete process.env.REACT_APP_WRAPPED_START_DATE;
    delete process.env.REACT_APP_WRAPPED_END_DATE;
  });

  it('returns true for default wrap-around range (Dec 22 - Jan 10)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-12-25T12:00:00.000Z'));
    expect(isWrappedVisible()).toBe(true);

    jest.setSystemTime(new Date('2026-01-05T12:00:00.000Z'));
    expect(isWrappedVisible()).toBe(true);

    jest.setSystemTime(new Date('2026-02-01T12:00:00.000Z'));
    expect(isWrappedVisible()).toBe(false);
  });

  it('supports a non-wrap range via env vars', () => {
    process.env.REACT_APP_WRAPPED_START_DATE = '03-01';
    process.env.REACT_APP_WRAPPED_END_DATE = '03-10';

    jest.useFakeTimers().setSystemTime(new Date('2025-03-05T12:00:00.000Z'));
    expect(isWrappedVisible()).toBe(true);

    jest.setSystemTime(new Date('2025-03-20T12:00:00.000Z'));
    expect(isWrappedVisible()).toBe(false);
  });
});
