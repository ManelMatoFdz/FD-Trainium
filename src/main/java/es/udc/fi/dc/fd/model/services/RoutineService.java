package es.udc.fi.dc.fd.model.services;

import java.util.List;
import java.util.Set;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadySavedException;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import org.springframework.transaction.annotation.Transactional;


public interface RoutineService {

    /**
     * Find all routines.
     *
     * @param userId the id of the user performing the operation (to check permissions)
     * @return the list of routines
     * @throws InstanceNotFoundException if user not found
     */
    Block<Routine> findAllRoutines(Long userId, int page, int size) throws InstanceNotFoundException;

    /**
     * Search routines by filters.
     *
     * @param categoryId the category id to filter by (null for no filtering)
     * @param keywords   the keywords to search in name and description (null or empty for no filtering)
     * @param level      the difficulty level to filter by (null for no filtering)
     * @param page       the page number (0-based)
     * @param size       the number of items per page
     * @return a paginated list of routines matching the criteria
     */
    Block<Routine> searchRoutines(Long categoryId, String keywords, String level, Set<ExerciseMuscle> exerciseMuscles, int page, int size);

    /**
     * Find routine by id (with exercises).
     *
     * @param routineId the id
     * @param userId the id of the user performing the operation (to check permissions)
     * @return the routine
     * @throws InstanceNotFoundException if routine not found
     */
    Routine findRoutineById(Long userId, Long routineId) throws InstanceNotFoundException;

    /**
     * Finds the details (sets, repetitions) for all exercises in a specific routine.
     * * @param routineId The ID of the routine.
     * @return A list of RoutineExercise entities.
     * @throws InstanceNotFoundException if the routine does not exist.
     */
    List<RoutineExercise> findRoutineExercisesByRoutineId(Long routineId) throws InstanceNotFoundException;


    /**
     * Create a new routine. Only trainers can perform this operation.
     *
     * @param name        the name of the routine
     * @param level       the difficulty level of the routine
     * @param description the description of the routine
     * @param materials   the required materials for the routine
     * @param userId      the id of the owner of the Routine (must be a trainer)
     * @param categoryId  the id of the category to assign to the routine
     * @param exercisesId   the list of exercises to include in the routine (will replace the current ones)
     * @param openPublic  if the routine is public or private
     * @return the created routine with generated id
     * @throws PermissionException       if the user is not a trainer
     * @throws InstanceNotFoundException if the category or user is not found
     */
    Routine createRoutine(String name, String level, String description, String materials,
                          Long userId, Long categoryId, List<RoutineExercise> exercisesId, Boolean openPublic)
            throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException, PremiumRequiredException;

    /**
     * Update an existing routine. Only the owner trainer of the routine can perform this operation.
     *
     * @param routineId   the id of the routine to update
     * @param name        the new name of the routine
     * @param level       the new difficulty level of the routine
     * @param description the new description of the routine
     * @param materials   the new required materials for the routine
     * @param userId      the id of the user performing the operation (must be the owner trainer)
     * @param categoryId  the id of the category to assign to the routine
     * @param openPublic  if the routine is public or private
     * @return the updated routine
     * @param exercisesId   the list of exercises to include in the routine (will replace the current ones)
     * @throws PermissionException       if the user is not the owner trainer
     * @throws InstanceNotFoundException if the routine, user, or category is not found
     */
    Routine updateRoutine(Long routineId, String name, String level, String description,
                          String materials, Long userId, Long categoryId, List<RoutineExercise> exercisesId, Boolean openPublic)
            throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException, PremiumRequiredException;

    /**
     * Delete an existing routine. Only the owner trainer of the routine can perform this operation.
     *
     * @param routineId   the id of the routine to delete
     * @param userId      the id of the user performing the operation (must be the owner trainer)
     * @throws PermissionException       if the user is not the owner trainer
     * @throws InstanceNotFoundException if the routine or user is not found
     */
    void deleteRoutine(Long routineId, Long userId)
            throws PermissionException, InstanceNotFoundException;

    /**
     * Find all routines created by a specific user.
     *
     * @param userId the id of the user
     * @throws InstanceNotFoundException if user not found
     * @throws PermissionException if user is not a trainer or admin
     */
    Block<Routine> myRoutines(Long userId, int page, int size) throws InstanceNotFoundException, PermissionException;

    /**
     * Save routine.
     *
     * @param userId    the user id
     * @param routineId the routine id
     * @throws InstanceNotFoundException if user or routine not found
     */
    Routine saveRoutine(Long userId, Long routineId) throws InstanceNotFoundException, AlreadySavedException;

    /**
     * Unsave routine.
     *
     * @param userId    the user id
     * @param routineId the routine id
     * @throws InstanceNotFoundException if user or routine not found
     */
    Routine unsaveRoutine(Long userId, Long routineId) throws InstanceNotFoundException, AlreadySavedException;

    /**
     * Find routines saved by user id.
     *
     * @param userId the user id
     * @return the list of routines
     * @throws InstanceNotFoundException if user not found
     */
    Block<Routine> findRoutinesByUserId(Long userId, int page, int size) throws InstanceNotFoundException;

    /**
     * Find users who saved a specific routine.
     *
     * @param trainerId  the id of the trainer requesting the information
     * @param routineId  the id of the routine
     * @return a list of users who saved the routine
     * @throws InstanceNotFoundException if the trainer or routine is not found
     * @throws PermissionException if the trainer is not the owner of the routine or not admin
     */
    Block<Users> findUsersWhoSavedRoutine(Long trainerId, Long routineId, int page, int size)
            throws InstanceNotFoundException, PermissionException;

    Users getCreator(Long routineId) throws InstanceNotFoundException;
    /**
     * Returns distinct routines the user has performed.
     */
    List<Routine> findUserPerformedRoutines(Long userId) throws InstanceNotFoundException;

    /**
     * Returns a ranking (by total volume) of followees (and the requester) that performed the routine.
     */
    List<RoutineFollowerStatDto> getFollowersRoutineStats(Long requesterId, Long routineId)
            throws InstanceNotFoundException;

}
