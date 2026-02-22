package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;

/**
 * The Interface RoutineExecutionDao.
 */
@Repository
public interface RoutineExecutionDao extends JpaRepository<RoutineExecution, Long> {

    List<RoutineExecution> findByUser_Id(Long userId);

    /**
     * Find routine executions by user and date range.
     * Used for Wrapped feature to get yearly statistics.
     */
    List<RoutineExecution> findByUserIdAndPerformedAtBetweenOrderByPerformedAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    /**
     * Find all routine executions within a date range.
     * Used for Wrapped feature to calculate best friend interactions.
     */
    List<RoutineExecution> findByPerformedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Busca ejecuciones de rutina por lista de IDs de usuario, paginadas y ordenadas.
     * Usado para el feed de actividad de seguidos.
     * 
     * @param userIds lista de IDs de usuarios
     * @param pageable configuración de paginación y ordenación
     * @return página de ejecuciones
     */
    @Query("SELECT DISTINCT re.routine FROM RoutineExecution re WHERE re.user.id = :userId")
    List<Routine> findDistinctRoutinesByUser(@Param("userId") Long userId);

    @Query("SELECT re FROM RoutineExecution re WHERE re.user.id IN :userIds")
    Page<RoutineExecution> findByUserIdIn(@Param("userIds") List<Long> userIds, Pageable pageable);

    @Query("SELECT new es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto(" +
           "u.id, u.userName, u.avatarSeed, " +
           "SUM(COALESCE(es.weight, 0) * COALESCE(es.reps, 0)), " +
           "re.performedAt) " +
           "FROM RoutineExecution re " +
           "JOIN re.user u " +
           "JOIN re.exerciseExecutions ee " +
           "JOIN ee.setsDetails es " +
           "WHERE re.routine.id = :routineId " +
           "AND u.id IN :userIds " +
            "GROUP BY u.id, u.userName, u.avatarSeed, re.performedAt " +
            "ORDER BY SUM(COALESCE(es.weight, 0) * COALESCE(es.reps, 0)) DESC, MAX(re.performedAt) DESC")
    List<RoutineFollowerStatDto> findFollowerRoutineStats(@Param("routineId") Long routineId,
                                                          @Param("userIds") List<Long> userIds);

    @Query("""
    SELECT re FROM RoutineExecution re
    WHERE re.user.id = :userId
    ORDER BY re.performedAt DESC
""")
    List<RoutineExecution> findAllByUserOrdered(@Param("userId") Long userId);
}

