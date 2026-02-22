import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';

import Feed from '../../modules/routines/components/Feed';
import es from '../../i18n/messages/messages_es';

// Mock de jdenticon para evitar efectos secundarios
jest.mock('jdenticon', () => ({ update: jest.fn() }));

// Mocks del backend
const mockGetFeed = jest.fn();
const mockLike = jest.fn();
const mockUnlike = jest.fn();

jest.mock('../../backend', () => ({
    __esModule: true,
    default: {
        feedService: {
            getFeed: (...args) => mockGetFeed(...args),
        },
        routineExecutionService: {
            like: (...args) => mockLike(...args),
            unlike: (...args) => mockUnlike(...args),
        },
    },
}));

// Helper para crear el store minimal (solo slice de users)
const makeStore = (preloadedState) =>
    configureStore({
        reducer: {
            users: (state = { user: null, loggedIn: false }) => state
        },
        preloadedState
    });

// Wrapper para renderizar con providers
const renderWithProviders = (ui, { preloadedState, ...renderOptions } = {}) => {
    const store = makeStore(preloadedState || {
        users: { user: { id: 1, userName: 'testuser', role: 'USER' }, loggedIn: true }
    });

    const Wrapper = ({ children }) => (
        <Provider store={store}>
            <IntlProvider locale="es" messages={es}>
                <MemoryRouter>
                    {children}
                </MemoryRouter>
            </IntlProvider>
        </Provider>
    );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('Feed', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========== Tests de renderizado inicial ==========

    it('muestra spinner de carga mientras carga el feed', async () => {
        // Given: el servicio tarda en responder
        mockGetFeed.mockImplementation(() => new Promise(() => {})); // nunca resuelve

        // When: renderizamos el componente
        renderWithProviders(<Feed />);

        // Then: muestra el spinner de carga
        expect(screen.getByRole('status')).toBeInTheDocument();
        // O si usas texto:
        // expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('muestra mensaje cuando el feed está vacío', async () => {
        // Given: el feed está vacío
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                last: true
            }
        });

        // When: renderizamos el componente
        renderWithProviders(<Feed />);

        // Then: muestra mensaje de feed vacío
        await waitFor(() => {
            expect(screen.getByText(/no hay actividad/i)).toBeInTheDocument();
        });
    });

    it('muestra los items del feed cuando hay actividad', async () => {
        // Given: el feed tiene items
        const feedItems = [
            {
                id: 1,
                routineId: 10,
                routineName: 'Rutina Fuerza',
                authorId: 5,
                authorUserName: 'trainer1',
                authorAvatarSeed: 'trainer1',
                performedAt: '2025-11-29T10:00:00',
                type: 'EXECUTION',
                likesCount: 5,
                commentsCount: 2,
                totalDurationSec: 1800
            },
            {
                id: 2,
                routineId: 11,
                routineName: 'Cardio Intenso',
                authorId: 6,
                authorUserName: 'trainer2',
                authorAvatarSeed: 'trainer2',
                performedAt: '2025-11-28T15:30:00',
                type: 'EXECUTION',
                likesCount: 10,
                commentsCount: 0,
                totalDurationSec: 2400
            }
        ];

        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: feedItems,
                totalElements: 2,
                totalPages: 1,
                number: 0,
                last: true
            }
        });

        // When: renderizamos el componente
        renderWithProviders(<Feed />);

        // Then: muestra los items del feed
        await waitFor(() => {
            expect(screen.getByText('Rutina Fuerza')).toBeInTheDocument();
            expect(screen.getByText('Cardio Intenso')).toBeInTheDocument();
            expect(screen.getByText('trainer1')).toBeInTheDocument();
            expect(screen.getByText('trainer2')).toBeInTheDocument();
        });
    });

    // ========== Tests de ordenación ==========

    it('muestra los items ordenados por fecha (más reciente primero)', async () => {
        // Given: items en orden cronológico inverso
        const feedItems = [
            {
                id: 1,
                routineName: 'Más Reciente',
                authorUserName: 'trainer1',
                performedAt: '2025-11-30T10:00:00',
                type: 'EXECUTION'
            },
            {
                id: 2,
                routineName: 'Más Antigua',
                authorUserName: 'trainer2',
                performedAt: '2025-11-28T10:00:00',
                type: 'EXECUTION'
            }
        ];

        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: { content: feedItems, totalElements: 2, last: true }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: el primer item es el más reciente
        await waitFor(() => {
            const items = screen.getAllByTestId('feed-item');
            expect(items[0]).toHaveTextContent('Más Reciente');
            expect(items[1]).toHaveTextContent('Más Antigua');
        });
    });

    // ========== Tests de paginación ==========

    it('muestra botón "Siguiente" cuando hay más páginas', async () => {
        // Given: hay más de una página
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{ id: 1, routineName: 'R1', authorUserName: 't1', type: 'EXECUTION' }],
                totalElements: 15,
                totalPages: 2,
                number: 0,
                last: false
            }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: muestra el botón siguiente
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
        });
    });

    it('no muestra botón "Siguiente" cuando es la última página', async () => {
        // Given: es la última página
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{ id: 1, routineName: 'R1', authorUserName: 't1', type: 'EXECUTION' }],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                last: true
            }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: no muestra el botón siguiente
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /siguiente/i })).not.toBeInTheDocument();
        });
    });

    it('carga siguiente página al hacer clic en "Siguiente"', async () => {
        // Given: primera página con más páginas disponibles
        mockGetFeed
            .mockResolvedValueOnce({
                ok: true,
                payload: {
                    content: [{ id: 1, routineName: 'Página 1', authorUserName: 't1', type: 'EXECUTION' }],
                    totalElements: 2,
                    totalPages: 2,
                    number: 0,
                    last: false
                }
            })
            .mockResolvedValueOnce({
                ok: true,
                payload: {
                    content: [{ id: 2, routineName: 'Página 2', authorUserName: 't2', type: 'EXECUTION' }],
                    totalElements: 2,
                    totalPages: 2,
                    number: 1,
                    last: true
                }
            });

        renderWithProviders(<Feed />);

        // Esperar a que cargue la primera página
        await waitFor(() => {
            expect(screen.getByText('Página 1')).toBeInTheDocument();
        });

        // When: hacemos clic en siguiente
        const nextBtn = screen.getByRole('button', { name: /siguiente/i });
        fireEvent.click(nextBtn);

        // Then: se carga la segunda página (reemplaza la primera)
        await waitFor(() => {
            expect(screen.getByText('Página 2')).toBeInTheDocument();
        });

        // Y se llamó al servicio con la página 1
        expect(mockGetFeed).toHaveBeenCalledWith(1, 10);
    });

    // ========== Tests de información del item ==========

    it('muestra la información correcta en cada item del feed', async () => {
        // Given: un item con toda la información
        const feedItem = {
            id: 1,
            routineId: 10,
            routineName: 'Entrenamiento Completo',
            authorId: 5,
            authorUserName: 'supertrainer',
            authorAvatarSeed: 'supertrainer',
            performedAt: '2025-11-30T10:30:00',
            type: 'EXECUTION',
            likesCount: 15,
            commentsCount: 5,
            totalDurationSec: 3600, // 1 hora
            routineLevel: 'INTERMEDIATE',
            categoryName: 'Fuerza'
        };

        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: { content: [feedItem], totalElements: 1, totalPages: 1, last: true }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: muestra toda la información
        await waitFor(() => {
            expect(screen.getByText('Entrenamiento Completo')).toBeInTheDocument();
            expect(screen.getByText('supertrainer')).toBeInTheDocument();
            // Verificar likes y comments usando getAllByText ya que hay múltiples coincidencias
            expect(screen.getAllByText(/15/).length).toBeGreaterThan(0); // likes
            expect(screen.getAllByText(/5/).length).toBeGreaterThan(0); // comments (y fecha)
            // Duración formateada (1:00:00 formato HH:MM:SS)
            expect(screen.getByText(/1:00:00/)).toBeInTheDocument();
        });
    });

    it('tiene link al perfil del autor', async () => {
        // Given: un item con autor
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{
                    id: 1,
                    routineName: 'R1',
                    authorId: 5,
                    authorUserName: 'trainer1',
                    type: 'EXECUTION'
                }],
                totalElements: 1,
                last: true
            }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: el nombre del autor es un link al perfil
        await waitFor(() => {
            const authorLink = screen.getByRole('link', { name: /trainer1/i });
            expect(authorLink).toHaveAttribute('href', '/users/5');
        });
    });

    it('tiene link a la rutina ejecutada', async () => {
        // Given: un item de ejecución
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{
                    id: 1,
                    routineId: 10,
                    routineName: 'Mi Rutina',
                    authorUserName: 't1',
                    type: 'EXECUTION'
                }],
                totalElements: 1,
                last: true
            }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: el nombre de la rutina es un link
        await waitFor(() => {
            const routineLink = screen.getByRole('link', { name: /Mi Rutina/i });
            expect(routineLink).toHaveAttribute('href', expect.stringContaining('/routines'));
        });
    });

    // ========== Tests de errores ==========

    it('muestra mensaje de error cuando falla la carga', async () => {
        // Given: el servicio falla
        mockGetFeed.mockResolvedValue({
            ok: false,
            payload: { message: 'Error de red' }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: muestra mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('muestra mensaje de error cuando hay excepción', async () => {
        // Given: el servicio lanza excepción
        mockGetFeed.mockRejectedValue(new Error('Network error'));

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: muestra mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    // ========== Tests de internacionalización ==========

    it('muestra textos internacionalizados en español', async () => {
        // Given: feed vacío
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: { content: [], totalElements: 0, last: true }
        });

        // When: renderizamos con locale español
        renderWithProviders(<Feed />);

        // Then: muestra textos en español
        await waitFor(() => {
            // Verificar que hay texto localizado (ajustar según tus mensajes)
            expect(screen.getByText(/actividad|feed|seguidos/i)).toBeInTheDocument();
        });
    });

    // ========== Tests de accesibilidad ==========

    it('tiene estructura semántica correcta', async () => {
        // Given: feed con items
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{ id: 1, routineName: 'R1', authorUserName: 't1', type: 'EXECUTION' }],
                totalElements: 1,
                last: true
            }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: tiene estructura semántica
        await waitFor(() => {
            // Debe tener headings (título y nombre de rutina)
            expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
            // Los items deben ser articles o tener role
            expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
        });
    });

    // ========== Tests de estado del usuario ==========

    it('no renderiza si el usuario no está logueado', () => {
        // Given: usuario no logueado
        const storeWithoutUser = {
            users: { user: null, loggedIn: false }
        };

        // When: renderizamos
        renderWithProviders(<Feed />, { preloadedState: storeWithoutUser });

        // Then: no muestra el feed o muestra mensaje de login
        expect(screen.queryByTestId('feed-container')).not.toBeInTheDocument();
    });

    // ========== Tests de llamada al servicio ==========

    it('llama al servicio con los parámetros correctos', async () => {
        // Given: servicio configurado
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: { content: [], totalElements: 0, last: true }
        });

        // When: renderizamos
        renderWithProviders(<Feed />);

        // Then: llama al servicio con página 0 y tamaño 10
        await waitFor(() => {
            expect(mockGetFeed).toHaveBeenCalledWith(0, 10);
        });
    });

    it('permite hacer like en un item de ejecución', async () => {
        mockGetFeed.mockResolvedValue({
            ok: true,
            payload: {
                content: [{
                    id: 99,
                    type: 'EXECUTION',
                    routineId: 1,
                    routineName: 'Full Body',
                    authorUserName: 'alice',
                    authorId: 7,
                    performedAt: '2025-11-06T12:00:00Z',
                    likesCount: 0,
                    commentsCount: 0,
                    likedByCurrentUser: false,
                }],
                totalElements: 1,
                last: true
            }
        });
        mockLike.mockResolvedValue({ ok: true, payload: {} });

        renderWithProviders(<Feed />);

        const item = await screen.findByTestId('feed-item');
        const likeButton = within(item).getByRole('button');
        fireEvent.click(likeButton);
        await waitFor(() => expect(mockLike).toHaveBeenCalledWith(99));
        const likeCounts = within(item).getAllByText(/1/);
        expect(likeCounts.length).toBeGreaterThan(0);
    });
});
