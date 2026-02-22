import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import RoutineExecutionDetail from '../../modules/routines/components/RoutineExecutionDetails';
import es from '../../i18n/messages/messages_es';

const mockFindById = jest.fn();
const mockFindPublicById = jest.fn();
const mockFindExerciseById = jest.fn();
const mockLike = jest.fn();
const mockUnlike = jest.fn();
const mockGetLikers = jest.fn();
const mockGetComments = jest.fn();
const mockAddComment = jest.fn();
const mockDeleteComment = jest.fn();
const mockUpdateComment = jest.fn();

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: (fn) => fn({ users: { user: { id: 5, userName: 'tester' } } }),
  };
});

jest.mock('../../modules/common', () => {
  // Export only the pieces used by the component
  return {
    handleResponse: () => {},
    Button: ({ children, ...props }) => <button {...props}>{props.label || children}</button>,
    ButtonGroup: ({ primaryActions }) => (
      <div>
        {primaryActions.map((a, idx) => {
          const label =
            typeof a.label === 'string'
              ? a.label
              : a.label?.props?.defaultMessage || 'btn';
          return (
            <button
              key={idx}
              onClick={a.onClick}
              disabled={a.disabled}
              aria-label={label}
            >
              {label}
            </button>
          );
        })}
      </div>
    ),
    LoadingSpinner: () => <div>loading...</div>,
  };
});

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineExecutionService: {
      findById: (...args) => mockFindById(...args),
      findPublicById: (...args) => mockFindPublicById(...args),
      like: (...args) => mockLike(...args),
      unlike: (...args) => mockUnlike(...args),
      getLikers: (...args) => mockGetLikers(...args),
      getComments: (...args) => mockGetComments(...args),
      addComment: (...args) => mockAddComment(...args),
      deleteComment: (...args) => mockDeleteComment(...args),
      updateComment: (...args) => mockUpdateComment(...args),
    },
    exerciseService: {
      findById: (...args) => mockFindExerciseById(...args),
    },
  },
}));

const renderWithRouter = (ui, path = '/routines/executions/1') =>
  render(
    <IntlProvider locale="es" messages={es}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/routines/executions/:executionId" element={ui} />
        </Routes>
      </MemoryRouter>
    </IntlProvider>
  );

