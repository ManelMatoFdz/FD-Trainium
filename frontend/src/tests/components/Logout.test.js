import {render} from '@testing-library/react';

import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import {configureStore} from '@reduxjs/toolkit';
import Logout from '../../modules/users/components/Logout';
import users from '../../modules/users';

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Logout Component', () => {
    let store;

    beforeEach(() => {
        // Crear store con estado inicial
        store = configureStore({
            reducer: {
                users: users.reducer,
            },
            preloadedState: {
                users: {
                    user: {id: 1, userName: 'testuser'},
                },
            },
        });
        
        // Limpiar mocks
        mockNavigate.mockClear();
    });

    it('renders without crashing', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Logout />
                </MemoryRouter>
            </Provider>
        );
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('dispatches logout action on mount', () => {
        const dispatchSpy = jest.spyOn(store, 'dispatch');
        
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Logout />
                </MemoryRouter>
            </Provider>
        );
        
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('navigates to home page', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Logout />
                </MemoryRouter>
            </Provider>
        );
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
