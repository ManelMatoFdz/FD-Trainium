package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyFollowedException extends RuntimeException {
  public AlreadyFollowedException() {
    super("The trainer is already followed.");
  }

    public AlreadyFollowedException(String message) {
        super(message);
    }
}
