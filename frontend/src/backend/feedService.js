import { appFetch, fetchConfig } from "./appFetch";

/**
 * Helper para adaptar callbacks de appFetch a Promise { ok, payload }
 */
const toResponse = (executor) =>
    new Promise((resolve) =>
        executor(
            (payload) => resolve({ ok: true, payload }),
            (errors) => resolve({ ok: false, payload: errors })
        )
    );

/**
 * Obtiene el feed de actividad paginado.
 * 
 * @param {number} page - número de página (0-indexed)
 * @param {number} size - tamaño de página (por defecto 10)
 * @returns {Promise<{ok: boolean, payload: Object}>} - respuesta con página de FeedItemDto
 */
export const getFeed = (page = 0, size = 10) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    return toResponse((onSuccess, onErrors) =>
        appFetch(
            `/users/feed?${params.toString()}`,
            fetchConfig("GET"),
            onSuccess,
            onErrors
        )
    );
};

export default {
    getFeed,
};
