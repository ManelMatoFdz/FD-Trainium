package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionComment;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service interface for managing routine executions.
 */
public interface RoutineExecutionService {

    /**
     * Registers a new routine execution with the exercises performed.
     *
     * @param userId     the user performing the execution
     * @param routineId  the routine being executed
     * @param exercises  the list of exercise executions (performed sets, reps, weight)
     * @return the created RoutineExecution
     * @throws PermissionException       if the user has no permission
     * @throws InstanceNotFoundException if user or routine do not exist
     */
    RoutineExecution registerRoutineExecution(Long userId, Long routineId, List<ExerciseExecution> exercises,
                                              java.time.LocalDateTime startedAt,
                                              java.time.LocalDateTime finishedAt,
                                              Integer totalDurationSec)
            throws PermissionException, InstanceNotFoundException;

    default RoutineExecution registerRoutineExecution(Long userId, Long routineId, List<ExerciseExecution> exercises)
            throws PermissionException, InstanceNotFoundException {
        return registerRoutineExecution(userId, routineId, exercises, null, null, null);
    }

    /**
     * Retrieves all routine executions made by a user.
     *
     * @param userId the user ID
     * @return the list of executions
     * @throws PermissionException       if no permission
     * @throws InstanceNotFoundException if user not found
     */
    List<RoutineExecution> findRoutineExecutionsByUser(Long userId)
            throws PermissionException, InstanceNotFoundException;

    /**
     * Retrieves full details (exercises included) of a specific routine execution.
     *
     * @param userId             the user performing the request
     * @param routineExecutionId the ID of the routine execution
     * @return the full routine execution details
     * @throws PermissionException       if no permission
     * @throws InstanceNotFoundException if not found
     */
    RoutineExecution getRoutineExecutionDetails(Long userId, Long routineExecutionId)
            throws PermissionException, InstanceNotFoundException;

    /**
     * Retrieves details of a specific routine execution without ownership restriction
     * (for public read-only access by authenticated users).
     *
     * @param routineExecutionId the ID of the routine execution
     * @return the full routine execution details
     * @throws InstanceNotFoundException if not found
     */
    RoutineExecution getRoutineExecutionDetailsPublic(Long routineExecutionId)
            throws InstanceNotFoundException;

    /**
     * Likes a routine execution by the authenticated user.
     * Returns the updated execution state.
     */
    RoutineExecution likeRoutineExecution(Long userId, Long routineExecutionId)
            throws InstanceNotFoundException;

    /**
     * Removes a like from a routine execution by the authenticated user.
     * Returns the updated execution state.
     */
    RoutineExecution unlikeRoutineExecution(Long userId, Long routineExecutionId)
            throws InstanceNotFoundException;

    /**
     * Returns the usernames of users who liked a routine execution.
     * Only the owner of the execution or an admin may view this list.
     */
    List<String> getRoutineExecutionLikers(Long requesterId, Long routineExecutionId)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Returns the count of likes of all routine executions.
     * Only the owner of the execution or an admin may view this count.
     */
    long getTotalLikesReceived(Long requesterId, List<RoutineExecution> executions)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Adds a comment to a routine execution (any authenticated user).
     */
    RoutineExecutionComment addComment(Long userId, Long executionId, String text)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Updates the text of a comment (only author).
     */
    RoutineExecutionComment updateComment(Long userId, Long commentId, String newText)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Lists comments for a routine execution ordered by creation date (desc).
     */
    List<RoutineExecutionComment> findComments(Long executionId)
            throws InstanceNotFoundException;

    /**
     * Deletes a comment (author or admin).
     */
    void deleteComment(Long requesterId, Long commentId)
            throws InstanceNotFoundException, PermissionException;
}
