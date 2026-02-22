import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { useUrlPagination } from '../../modules/common/hooks/useUrlPagination';

/**
 * Componente auxiliar para renderizar y testear el hook.
 */
function HookHarness({ paramName = 'page' }) {
    const { page, setPage, resetPage } = useUrlPagination(paramName);

    return (
        <div>
            <span data-testid="page-value">{page}</span>
            <button type="button" data-testid="set-page-2" onClick={() => setPage(2)}>
                Set Page 2
            </button>
            <button type="button" data-testid="set-page-0" onClick={() => setPage(0)}>
                Set Page 0
            </button>
            <button type="button" data-testid="increment-page" onClick={() => setPage((p) => p + 1)}>
                Increment Page
            </button>
            <button type="button" data-testid="reset-page" onClick={() => resetPage()}>
                Reset Page
            </button>
        </div>
    );
}

/**
 * Renderiza el hook con una URL inicial.
 */
function renderWithRouter(initialEntries = ['/']) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/*" element={<HookHarness />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('useUrlPagination', () => {
    it('devuelve page=0 cuando no hay parámetro en la URL', () => {
        const { getByTestId } = renderWithRouter(['/']);
        expect(getByTestId('page-value').textContent).toBe('0');
    });

    it('lee el parámetro page desde la URL inicial', () => {
        const { getByTestId } = renderWithRouter(['/?page=3']);
        expect(getByTestId('page-value').textContent).toBe('3');
    });

    it('setPage actualiza el valor de la página', () => {
        const { getByTestId } = renderWithRouter(['/']);

        expect(getByTestId('page-value').textContent).toBe('0');

        act(() => {
            getByTestId('set-page-2').click();
        });

        expect(getByTestId('page-value').textContent).toBe('2');
    });

    it('setPage acepta una función para calcular el nuevo valor', () => {
        const { getByTestId } = renderWithRouter(['/?page=5']);

        expect(getByTestId('page-value').textContent).toBe('5');

        act(() => {
            getByTestId('increment-page').click();
        });

        expect(getByTestId('page-value').textContent).toBe('6');
    });

    it('setPage(0) elimina el parámetro de la URL', () => {
        const { getByTestId } = renderWithRouter(['/?page=3']);

        expect(getByTestId('page-value').textContent).toBe('3');

        act(() => {
            getByTestId('set-page-0').click();
        });

        expect(getByTestId('page-value').textContent).toBe('0');
    });

    it('resetPage elimina el parámetro y vuelve a page=0', () => {
        const { getByTestId } = renderWithRouter(['/?page=5']);

        expect(getByTestId('page-value').textContent).toBe('5');

        act(() => {
            getByTestId('reset-page').click();
        });

        expect(getByTestId('page-value').textContent).toBe('0');
    });

    it('maneja valores no numéricos en la URL como 0', () => {
        const { getByTestId } = renderWithRouter(['/?page=abc']);
        // parseInt('abc', 10) devuelve NaN, que se convierte a 0 con || '0'
        expect(getByTestId('page-value').textContent).toBe('0');
    });

    it('preserva otros parámetros de búsqueda al cambiar page', () => {
        // Componente que muestra todos los search params
        function HarnessWithOtherParams() {
            const { page, setPage } = useUrlPagination();
            const [searchParams] = require('react-router-dom').useSearchParams();

            return (
                <div>
                    <span data-testid="page-value">{page}</span>
                    <span data-testid="other-param">{searchParams.get('filter') || ''}</span>
                    <button type="button" data-testid="set-page-2" onClick={() => setPage(2)}>
                        Set Page 2
                    </button>
                </div>
            );
        }

        const { getByTestId } = render(
            <MemoryRouter initialEntries={['/?filter=active&page=1']}>
                <Routes>
                    <Route path="/*" element={<HarnessWithOtherParams />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByTestId('page-value').textContent).toBe('1');
        expect(getByTestId('other-param').textContent).toBe('active');

        act(() => {
            getByTestId('set-page-2').click();
        });

        expect(getByTestId('page-value').textContent).toBe('2');
        expect(getByTestId('other-param').textContent).toBe('active');
    });
});

describe('useUrlPagination con paramName personalizado', () => {
    function HarnessWithCustomParam() {
        const { page, setPage, resetPage } = useUrlPagination('p');

        return (
            <div>
                <span data-testid="page-value">{page}</span>
                <button type="button" data-testid="set-page-2" onClick={() => setPage(2)}>
                    Set Page 2
                </button>
                <button type="button" data-testid="reset-page" onClick={() => resetPage()}>
                    Reset Page
                </button>
            </div>
        );
    }

    it('lee el parámetro personalizado desde la URL', () => {
        const { getByTestId } = render(
            <MemoryRouter initialEntries={['/?p=4']}>
                <Routes>
                    <Route path="/*" element={<HarnessWithCustomParam />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByTestId('page-value').textContent).toBe('4');
    });

    it('setPage actualiza el parámetro personalizado', () => {
        const { getByTestId } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/*" element={<HarnessWithCustomParam />} />
                </Routes>
            </MemoryRouter>
        );

        act(() => {
            getByTestId('set-page-2').click();
        });

        expect(getByTestId('page-value').textContent).toBe('2');
    });

    it('resetPage elimina el parámetro personalizado', () => {
        const { getByTestId } = render(
            <MemoryRouter initialEntries={['/?p=7']}>
                <Routes>
                    <Route path="/*" element={<HarnessWithCustomParam />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByTestId('page-value').textContent).toBe('7');

        act(() => {
            getByTestId('reset-page').click();
        });

        expect(getByTestId('page-value').textContent).toBe('0');
    });
});
