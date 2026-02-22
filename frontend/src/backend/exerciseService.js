import { appFetch, fetchConfig } from "./appFetch";

// Adaptador para devolver promesa { ok, payload }
const toResponse = (executor) =>
  new Promise((resolve) =>
    executor(
      (payload, status) => resolve({ ok: true, payload, status }),
      (errors, status) => resolve({ ok: false, payload: errors, status })
    )
  );

// Busca ejercicios con filtros opcionales. Devuelve { items, existMoreItems }
export const find = ({ name, material, muscles, page = 0 } = {}) => {
  const params = new URLSearchParams();
  if (name && name.trim().length > 0) params.append("name", name.trim());
  if (material && material.trim().length > 0) params.append("material", material.trim());
  // Soporta string (1 valor) o array (varios valores) -> CSV, que el backend parsea
  if (Array.isArray(muscles) && muscles.length > 0) {
    const csv = muscles
      .filter(Boolean)
      .map((m) => String(m).trim())
      .filter((m) => m.length > 0)
      .join(",");
    if (csv.length > 0) params.append("muscles", csv);
  } else if (typeof muscles === "string" && muscles.trim().length > 0) {
    params.append("muscles", muscles.trim());
  }
  params.append("page", String(page));

  return toResponse((onSuccess, onErrors) =>
    appFetch(`/exercises?${params.toString()}`,
      fetchConfig("GET"),
      (payload) => {
        // Asegurar forma estándar Block { items, existMoreItems }
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        const existMoreItems = Boolean(payload?.existMoreItems);
        onSuccess({ items, existMoreItems });
      },
      onErrors
    )
  );
};

export const findAll = () => {
    return toResponse((onSuccess, onErrors) =>
        appFetch("/exercises",
            fetchConfig("GET"),
            onSuccess, onErrors
        )
    );
}

// ejercicios distintos que el usuario ha ejecutado en sus rutinas
export const findPerformed = () => {
  return toResponse((onSuccess, onErrors) =>
    appFetch(
      "/exercises/executed",
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );
}

// obtener un ejercicio por id
export const findById = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

// crear
export const create = (exercise) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises`,
      fetchConfig("POST", exercise),
      onSuccess,
      onErrors
    )
  );

// actualizar
export const update = (id, exercise) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}`,
      fetchConfig("PUT", exercise), // body con {name, material, repetitions}
      onSuccess,
      onErrors
    )
  );

// eliminar
export const remove = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}`,
      fetchConfig("DELETE"),
      onSuccess,
      onErrors
    )
  );

// buscar ejercicios pendientes (solo ADMIN)
export const findPending = ({ name, material, muscles, page = 0 } = {}) => {
  const params = new URLSearchParams();
  if (name && name.trim().length > 0) params.append("name", name.trim());
  if (material && material.trim().length > 0) params.append("material", material.trim());
  if (Array.isArray(muscles) && muscles.length > 0) {
    const csv = muscles
      .filter(Boolean)
      .map((m) => String(m).trim())
      .filter((m) => m.length > 0)
      .join(",");
    if (csv.length > 0) params.append("muscles", csv);
  } else if (typeof muscles === "string" && muscles.trim().length > 0) {
    params.append("muscles", muscles.trim());
  }
  params.append("page", String(page));

  return toResponse((onSuccess, onErrors) =>
    appFetch(`/exercises/pending?${params.toString()}`,
      fetchConfig("GET"),
      (payload) => {
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        const existMoreItems = Boolean(payload?.existMoreItems);
        onSuccess({ items, existMoreItems });
      },
      onErrors
    )
  );
};

// aprobar ejercicio (actualizar status a APPROVED)
export const approve = (id, exerciseData) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}`,
      fetchConfig("PUT", {
        ...exerciseData,
        status: "APPROVED"
      }),
      onSuccess,
      onErrors
    )
  );

  // rechazar ejercicio (actualizar status a REJECTED)
export const reject = (id, exerciseData) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}`,
      fetchConfig("PUT", {
        ...exerciseData,
        status: "REJECTED"
      }),
      onSuccess,
      onErrors
    )
  );

// actualizar la imagen de un ejercicio
export const updateExerciseImage = (id, base64Image, imageMimeType) =>
    toResponse((onSuccess, onErrors) =>
        appFetch(
            `/exercises/${id}/image`,
            fetchConfig("PUT", { base64Image, imageMimeType}),
            onSuccess,
            onErrors
        )
    );

// Ranking de peso de los usuarios seguidos para un ejercicio concreto
export const getFollowersStats = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/exercises/${id}/followers/stats`,
      fetchConfig("GET"),
      (payload) => onSuccess(Array.isArray(payload) ? payload : []),
      onErrors
    )
  );
