package es.udc.fi.dc.fd.model.entities;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import org.springframework.data.domain.Slice;

import java.util.Set;

public interface CustomizedExerciseDao {

    Slice<Exercise> find(String name, String material, Set<ExerciseMuscle>  exerciseMuscles, int page, int size);
    Slice<Exercise> findPending(String name, String material, Set<ExerciseMuscle> exerciseMuscles, int page, int size);
}
