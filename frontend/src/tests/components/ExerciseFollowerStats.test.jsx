import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import ExerciseFollowerStats from '../../modules/exercises/components/ExerciseFollowerStats';
import messagesEs from '../../i18n/messages/messages_es';

const mockFindAll = jest.fn();
const mockFindPerformed = jest.fn();
const mockGetFollowersStats = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    exerciseService: {
      findPerformed: (...args) => mockFindPerformed(...args),
      findAll: (...args) => mockFindAll(...args),
      getFollowersStats: (...args) => mockGetFollowersStats(...args),
    },
  },
}));

const renderComponent = () =>
  render(
    <IntlProvider locale="es" messages={messagesEs}>
      <MemoryRouter>
        <ExerciseFollowerStats />
      </MemoryRouter>
    </IntlProvider>
  );

describe('ExerciseFollowerStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPerformed.mockResolvedValue({
      ok: true,
      payload: { items: [{ id: 1, name: 'Sentadilla' }, { id: 2, name: 'Press banca' }] },
    });
    mockFindAll.mockResolvedValue({
      ok: true,
      payload: { items: [{ id: 1, name: 'Sentadilla' }, { id: 2, name: 'Press banca' }] },
    });
    mockGetFollowersStats.mockResolvedValue({
      ok: true,
      payload: [
        { userId: 10, userName: 'alice', weightUsed: 120, lastPerformedAt: '2024-01-01T10:00:00Z' },
        { userId: 11, userName: 'bob', weightUsed: 100, lastPerformedAt: '2024-01-02T10:00:00Z' },
      ],
    });
  });

  it('muestra la lista filtrable de ejercicios y carga ranking al seleccionar', async () => {
    renderComponent();

    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());
    // Wait until the loading spinner (if any) disappears so the list state is stable
    await waitFor(() => expect(screen.queryByLabelText(/Cargando/i)).not.toBeInTheDocument());
    expect(await screen.findByText('Sentadilla')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar ejercicio/i);
    fireEvent.change(searchInput, { target: { value: 'Press' } });
    expect(screen.queryByText('Sentadilla')).not.toBeInTheDocument();
    expect(screen.getByText('Press banca')).toBeInTheDocument();

    const viewButtons = screen.getAllByRole('button', { name: /Ver ranking/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => expect(mockGetFollowersStats).toHaveBeenCalledWith(2));
    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(await screen.findByTestId('selected-exercise-name')).toHaveTextContent('Press banca');
  });

  it('usa fallback a findAll cuando findPerformed no devuelve ejercicios', async () => {
    mockFindPerformed.mockResolvedValueOnce({ ok: true, payload: { items: [] } });
    renderComponent();

    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());
    await waitFor(() => expect(mockFindAll).toHaveBeenCalled());
    expect(await screen.findByText('Sentadilla')).toBeInTheDocument();
  });

  it('usa fallback a findAll cuando findPerformed falla', async () => {
    mockFindPerformed.mockResolvedValueOnce({ ok: false, payload: null });
    renderComponent();

    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());
    await waitFor(() => expect(mockFindAll).toHaveBeenCalled());
    expect(await screen.findByText('Sentadilla')).toBeInTheDocument();
  });

  it('muestra tantos items en el ranking como entradas devueltas y formatea la fecha', async () => {
    mockGetFollowersStats.mockResolvedValueOnce({
      ok: true,
      payload: [
        { userId: 1, userName: 'lucia', weightUsed: 15, lastPerformedAt: '2025-11-13T00:00:00Z' },
        { userId: 2, userName: 'mateo', weightUsed: 12, lastPerformedAt: '2025-11-09T00:00:00Z' },
      ],
    });
    renderComponent();

    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());
    const viewButtons = await screen.findAllByRole('button', { name: /Ver ranking/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => expect(mockGetFollowersStats).toHaveBeenCalled());
    const rankingItems = await screen.findAllByRole('listitem');
    expect(rankingItems).toHaveLength(2);
    expect(screen.getByText(/lucia/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2025/)).toHaveLength(2);
  });

  it('muestra mensaje vacio cuando el ranking viene vacio o con error', async () => {
    mockGetFollowersStats.mockResolvedValueOnce({ ok: true, payload: [] });
    renderComponent();
    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());
    const viewButtons = await screen.findAllByRole('button', { name: /Ver ranking/i });
    fireEvent.click(viewButtons[0]);
    await waitFor(() => expect(mockGetFollowersStats).toHaveBeenCalled());
    expect(await screen.findByTestId('ranking-empty')).toBeInTheDocument();

    mockGetFollowersStats.mockResolvedValueOnce({ ok: false, payload: null });
    fireEvent.click(screen.getByRole('tab', { name: /Selecciona un ejercicio/i }));
    const secondButtons = await screen.findAllByRole('button', { name: /Ver ranking/i });
    fireEvent.click(secondButtons[0]);
    await waitFor(() => expect(mockGetFollowersStats).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('ranking-empty')).toBeInTheDocument();
  });

  it('deshabilita la pestana ranking hasta seleccionar y muestra sin resultados al filtrar', async () => {
    renderComponent();
    await waitFor(() => expect(mockFindPerformed).toHaveBeenCalled());

    const rankingTab = screen.getByRole('tab', { name: /Ranking de peso/i });
    expect(rankingTab).toBeDisabled();

    const searchInput = screen.getByPlaceholderText(/Buscar ejercicio/i);
    fireEvent.change(searchInput, { target: { value: 'XYZ' } });
    // Wait until any loading spinner is gone so the empty state is rendered
    await waitFor(() => expect(screen.queryByLabelText(/Cargando/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    const viewButtons = await screen.findAllByRole('button', { name: /Ver ranking/i });
    fireEvent.click(viewButtons[0]);
    await waitFor(() => expect(mockGetFollowersStats).toHaveBeenCalled());
    expect(screen.getByRole('tab', { name: /Ranking de peso/i })).not.toBeDisabled();
  });
});
