package es.udc.fi.dc.fd.model.services.exceptions;

public class PermissionException extends RuntimeException {
    public PermissionException() { super(); }
    public PermissionException(String msg) { super(msg); }
}