describe('RoutineExecutionDetails (pre-comments)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra los detalles de la ejecución y los ejercicios', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        routineName: 'Rutina Demo',
        userId: 5,
        likesCount: 0,
        likedByCurrentUser: false,
        performedAt: new Date(2024, 0, 2).toISOString(),
        exercises: [
          {
            exerciseId: 10,
            performedSets: 3,
            performedReps: 12,
            weightUsed: 20,
            notes: 'ok',
          },
        ],
      },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({
      ok: true,
      payload: { id: 10, name: 'Curl Biceps', muscles: ['BICEPS'] },
    });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });

    renderWithRouter(<RoutineExecutionDetail />);

    await waitFor(() => expect(mockFindById).toHaveBeenCalled());

    expect(await screen.findByText('Rutina Demo')).toBeInTheDocument();
    const exerciseRow = screen.getByText(/Curl Biceps/i).closest('tr');
    expect(exerciseRow).not.toBeNull();
    expect(within(exerciseRow).getByText('12')).toBeInTheDocument();
  });

  it('muestra aviso de no encontrado si no hay ejecución', async () => {
    mockFindById.mockResolvedValue({ ok: false });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });

    renderWithRouter(<RoutineExecutionDetail />);

    await waitFor(() => expect(mockFindById).toHaveBeenCalled());

    expect(
      await screen.findByText(/No se encontró la ejecución/i)
    ).toBeInTheDocument();
  });

  // ===== Tests de comentarios (fallarán hasta implementar comentarios en el componente) =====

  it('muestra la lista de comentarios existentes', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        routineName: 'Rutina Demo',
        userId: 5,
        likesCount: 0,
        likedByCurrentUser: false,
        exercises: [],
      },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({
      ok: true,
      payload: [
        { id: 101, userId: 42, userName: 'alice', text: 'Buen trabajo' },
        { id: 102, userId: 43, userName: 'bob', text: 'Gran progreso' },
      ],
    });

    renderWithRouter(<RoutineExecutionDetail />);

    expect(await screen.findByText(/Buen trabajo/i)).toBeInTheDocument();
    expect(screen.getByText(/Gran progreso/i)).toBeInTheDocument();
    const userLink = screen.getByRole('link', { name: /alice/i });
    expect(userLink).toHaveAttribute('href', '/users/42');
  });

  it('permite publicar un comentario nuevo', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });
    mockAddComment.mockResolvedValue({
      ok: true,
      payload: { id: 201, userId: 5, userName: 'tester', text: 'Mi comentario' },
    });

    renderWithRouter(<RoutineExecutionDetail />);

    const input = await screen.findByPlaceholderText(/Publicar/i);
    const button = screen.getByRole('button', { name: /Publicar/i });

    // Simular escribir en el input usando fireEvent (la forma correcta para testing-library)
    fireEvent.change(input, { target: { value: 'Mi comentario' } });
    fireEvent.click(button);

    await waitFor(() => expect(mockAddComment).toHaveBeenCalledWith(1, 'Mi comentario'));
    expect(await screen.findByText(/Mi comentario/i)).toBeInTheDocument();
  });

  it('el autor puede borrar su comentario', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({
      ok: true,
      payload: [{ id: 301, userId: 5, userName: 'tester', text: 'Voy a borrar esto' }],
    });
    mockDeleteComment.mockResolvedValue({ ok: true });

    renderWithRouter(<RoutineExecutionDetail />);

    const menuBtn = await screen.findByRole('button', { name: /Acciones del comentario/i });
    fireEvent.click(menuBtn);
    const deleteBtn = await screen.findByText(/Eliminar comentario/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(mockDeleteComment).toHaveBeenCalledWith(301));
  });

  it('el autor puede editar su comentario', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({
      ok: true,
      payload: [{ id: 401, userId: 5, userName: 'tester', text: 'Texto inicial' }],
    });
    mockUpdateComment.mockResolvedValue({
      ok: true,
      payload: { id: 401, userId: 5, userName: 'tester', text: 'Texto editado' },
    });

    renderWithRouter(<RoutineExecutionDetail />);

    const menuBtn = await screen.findByRole('button', { name: /Acciones del comentario/i });
    fireEvent.click(menuBtn);
    const editBtn = await screen.findByText(/Editar comentario/i);
    fireEvent.click(editBtn);

    // El input de edición usa defaultValue, así que usamos findByDisplayValue con waitFor
    const input = await screen.findByDisplayValue(/Texto inicial/i);
    fireEvent.change(input, { target: { value: 'Texto editado' } });
    const saveBtn = screen.getByRole('button', { name: /Guardar comentario/i });
    fireEvent.click(saveBtn);

    await waitFor(() => expect(mockUpdateComment).toHaveBeenCalledWith(401, 'Texto editado'));
    expect(await screen.findByText(/Texto editado/i)).toBeInTheDocument();
  });

  it('abre y cierra el men\ufffde de acciones al hacer clic fuera', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({
      ok: true,
      payload: [{ id: 501, userId: 5, userName: 'tester', text: 'Con men\ufffde' }],
    });

    renderWithRouter(<RoutineExecutionDetail />);

    const menuBtn = await screen.findByRole('button', { name: /Acciones del comentario/i });
    fireEvent.click(menuBtn);
    expect(await screen.findByText(/Editar comentario/i)).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByText(/Editar comentario/i)).not.toBeInTheDocument());
  });

  it('permite ver la lista de usuarios que dieron like', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 2, likedByCurrentUser: true, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });
    mockGetLikers.mockResolvedValue({ ok: true, payload: ['mateo', 'lucia'] });

    renderWithRouter(<RoutineExecutionDetail />);

    const viewBtn = (await screen.findAllByRole('button', { name: /Ver/i }))[0];
    fireEvent.click(viewBtn);
    await waitFor(() => expect(mockGetLikers).toHaveBeenCalled());
    expect(await screen.findByText(/mateo/i)).toBeInTheDocument();
    expect(screen.getByText(/lucia/i)).toBeInTheDocument();
  });

  it('alternar like y unlike actualiza el estado', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({ ok: true, payload: { id: 10, name: 'Curl', muscles: [] } });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });
    mockLike.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 1, likedByCurrentUser: true, exercises: [] },
    });
    mockUnlike.mockResolvedValue({
      ok: true,
      payload: { id: 1, routineName: 'Rutina Demo', userId: 5, likesCount: 0, likedByCurrentUser: false, exercises: [] },
    });

    renderWithRouter(<RoutineExecutionDetail />);

    const likeBtn = await screen.findByRole('button', { name: /^0$/ });
    fireEvent.click(likeBtn);
    await waitFor(() => expect(mockLike).toHaveBeenCalled());
    const likedBtn = await screen.findByRole('button', { name: /^1$/ });
    fireEvent.click(likedBtn);
    await waitFor(() => expect(mockUnlike).toHaveBeenCalled());
  });

  it('muestra cardio con distancia y tiempo', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: {
        id: 1,
        routineName: 'Cardio Suave',
        userId: 5,
        likesCount: 0,
        likedByCurrentUser: false,
        exercises: [
          {
            exerciseId: 77,
            type: 'CARDIO',
            distanceMeters: 2000,
            durationSeconds: 780,
            notes: 'Correr en parque',
          },
        ],
      },
    });
    mockFindPublicById.mockResolvedValue({ ok: false });
    mockFindExerciseById.mockResolvedValue({
      ok: true,
      payload: { id: 77, name: 'Correr', muscles: [] },
    });
    mockGetComments.mockResolvedValue({ ok: true, payload: [] });

    renderWithRouter(<RoutineExecutionDetail />);

    await waitFor(() => expect(mockFindById).toHaveBeenCalled());
    expect(await screen.findByText(/Cardio Suave/i)).toBeInTheDocument();
    expect(screen.getByText(/Correr/i)).toBeInTheDocument();
    expect(screen.getByText(/2000 m/i)).toBeInTheDocument();
    expect(screen.getByText(/13:00/)).toBeInTheDocument();
  });
});
