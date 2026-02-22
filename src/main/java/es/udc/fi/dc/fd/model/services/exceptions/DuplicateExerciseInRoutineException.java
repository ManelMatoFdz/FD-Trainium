package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class DuplicateExerciseInRoutineException extends Exception {

    private final Long exerciseId;

    public DuplicateExerciseInRoutineException(Long exerciseId) {
        super("La rutina contiene ejercicios duplicados con el ID: " + exerciseId);
        this.exerciseId = exerciseId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }
}
