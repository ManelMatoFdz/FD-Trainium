package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineExecutionCommentDao extends JpaRepository<RoutineExecutionComment, Long> {
    List<RoutineExecutionComment> findByRoutineExecution_IdOrderByCreatedAtDescIdDesc(Long executionId);

    long countByUser_Id(Long userId);

    /**
     * Find comments created within a date range.
     * Used for Wrapped feature to calculate best friend interactions.
     */
    List<RoutineExecutionComment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

