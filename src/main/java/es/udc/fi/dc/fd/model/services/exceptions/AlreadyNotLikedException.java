package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyNotLikedException extends RuntimeException {
    public AlreadyNotLikedException() {
        super("The routine execution is not liked by this user.");
    }

    public AlreadyNotLikedException(String message) {
        super(message);
    }
}

