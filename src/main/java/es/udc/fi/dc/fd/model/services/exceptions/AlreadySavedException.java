package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadySavedException extends RuntimeException {
    public AlreadySavedException() {
        super("The routine is already saved.");
    }

    public AlreadySavedException(String message) {
        super(message);
    }
}
