import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook para sincronizar la paginación con parámetros de URL.
 * @param {string} paramName - Nombre del parámetro en la URL (por defecto 'page')
 * @returns {{ page: number, setPage: function, resetPage: function }}
 */
export const useUrlPagination = (paramName = 'page') => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get(paramName) || '0', 10) || 0;

    const setPage = useCallback((newPage) => {
        setSearchParams((prev) => {
            const updated = new URLSearchParams(prev);
            const currentPage = parseInt(updated.get(paramName) || '0', 10) || 0;
            const computed = typeof newPage === 'function' ? newPage(currentPage) : newPage;
            const pageValue = Math.max(0, parseInt(String(computed), 10) || 0);
            if (pageValue === 0) {
                updated.delete(paramName);
            } else {
                updated.set(paramName, String(pageValue));
            }
            return updated;
        }, { replace: true });
    }, [paramName, setSearchParams]);

    const resetPage = useCallback(() => {
        setSearchParams((prev) => {
            const updated = new URLSearchParams(prev);
            updated.delete(paramName);
            return updated;
        }, { replace: true });
    }, [paramName, setSearchParams]);

    return { page, setPage, resetPage };
};

export default useUrlPagination;
