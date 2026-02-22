package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotBlank;

public class UpdateExerciseImageDto {
    @NotBlank
    private String base64Image;

    @NotBlank
    private String imageMimeType;

    // Getters y setters
    public String getBase64Image() { return base64Image; }
    public void setBase64Image(String base64Image) { this.base64Image = base64Image; }

    public String getImageMimeType() { return imageMimeType; }
    public void setImageMimeType(String imageMimeType) { this.imageMimeType = imageMimeType; }

}
