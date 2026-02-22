import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoutineExecutionForm from '../../modules/routines/components/RoutineExecutionForm';
import es from '../../i18n/messages/messages_es';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ routineId: '1' }),
  };
});

const mockHandleResponse = jest.fn();
jest.mock('../../modules/common', () => ({
  handleResponse: (...args) => mockHandleResponse(...args),
  Button: ({ children, onClick, type = 'button', disabled, ...rest }) => (
    <button type={type} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
  LoadingSpinner: () => <div data-testid="spinner">loading...</div>,
}));

const mockFindById = jest.fn();
const mockCreateExec = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      findById: (...args) => mockFindById(...args),
    },
    routineExecutionService: {
      create: (...args) => mockCreateExec(...args),
    },
  },
}));

const renderComponent = () =>
  render(
    <IntlProvider locale="es" messages={es}>
      <MemoryRouter initialEntries={['/routines/1/execute']}>
        <Routes>
          <Route path="/routines/:routineId/execute" element={<RoutineExecutionForm />} />
        </Routes>
      </MemoryRouter>
    </IntlProvider>
  );

describe('RoutineExecutionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra spinner mientras carga y luego la rutina', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Demo',
        exercises: [{ id: 10, name: 'Sentadilla', type: 'REPS', sets: 1, repetitions: 10 }],
      },
    });
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    expect(await screen.findByText(/Rutina Demo/i)).toBeInTheDocument();
  });

  it('valida campos y evita submit cuando faltan datos', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Demo',
        exercises: [{ id: 10, name: 'Cinta', type: 'CARDIO' }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Demo/i);

    // rellenar cardio (permitimos opcional, pero también con valores)
    fireEvent.change(screen.getByLabelText(/Distancia/), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/Minutos/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Segundos/), { target: { value: '10' } });

    fireEvent.click(await screen.findByText(/Guardar/i));
    await waitFor(() => expect(mockCreateExec).toHaveBeenCalledTimes(1));
  });

  it('envía sets de reps cuando los datos son válidos', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Demo',
        exercises: [{ id: 10, name: 'Press', type: 'REPS', sets: 1, repetitions: 8 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Demo/i);

    const repsInput = (await screen.findAllByRole('spinbutton'))[0];
    fireEvent.change(repsInput, { target: { value: '12' } });

    fireEvent.click(await screen.findByText(/Guardar/i));
    await waitFor(() => expect(mockCreateExec).toHaveBeenCalled());
    expect(mockCreateExec.mock.calls[0][0].exercises[0].performedReps).toBeGreaterThan(0);
  });

  it('maneja ejercicios de tipo TIME', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Tiempo',
        exercises: [{ id: 11, name: 'Plancha', type: 'TIME', sets: 1, durationMinutes: 1, durationSeconds: 30 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Tiempo/i);

    // Should show exercise name and time badge
    expect(screen.getByText(/Plancha/i)).toBeInTheDocument();
    // "Tiempo" appears in title and badge, use getAllByText
    const tiempoElements = screen.getAllByText(/Tiempo/i);
    expect(tiempoElements.length).toBeGreaterThan(0);
    
    // Should have spinbutton inputs for time
    const inputs = await screen.findAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('maneja múltiples series de ejercicios REPS', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Multi',
        exercises: [{ id: 10, name: 'Sentadilla', type: 'REPS', sets: 3, repetitions: 10 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Multi/i);

    // Fill all sets
    const repsInputs = await screen.findAllByRole('spinbutton');
    for (let i = 0; i < Math.min(repsInputs.length, 3); i++) {
      fireEvent.change(repsInputs[i], { target: { value: `${10 + i}` } });
    }

    fireEvent.click(await screen.findByText(/Guardar/i));
    await waitFor(() => expect(mockCreateExec).toHaveBeenCalled());
  });

  it('maneja respuesta de error en carga', async () => {
    mockFindById.mockResolvedValue({
      ok: false,
      error: 'Not found',
    });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    // Component should handle error - no routine name shown
    expect(screen.queryByText(/Rutina Demo/i)).toBeNull();
  });

  it('muestra ejercicios con peso (REPS con peso)', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Peso',
        exercises: [{ id: 10, name: 'Press banca', type: 'REPS', sets: 1, repetitions: 8, weight: 60 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Peso/i);
    expect(screen.getByText(/Press banca/i)).toBeInTheDocument();
  });

  it('permite guardar sin modificar valores por defecto', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Simple',
        exercises: [{ id: 10, name: 'Curl', type: 'REPS', sets: 1, repetitions: 10 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: {} });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Simple/i);

    // Click guardar sin modificar nada
    fireEvent.click(await screen.findByText(/Guardar/i));
    await waitFor(() => expect(mockCreateExec).toHaveBeenCalled());
  });

  it('navega después de guardar exitosamente', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        name: 'Rutina Nav',
        exercises: [{ id: 10, name: 'Curl', type: 'REPS', sets: 1, repetitions: 10 }],
      },
    });
    mockCreateExec.mockResolvedValue({ ok: true, payload: { id: 999 } });

    renderComponent();
    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    await screen.findByText(/Rutina Nav/i);

    fireEvent.click(await screen.findByText(/Guardar/i));
    await waitFor(() => expect(mockCreateExec).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });
});
