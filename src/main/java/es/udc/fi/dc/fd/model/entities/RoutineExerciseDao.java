package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineExerciseDao extends JpaRepository<RoutineExercise, Long> {

    List<RoutineExercise> findByRoutine_Id(Long routineId);

    List<RoutineExercise> findByExercise_Id(Long exerciseId);

}