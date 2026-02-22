package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseExecutionSetDao extends JpaRepository<ExerciseExecutionSet, Long> {
    List<ExerciseExecutionSet> findByExerciseExecution_Id(Long exerciseExecutionId);

    /**
     * Alias for findByExerciseExecution_Id used by WrappedService.
     */
    default List<ExerciseExecutionSet> findByExerciseExecutionId(Long exerciseExecutionId) {
        return findByExerciseExecution_Id(exerciseExecutionId);
    }
}


