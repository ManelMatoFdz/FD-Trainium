package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyNotFollowedException extends RuntimeException {
  public AlreadyNotFollowedException() {
    super("The trainer is already unfollowed.");
  }
    public AlreadyNotFollowedException(String message) {
        super(message);
    }
}
