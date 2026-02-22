package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyLikedException extends RuntimeException {
    public AlreadyLikedException() {
        super("The routine execution is already liked by this user.");
    }

    public AlreadyLikedException(String message) {
        super(message);
    }
}

