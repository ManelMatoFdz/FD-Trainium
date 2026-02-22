import { appFetch, fetchConfig } from "./appFetch";

// Helper to adapt appFetch callbacks into a promise { ok, payload }
const toResponse = (executor) =>
  new Promise((resolve) =>
    executor(
      (payload) => resolve({ ok: true, payload }),
      (errors) => resolve({ ok: false, payload: errors })
    )
  );

/**
 * Registers a new routine execution with performed exercises.
 * Backward-compatible: the backend may ignore extra fields.
 *
 * @param {Object} execution - Routine execution data:
 * {
 *   routineId: number,
 *   // Optional timing fields (for auto/manual duration)
 *   startedAt?: string,         // ISO datetime
 *   finishedAt?: string,        // ISO datetime
 *   totalDurationSec?: number,  // seconds (manual override or computed)
 *   // Performed exercises
 *   exercises: [
 *     {
 *       exerciseId,
 *       // Aggregated values for backward compatibility
 *       performedSets,          // number of sets
 *       performedReps,          // total reps (or total seconds if TIME)
 *       weightUsed,             // optional representative weight
 *       notes,
 *       // Optional richer detail (if backend supports it)
 *       type?: 'REPS' | 'TIME',
 *       setsDetails?: Array<{
 *         index: number,
 *         reps?: number,        // present when type = REPS
 *         seconds?: number,     // present when type = TIME
 *         weight?: number
 *       }>
 *     }
 *   ]
 * }
 */
export const create = (execution) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      "/routine-executions",
      fetchConfig("POST", execution),
      onSuccess,
      onErrors
    )
  );

/**
 * Retrieves all routine executions performed by a specific user.
 *
 */
export const findByUser = () =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/user`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

/**
 * Retrieves all routine executions performed by a given user id.
 * @param {number|string} userId
 */
export const findByUserId = (userId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/user/${userId}`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

/**
 * Retrieves details of a specific routine execution (with exercises).
 *
 * @param {number} executionId - Routine execution ID
 */
export const findById = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

/**
 * Retrieves public details of a specific routine execution (no ownership required).
 */
export const findPublicById = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/public/${executionId}`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

export const like = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}/like`,
      fetchConfig("POST"),
      onSuccess,
      onErrors
    )
  );

export const unlike = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}/like`,
      fetchConfig("DELETE"),
      onSuccess,
      onErrors
    )
  );

export const getLikers = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}/likes`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

export const getComments = (executionId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}/comments`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );

export const addComment = (executionId, text) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/${executionId}/comments`,
      fetchConfig("POST", { text }),
      onSuccess,
      onErrors
    )
  );

export const updateComment = (commentId, text) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/comments/${commentId}`,
      fetchConfig("PUT", { text }),
      onSuccess,
      onErrors
    )
  );

export const deleteComment = (commentId) =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/routine-executions/comments/${commentId}`,
      fetchConfig("DELETE"),
      onSuccess,
      onErrors
    )
  );

export default {
  create,
  findByUser,
  findByUserId,
  findById,
  findPublicById,
  like,
  unlike,
  getLikers,
  getComments,
  addComment,
  updateComment,
  deleteComment,
};
