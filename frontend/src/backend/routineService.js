import { appFetch, fetchConfig } from "./appFetch";

// Helper to adapt appFetch callbacks into a promise { ok, payload }
const toResponse = (executor) =>
  new Promise((resolve) =>
    executor(
      (payload) => resolve({ ok: true, payload }),
      (errors) => resolve({ ok: false, payload: errors })
    )
  );

export const findAll = () =>
  toResponse((onSuccess, onErrors) =>
    appFetch("/routines/", fetchConfig("GET"), onSuccess, onErrors)
  );

export const searchRoutines = (categoryId, keywords, level, muscles = [], page = 0, size = 10) => {
  // Construir query params solo para valores no nulos/vacíos
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId);
  if (keywords && keywords.trim()) params.append('keywords', keywords.trim());
  if (level && level.trim()) params.append('level', level.trim());
  if (Array.isArray(muscles) && muscles.length > 0) {
    // Add multiple 'muscles' params so Spring los parsea como lista
    muscles.forEach(m => params.append('muscles', m));
  }
  params.append('page', page);
  params.append('size', size);

  return toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routines/search?${params.toString()}`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );
};

export const findRoutineExercises = (routineId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${routineId}/exercises`, fetchConfig("GET"), onSuccess, onErrors)
  );

export const findAllCategories = (onSuccess, onErrors) => {
  appFetch(
    "/categories",
    fetchConfig("GET"),
    (categories) => onSuccess(categories),
    onErrors
  );
};

export const myRoutines = (page = 0, size = 10) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);
  return toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/myRoutines?${params.toString()}`, fetchConfig("GET"), onSuccess, onErrors)
  );
};

export const findById = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${id}`, fetchConfig("GET"), onSuccess, onErrors)
  );

export const create = (routine) =>
  toResponse((onSuccess, onErrors) =>
    appFetch("/routines/", fetchConfig("POST", routine), onSuccess, onErrors)
  );

export const update = (id, routine) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routines/${id}`,
      fetchConfig("PUT", routine),
      onSuccess,
      onErrors
    )
  );

export const remove = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${id}`, fetchConfig("DELETE"), onSuccess, onErrors)
  );

export const save = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${id}/save`, fetchConfig("POST"), onSuccess, onErrors)
  );

export const unsave = (id) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${id}/unsave`, fetchConfig("DELETE"), onSuccess, onErrors)
  );

export const savedRoutines = (page = 0, size = 10) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);
  return toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/savedRoutines?${params.toString()}`, fetchConfig("GET"), onSuccess, onErrors)
  );
};

export const getUsersWhoSavedRoutine = (routineId, page = 0, size = 10) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);

  return toResponse((onSuccess, onErrors) =>
      appFetch(`/routines/${routineId}/savedBy?${params.toString()}`, fetchConfig("GET"), onSuccess, onErrors)
  );
};

export const followCreator = (routineId, onSuccess, onErrors) =>
    appFetch(`/routines/${routineId}/followCreator`, fetchConfig("POST"), onSuccess, onErrors);

export const unfollowCreator = (routineId, onSuccess, onErrors) =>
    appFetch(`/routines/${routineId}/unfollowCreator`, fetchConfig("DELETE"), onSuccess, onErrors);

export const isFollowingCreator = (routineId, onSuccess, onErrors) =>
  appFetch(`/routines/${routineId}/isFollowingCreator`, fetchConfig("GET"), onSuccess, onErrors);


export const getTrainerFromRoutine = (routineId, onSuccess, onErrors) =>
  appFetch(`/routines/${routineId}/trainer`, fetchConfig("GET"), onSuccess, onErrors);

export const getFollowersStats = (routineId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(`/routines/${routineId}/followers/stats`, fetchConfig("GET"), onSuccess, onErrors)
  );

export const findPerformed = () =>
  toResponse((onSuccess, onErrors) =>
    appFetch("/routines/performed", fetchConfig("GET"), onSuccess, onErrors)
  );

export default { findAll, findById, create, update, remove, save, unsave, savedRoutines, getUsersWhoSavedRoutine, getTrainerFromRoutine, isFollowingCreator, followCreator, unfollowCreator, getFollowersStats, findPerformed, searchRoutines, findRoutineExercises, findAllCategories };