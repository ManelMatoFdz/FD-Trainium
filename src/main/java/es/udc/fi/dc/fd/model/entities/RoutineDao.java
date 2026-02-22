package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * The Interface RoutineDao.
 */
@Repository
public interface RoutineDao extends JpaRepository<Routine, Long> {
    /**
     * Find routines by user.
     *
     * @param user the user
     * @return the list of routines
     */
    java.util.List<Routine> findByUser(Users user);

    int countByUser(Users user);

    @Query("""
    SELECT r
    FROM Routine r
    WHERE r.id = :routineId
      AND (r.openPublic = true OR r.user.id = :userId OR :isAdmin = true)
""")
    Optional<Routine> findVisibleByIdAndUserId(@Param("routineId") Long routineId,
                                               @Param("userId") Long userId,
                                               @Param("isAdmin") Boolean isAdmin);

    List<Routine> findByOpenPublicTrue();

    /**
     * Encuentra rutinas públicas de usuarios específicos.
     * Usado para el feed de actividad.
     */
    Page<Routine> findByUserIdInAndOpenPublicTrue(List<Long> userIds, Pageable pageable);
}
