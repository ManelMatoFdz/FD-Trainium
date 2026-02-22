import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import SavedUsers from '../../modules/routines/components/SavedUsers';

jest.useFakeTimers();

const mockGetUsersWhoSavedRoutine = jest.fn();
jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      getUsersWhoSavedRoutine: (...args) => mockGetUsersWhoSavedRoutine(...args),
    },
  },
}));

jest.mock('../../modules/common', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  LoadingSpinner: () => <div data-testid="spinner">loading...</div>,
}));

jest.mock('../../modules/routines/components/UsersTable', () => ({ list }) => (
  <div data-testid="users-table">
    {list.map((u) => (
      <div key={u.id}>{u.userName}</div>
    ))}
  </div>
));

describe('SavedUsers', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la lista de usuarios que guardaron la rutina', async () => {
    mockGetUsersWhoSavedRoutine.mockResolvedValue({
      ok: true,
      payload: { items: [{ id: 1, userName: 'alice' }, { id: 2, userName: 'bob' }] },
    });

    render(<SavedUsers routineId={10} onClose={onClose} />);

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(mockGetUsersWhoSavedRoutine).toHaveBeenCalledWith(10));
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('cierra el popup al pulsar cerrar', async () => {
    mockGetUsersWhoSavedRoutine.mockResolvedValue({ ok: true, payload: { items: [] } });
    render(<SavedUsers routineId={5} onClose={onClose} />);

    fireEvent.click(screen.getByText(/Cerrar/i));
    await act(async () => {
      jest.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
