package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class DuplicateExerciseException extends Exception {

    public DuplicateExerciseException(String message) {
        super(message);
    }
}
