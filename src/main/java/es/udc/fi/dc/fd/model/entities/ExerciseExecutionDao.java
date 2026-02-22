package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;

/**
 * DAO for ExerciseExecution.
 */
@Repository
public interface ExerciseExecutionDao extends JpaRepository<ExerciseExecution, Long> {

    List<ExerciseExecution> findByRoutineExecution_Id(Long routineExecutionId);

    /**
     * Alias for findByRoutineExecution_Id used by WrappedService.
     */
    default List<ExerciseExecution> findByRoutineExecutionId(Long routineExecutionId) {
        return findByRoutineExecution_Id(routineExecutionId);
    }

    @Query("SELECT new es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto(" +
           "u.id, u.userName, u.avatarSeed, " +
           "COALESCE(MAX(COALESCE(es.weight, ee.weightUsed)), MAX(ee.weightUsed)), " +
           "MAX(re.performedAt)) " +
           "FROM ExerciseExecution ee " +
           "JOIN ee.routineExecution re " +
           "JOIN re.user u " +
           "LEFT JOIN ee.setsDetails es " +
           "WHERE ee.exercise.id = :exerciseId " +
           "AND u.id IN :userIds " +
           "AND (ee.weightUsed IS NOT NULL OR es.weight IS NOT NULL) " +
           "GROUP BY u.id, u.userName, u.avatarSeed " +
           "ORDER BY COALESCE(MAX(COALESCE(es.weight, ee.weightUsed)), MAX(ee.weightUsed)) DESC, MAX(re.performedAt) DESC")
    List<ExerciseFollowerStatDto> findFollowerExerciseStats(@Param("exerciseId") Long exerciseId,
                                                            @Param("userIds") List<Long> userIds);

    @Query("SELECT DISTINCT ee.exercise FROM ExerciseExecution ee " +
           "JOIN ee.routineExecution re " +
           "WHERE re.user.id = :userId")
    List<Exercise> findDistinctExercisesByUser(@Param("userId") Long userId);
}

