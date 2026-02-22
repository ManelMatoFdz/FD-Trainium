package es.udc.fi.dc.fd.model.services.exceptions;

public class PremiumRequiredException extends RuntimeException {
  public PremiumRequiredException(String message) {
    super(message);
  }
}
