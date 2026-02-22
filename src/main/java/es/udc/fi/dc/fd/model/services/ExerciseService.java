package es.udc.fi.dc.fd.model.services;

import java.util.List;
import java.util.Set;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseException;
import es.udc.fi.dc.fd.model.services.exceptions.ExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import es.udc.fi.dc.fd.rest.dtos.ExerciseUpdateDto;


/**
 * Service interface for managing Exercises.
 */
public interface ExerciseService {

    /**
     * Finds approved exercises with optional filters and pagination.
     *
     * @param userId   ID of the user performing the operation
     * @param name     optional filter by exercise name (case insensitive, partial match)
     * @param material optional filter by required material
     * @param page     page number (0-based)
     * @param size     maximum number of items per page
     * @return a block of approved exercises matching the criteria
     * @throws PermissionException       if the user does not have permission
     * @throws InstanceNotFoundException if the user does not exist
    */
    Block<Exercise> findExercises(Long userId, String name, String material, Set<ExerciseMuscle>  exerciseMuscles, int page, int size)
            throws PermissionException, InstanceNotFoundException;

    /**
     * Finds pending exercises with optional filters and pagination.
     * Only users with role ADMIN can perform this operation.
     *
     * @param userId   ID of the user performing the operation
     * @param name     optional filter by exercise name (case insensitive, partial match)
     * @param material optional filter by required material
     * @param page     page number (0-based)
     * @param size     maximum number of items per page
     * @return a block of pending exercises matching the criteria
     * @throws PermissionException       if the user does not have permission
     * @throws InstanceNotFoundException if the user does not exist
     */
    Block<Exercise> findExercisesPending(Long userId, String name, String material, Set<ExerciseMuscle>  exerciseMuscles, int page, int size)
            throws PermissionException, InstanceNotFoundException;

    /**
     * Create a new exercise. Only TRAINER or ADMIN users can perform this operation.
     *
     * @param userId      id of the user performing the operation
     * @param name        name of the exercise
     * @param material    material required for the exercise
     * @return the created exercise with generated id
     * @throws PermissionException       if the user has no permission
     * @throws InstanceNotFoundException if the user does not exist
     */
    Exercise createExercise(Long userId, String name, String material, Set<ExerciseMuscle>  exerciseMuscles, String image, String description, ExerciseType type)
            throws PermissionException, InstanceNotFoundException, DuplicateExerciseException, PremiumRequiredException;

    /**
     * Get an exercise by id. Any authenticated user can read it.
     *
     * @param userId id of the user performing the operation
     * @param id     exercise id
     * @return the exercise
     * @throws PermissionException       if the user has no permission
     * @throws InstanceNotFoundException if the user or exercise does not exist
     */
    Exercise getExercise(Long userId, Long id) throws InstanceNotFoundException;

    /**
     * Update an existing exercise. Only ADMIN users can perform this operation.
     *
     * @param userId      id of the user performing the operation
     * @param id          id of the exercise to update
     * @return the updated exercise
     * @throws PermissionException       if the user is not ADMIN
     * @throws InstanceNotFoundException if the exercise or user does not exist
     */
    Exercise updateExercise(Long userId, Long id, ExerciseUpdateDto dto)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Delete an existing exercise. Only ADMIN users can perform this operation.
     *
     * @param userId id of the user performing the operation
     * @param id     id of the exercise to delete
     * @throws PermissionException          if the user is not ADMIN
     * @throws InstanceNotFoundException    if the exercise or user does not exist
     * @throws ExerciseInRoutineException   if the exercise belongs to one or more routines
     */
    void deleteExercise(Long userId, Long id)
            throws InstanceNotFoundException, PermissionException, ExerciseInRoutineException;

    /**
     * Returns a ranking (by weight) of followees (and the requester) that performed the exercise with weight recorded.
     */
    List<ExerciseFollowerStatDto> getFollowersExerciseStats(Long requesterId, Long exerciseId)
            throws InstanceNotFoundException;

    /**
     * Returns distinct exercises the user has performed in any routine execution.
     */
    List<Exercise> findUserPerformedExercises(Long userId) throws InstanceNotFoundException;

    /**
     * Update the image of an existing exercise. Only ADMIN or TRAINER users can perform this operation.
     *
     * @param userId      id of the user performing the operation
     * @param exerciseId  id of the exercise to update
     * @param base64Image image content encoded in Base64
     * @return
     * @throws PermissionException       if the user is not ADMIN or TRAINER
     * @throws InstanceNotFoundException if the exercise or user does not exist
     */
    Exercise updateExerciseImage(Long userId, Long exerciseId, String base64Image, String imageMimeType)
            throws PermissionException, InstanceNotFoundException;

}
