package es.udc.fi.dc.fd.model.services.exceptions;

/**
 * Exception thrown when a user account has been banned by an administrator.
 */
public class UserBannedException extends Exception {

    private static final long serialVersionUID = 1L;

    public UserBannedException() {
        super("User account has been banned by administrator");
    }
}
