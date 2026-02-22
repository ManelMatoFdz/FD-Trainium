package es.udc.fi.dc.fd.model.services.exceptions;

/**
 * Exception thrown when trying to delete an Exercise that belongs to one or more routines.
 */
@SuppressWarnings("serial")
public class ExerciseInRoutineException extends Exception {

    private final Long exerciseId;

    public ExerciseInRoutineException(Long exerciseId) {
        super("Exercise with id=" + exerciseId + " cannot be deleted because it belongs to a routine");
        this.exerciseId = exerciseId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }
}
