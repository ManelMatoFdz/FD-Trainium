import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import SavedRoutineList from '../../modules/routines/components/SavedRoutineList';
import es from '../../i18n/messages/messages_es';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

// Mock child components to reduce complexity
jest.mock('../../modules/routines/components/RoutineTable', () => ({ list, onDelete, isLoading }) => (
  <div data-testid="routine-table">
    {isLoading ? 'loading...' : null}
    {list.map((r) => (
      <div key={r.id} data-testid="routine-row">
        <span>{r.name}</span>
        <button onClick={() => onDelete(r)}>delete</button>
      </div>
    ))}
  </div>
));

jest.mock('../../modules/common/components/Paginacion', () => ({ page, setPage, existMoreItems }) => (
  <div data-testid="pagination">
    <span>page:{page}</span>
    <button onClick={() => setPage(page + 1)} disabled={!existMoreItems}>
      next
    </button>
  </div>
));

// Mock ConfirmModal to expose props and simulate confirm
jest.mock('../../modules/common', () => ({
  handleResponse: jest.fn(),
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  ConfirmModal: ({ isOpen, onConfirm, onClose, title }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        <button onClick={onConfirm}>confirm</button>
        <button onClick={onClose}>close</button>
      </div>
    ) : null,
  useUrlPagination: () => ({ page: 0, setPage: jest.fn() }),
}));

const mockSaved = jest.fn();
const mockRemove = jest.fn();
const mockFindAllCategories = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      savedRoutines: (...args) => mockSaved(...args),
      remove: (...args) => mockRemove(...args),
      findAllCategories: (...args) => mockFindAllCategories(...args),
    },
  },
}));

const renderComponent = () =>
  render(
    <IntlProvider locale="es" messages={es}>
      <MemoryRouter>
        <SavedRoutineList />
      </MemoryRouter>
    </IntlProvider>
  );

describe('SavedRoutineList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAllCategories.mockImplementation((onSuccess) => onSuccess([{ id: 1, name: 'Fuerza' }]));
  });

  it('carga y muestra rutinas guardadas', async () => {
    mockSaved.mockResolvedValue({
      ok: true,
      payload: { items: [{ id: 1, name: 'Rutina A' }], existMoreItems: false },
    });

    renderComponent();

    await waitFor(() => expect(mockSaved).toHaveBeenCalled());
    expect(await screen.findByText('Rutina A')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('abre modal de confirmación y elimina rutina', async () => {
    mockSaved.mockResolvedValue({
      ok: true,
      payload: { items: [{ id: 2, name: 'Rutina B' }], existMoreItems: false },
    });
    mockRemove.mockResolvedValue({ ok: true, payload: null });

    renderComponent();
    await waitFor(() => expect(mockSaved).toHaveBeenCalled());
    const deleteBtn = await screen.findByText('delete');
    fireEvent.click(deleteBtn);
    expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('confirm'));
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith(2));
  });
});
