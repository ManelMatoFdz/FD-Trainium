import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import RoutineDetails from '../../modules/routines/components/RoutineDetails';
import es from '../../i18n/messages/messages_es';

const mockFindById = jest.fn();
const mockSavedRoutines = jest.fn();
const mockSave = jest.fn();
const mockUnsave = jest.fn();
const mockRemove = jest.fn();
const mockIsFollowing = jest.fn();
const mockFollow = jest.fn();
const mockUnfollow = jest.fn();

jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      findById: (...args) => mockFindById(...args),
      savedRoutines: (...args) => mockSavedRoutines(...args),
      save: (...args) => mockSave(...args),
      unsave: (...args) => mockUnsave(...args),
      remove: (...args) => mockRemove(...args),
    },
    userService: {
      isFollowingUser: (...args) => mockIsFollowing(...args),
      followUser: (...args) => mockFollow(...args),
      unfollowUser: (...args) => mockUnfollow(...args),
    },
  },
}));

jest.mock('../../modules/common', () => {
  const actual = jest.requireActual('../../modules/common');
  return {
    ...actual,
    handleResponse: jest.fn(),
    Button: ({ children, label, ...props }) => (
      <button {...props}>{children || label}</button>
    ),
    ButtonGroup: ({ primaryActions = [], dropdownActions = [] }) => (
      <div>
        {primaryActions.map((a, idx) => (
          <button key={`p-${idx}`} onClick={a.onClick} disabled={a.disabled}>
            {typeof a.label === 'string' || typeof a.label === 'number'
              ? a.label
              : a.label?.props?.defaultMessage || `p-${idx}`}
          </button>
        ))}
        {dropdownActions.map((a, idx) => (
          <button key={`d-${idx}`} onClick={a.onClick} disabled={a.disabled}>
            {typeof a.label === 'string'
              ? a.label
              : a.label?.props?.defaultMessage || `d-${idx}`}
          </button>
        ))}
      </div>
    ),
    ConfirmModal: ({ isOpen, title, onConfirm, onCancel }) =>
      isOpen ? (
        <div role="dialog">
          <div>{title || 'modal'}</div>
          <button onClick={onConfirm}>confirmar</button>
          <button onClick={onCancel}>cancelar</button>
        </div>
      ) : null,
    LoadingSpinner: () => <div>loading...</div>,
  };
});

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useParams: () => ({ routineId: '1' }),
  };
});

jest.mock('../../modules/users/components/FollowButton', () => (props) => (
  <button
    aria-label="follow"
    onClick={props.onToggleFollow || (() => {})}
    disabled={props.disabled}
  >
    follow
  </button>
));

const makeStore = (user) =>
  configureStore({
    reducer: () => ({ users: { user } }),
  });

const renderPage = (store) =>
  render(
    <Provider store={store}>
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter initialEntries={['/routines/1']}>
          <RoutineDetails />
        </MemoryRouter>
      </IntlProvider>
    </Provider>
  );

describe('RoutineDetails actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite guardar y eliminar de guardados', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, name: 'Rutina Guardable', userId: 2, userRole: 'USER', exercises: [] },
    });
    mockIsFollowing.mockImplementation((_id, onOk) => onOk(false));
    mockSavedRoutines.mockResolvedValue({ ok: true, payload: { items: [] } });
    mockSave.mockResolvedValue({ ok: true });

    const store = makeStore({ id: 3, role: 'USER' });
    renderPage(store);

    const saveBtn = await screen.findByRole('button', { name: /Guardar rutina/i });
    fireEvent.click(saveBtn);
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith(1));

    mockUnsave.mockResolvedValue({ ok: true });
    // Simular que ahora esta guardada
    mockSavedRoutines.mockResolvedValue({ ok: true, payload: { items: [{ id: 1 }] } });
    renderPage(store);
    const unsaveBtns = await screen.findAllByRole('button', { name: /Eliminar de guardados/i });
    fireEvent.click(unsaveBtns[0]);
    await waitFor(() => expect(mockUnsave).toHaveBeenCalledWith(1));
  });

  it('muestra no encontrada cuando findById falla', async () => {
    mockFindById.mockResolvedValue({ ok: false });
    mockIsFollowing.mockImplementation((_id, onOk) => onOk(false));
    mockSavedRoutines.mockResolvedValue({ ok: true, payload: { items: [] } });
    const store = makeStore({ id: 3, role: 'USER' });

    renderPage(store);

    expect(
      await screen.findByText(/No se ha encontrado la rutina solicitada/i)
    ).toBeInTheDocument();
  });

  it('abre modal de borrado y confirma', async () => {
    mockFindById.mockResolvedValue({
      ok: true,
      payload: { id: 1, name: 'Rutina Borrable', userId: 5, userRole: 'USER', exercises: [] },
    });
    mockIsFollowing.mockImplementation((_id, onOk) => onOk(false));
    mockSavedRoutines.mockResolvedValue({ ok: true, payload: { items: [] } });
    mockRemove.mockResolvedValue({ ok: true });

    const store = makeStore({ id: 5, role: 'USER' });
    renderPage(store);

    const deleteBtn = await screen.findByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteBtn);
    const confirmBtn = await screen.findByText(/confirmar/i);
    fireEvent.click(confirmBtn);
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith(1));
  });
});
