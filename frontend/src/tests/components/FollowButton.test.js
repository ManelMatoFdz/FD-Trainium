import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FollowButton from '../../modules/users/components/FollowButton';
import backend from '../../backend';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

jest.mock('../../backend');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const makeStore = (preloadedState) =>
    configureStore({ reducer: (state = preloadedState) => state });

describe('FollowButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('permite seguir a un entrenador y cambia el botón', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(false)
        );
        backend.userService.followUser.mockImplementation(
            (userId, onSuccess) => onSuccess()
        );
        backend.userService.unfollowUser.mockImplementation(
            (userId, onSuccess) => onSuccess()
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const followBtn = await screen.findByRole('button', { name: /Seguir/i });
        expect(followBtn).toBeTruthy();

        fireEvent.click(followBtn);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Dejar de seguir/i })).toBeTruthy();
        });

        fireEvent.click(screen.getByRole('button', { name: /Dejar de seguir/i }));
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Seguir/i })).toBeTruthy();
        });
    });

    it('returns null when userId is not provided', () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        const { container } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={null} />
                </MemoryRouter>
            </Provider>
        );

        expect(container.firstChild).toBeNull();
    });

    it('shows loading state initially', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => {
                setTimeout(() => onSuccess(false), 100);
            }
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        // El botón debería estar deshabilitado mientras carga
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('calls onFollowChange callback when following state changes', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });
        const onFollowChange = jest.fn();

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(false)
        );
        backend.userService.followUser.mockImplementation(
            (userId, onSuccess) => onSuccess()
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} onFollowChange={onFollowChange} />
                </MemoryRouter>
            </Provider>
        );

        const followBtn = await screen.findByRole('button', { name: /Seguir/i });
        fireEvent.click(followBtn);

        await waitFor(() => {
            expect(onFollowChange).toHaveBeenCalledWith(true);
        });
    });

    it('shows success toast when following user', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(false)
        );
        backend.userService.followUser.mockImplementation(
            (userId, onSuccess) => onSuccess()
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const followBtn = await screen.findByRole('button', { name: /Seguir/i });
        fireEvent.click(followBtn);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Ahora sigues a este usuario');
        });
    });

    it('shows info toast when unfollowing user', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(true)
        );
        backend.userService.unfollowUser.mockImplementation(
            (userId, onSuccess) => onSuccess()
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const unfollowBtn = await screen.findByRole('button', { name: /Dejar de seguir/i });
        fireEvent.click(unfollowBtn);

        await waitFor(() => {
            expect(toast.info).toHaveBeenCalledWith('Has dejado de seguir a este usuario');
        });
    });

    it('handles error when following fails', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(false)
        );
        backend.userService.followUser.mockImplementation(
            (userId, onSuccess, onError) => onError(new Error('Network error'))
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const followBtn = await screen.findByRole('button', { name: /Seguir/i });
        fireEvent.click(followBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('No se pudo seguir al usuario');
        });
    });

    it('handles error when unfollowing fails', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(true)
        );
        backend.userService.unfollowUser.mockImplementation(
            (userId, onSuccess, onError) => onError(new Error('Network error'))
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const unfollowBtn = await screen.findByRole('button', { name: /Dejar de seguir/i });
        fireEvent.click(unfollowBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('No se pudo dejar de seguir al usuario');
        });
    });

    it('prevents multiple clicks while loading', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess) => onSuccess(false)
        );
        backend.userService.followUser.mockImplementation(
            (userId, onSuccess) => {
                setTimeout(() => onSuccess(), 100);
            }
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        const followBtn = await screen.findByRole('button', { name: /Seguir/i });
        fireEvent.click(followBtn);

        // El botón debería estar deshabilitado mientras procesa
        expect(followBtn).toBeDisabled();
    });

    it('handles error when checking follow status fails', async () => {
        const store = makeStore({ users: { user: { id: 1 } } });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        backend.userService.isFollowingUser.mockImplementation(
            (userId, onSuccess, onError) => {
                onError(new Error('Network error'));
            }
        );

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <FollowButton userId={2} />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error al verificar estado de seguimiento:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
