package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyBlockedException extends Exception {

    public AlreadyBlockedException() {
        super();
    }

    public AlreadyBlockedException(String message) {
        super(message);
    }

}