import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import ExecutionCalendar from '../../modules/routines/components/ExecutionCalendar';
import es from '../../i18n/messages/messages_es';

describe('ExecutionCalendar', () => {
  const originalLanguages = navigator.languages;
  const originalLanguage = navigator.language;

  afterEach(() => {
    Object.defineProperty(navigator, 'languages', { value: originalLanguages, configurable: true });
    Object.defineProperty(navigator, 'language', { value: originalLanguage, configurable: true });
  });

  it('renders header and empty day details', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={[]} />
        </MemoryRouter>
      </IntlProvider>
    );
    expect(screen.getByText(/Calendario de Rutinas/i)).toBeTruthy();
    expect(screen.getByText(/No hay rutinas registradas/i)).toBeTruthy();
    // Mocked calendar should be present
    expect(screen.getByTestId('mock-calendar')).toBeTruthy();
  });

  it('renders executions list for selected date', () => {
    const todayIso = new Date().toISOString();
    const executions = [
      {
        id: 1,
        routineName: 'Rutina Pecho',
        performedAt: todayIso,
        totalDurationSec: 1200,
        exercises: [{ id: 'e1' }],
      },
    ];

    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={executions} />
        </MemoryRouter>
      </IntlProvider>
    );

    // Ahora debería mostrar el mensaje de lista vacía o la rutina en la sección de detalles
    expect(screen.getByText(/Rutina Pecho/i)).toBeTruthy();
  });

  it('applies locale mapping for browser locale and marks days with executions', () => {
    Object.defineProperty(navigator, 'languages', { value: ['gl-ES'], configurable: true });
    Object.defineProperty(navigator, 'language', { value: 'gl-ES', configurable: true });

    const executions = [
      {
        id: 1,
        routineName: 'Rutina X',
        performedAt: '2025-01-15T10:00:00.000Z',
        totalDurationSec: 120,
        exercises: [{ id: 'e1' }],
      },
    ];

    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={executions} />
        </MemoryRouter>
      </IntlProvider>
    );

    const calendar = screen.getByTestId('mock-calendar');
    expect(calendar.getAttribute('data-locale')).toBe('es');
    expect(calendar.getAttribute('data-tile-class')).toBe('has-executions');
    expect(screen.getByTestId('mock-tile-content')).toBeTruthy();
  });

  it('uses onDateChange/onSelectDate when provided', () => {
    const onDateChange = jest.fn();
    const onSelectDate = jest.fn();
    const selectedDate = new Date('2025-01-01T00:00:00.000Z');

    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar
            executions={[]}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onSelectDate={onSelectDate}
          />
        </MemoryRouter>
      </IntlProvider>
    );

    fireEvent.click(screen.getByTestId('mock-calendar-change'));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledTimes(1);
  });

  it('displays calendar header correctly', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={[]} />
        </MemoryRouter>
      </IntlProvider>
    );

    expect(screen.getByText(/Calendario de Rutinas/i)).toBeTruthy();
  });

  it('shows mock calendar component', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={[]} />
        </MemoryRouter>
      </IntlProvider>
    );

    expect(screen.getByTestId('mock-calendar')).toBeTruthy();
  });

  it('renders with multiple executions', () => {
    const todayIso = new Date().toISOString();
    const executions = [
      {
        id: 1,
        routineName: 'Rutina Pecho',
        performedAt: todayIso,
        totalDurationSec: 1200,
        exercises: [{ id: 'e1' }],
      },
      {
        id: 2,
        routineName: 'Rutina Espalda',
        performedAt: todayIso,
        totalDurationSec: 1500,
        exercises: [{ id: 'e2' }],
      },
    ];

    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <ExecutionCalendar executions={executions} />
        </MemoryRouter>
      </IntlProvider>
    );

    expect(screen.getByText(/Rutina Pecho/i)).toBeTruthy();
    expect(screen.getByText(/Rutina Espalda/i)).toBeTruthy();
  });
});

