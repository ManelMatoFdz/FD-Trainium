package es.udc.fi.dc.fd.model.services.exceptions;

public class RoutineWithoutExercisesException extends RuntimeException {

  public RoutineWithoutExercisesException() {
    super("Routine must have almost 1 exercise.");
  }

  public RoutineWithoutExercisesException(String message) {
    super(message);
  }
}

