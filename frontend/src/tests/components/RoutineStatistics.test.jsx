import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import RoutineStatistics from '../../modules/routines/components/RoutineStatistics';
import messagesEs from '../../i18n/messages/messages_es';
import useUserExecutions from '../../modules/routines/hooks/useUserExecutions';

jest.mock('../../modules/routines/hooks/useUserExecutions');
jest.mock('../../modules/routines/components/ExecutionStatistics', () => () => (
  <div data-testid="execution-statistics" />
));
jest.mock('../../modules/routines/components/ExecutionCalendar', () => (props) => (
  <div data-testid="execution-calendar" data-selected={props.selectedDate?.toISOString?.()} />
));

const mockExecutions = [
  {
    id: 1,
    routineName: 'Rutina Core y Estabilidad',
    performedAt: '2025-11-05T00:41:00Z',
    totalDurationSec: 1800,
    exercises: [{}, {}, {}]
  },
  {
    id: 2,
    routineName: 'Rutina Principiantes',
    performedAt: '2025-11-03T14:00:00Z',
    totalDurationSec: 900,
    exercises: [{}]
  }
];

const renderComponent = () =>
  render(
    <IntlProvider locale="es" messages={messagesEs}>
      <MemoryRouter>
        <RoutineStatistics />
      </MemoryRouter>
    </IntlProvider>
  );

describe('RoutineStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserExecutions.mockReturnValue({
      loading: false,
      executions: mockExecutions
    });
  });

  it('muestra las tarjetas de resumen y no renderiza el enlace de volver', () => {
    renderComponent();

    const routinesCard = screen.getByText('Entrenamientos').closest('.summary-card');
    expect(routinesCard).toHaveTextContent('2');

    const totalTimeCard = screen.getByText('Tiempo total').closest('.summary-card');
    expect(totalTimeCard).toHaveTextContent('45m');
    expect(screen.queryByRole('link', { name: /historial/i })).toBeNull();
  });

  it('muestra la actividad del día más reciente con su enlace a detalle', () => {
    renderComponent();

    const dayCard = screen.getByText(/Rutinas del/i).closest('.stats-day-card');
    expect(dayCard).toBeTruthy();

    const cardUtils = within(dayCard);
    expect(cardUtils.getByText('30m')).toBeInTheDocument();
    expect(cardUtils.getByText(/3 ejercicios/i)).toBeInTheDocument();

    const detailLink = cardUtils
      .getAllByRole('link', { name: /ver detalle/i })
      .find((link) => link.getAttribute('href') === '/routines/executions/1');
    expect(detailLink).toBeTruthy();
  });

  it('muestra spinner cuando loading=true', () => {
    useUserExecutions.mockReturnValue({ loading: true, executions: [] });
    renderComponent();
    expect(screen.getByLabelText(/Cargando historial/i)).toBeInTheDocument();
  });

  it('muestra mensajes vacíos cuando no hay ejecuciones', () => {
    useUserExecutions.mockReturnValue({ loading: false, executions: [] });
    renderComponent();
    expect(screen.getByText(/Todavía no hay estadísticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Completa tu primera rutina/i)).toBeInTheDocument();
  });
});
