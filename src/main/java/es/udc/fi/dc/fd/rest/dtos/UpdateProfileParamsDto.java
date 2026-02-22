package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.rest.dtos.UserDto.AllValidations;
import es.udc.fi.dc.fd.rest.dtos.UserDto.UpdateValidations;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

public class UpdateProfileParamsDto {
    
    private String firstName;
    private String lastName;
    private String email;
    private String formation;
    private String avatarUrl; 
	private byte[]  avatarImage;
	private String avatarImageType;

    private Double heightCm;
    private Double weightKg;
    private String gender;

    @Size(max = 60)
    public String getFirstName() { return firstName; }

    public void setFirstName(String v) { this.firstName = v; }

    @Size(max = 60)
    public String getLastName() { return lastName; }

    public void setLastName(String v) { this.lastName = v; }

    @Email(groups={AllValidations.class, UpdateValidations.class})
    @Size(max = 60)
    public String getEmail() { return email; }

    public void setEmail(String v) { this.email = v; }

    @Size(max = 100)
    public String getFormation() { return formation; }

    public void setFormation(String v) { this.formation = v; }

    @Size(max = 255)
    @Pattern(regexp = "^(https?://.*)?$", message = "avatarUrl must start with http:// or https://", groups = UserDto.UpdateValidations.class)
    public String getAvatarUrl() { return avatarUrl; }

    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public byte[] getAvatarImage() {
        return avatarImage;
    }

    public void setAvatarImage(byte[] avatarImage) {
        this.avatarImage = avatarImage;
    }

    public String getAvatarImageType() {
        return avatarImageType;
    }
    
    public void setAvatarImageType(String avatarImageType) {
        this.avatarImageType = avatarImageType;
    }

    @DecimalMin(value = "50", inclusive = true, message = "heightCm must be >= 50")
    @DecimalMax(value = "300", inclusive = true, message = "heightCm must be <= 300")
    public Double getHeightCm() { return heightCm; }

    public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

    @DecimalMin(value = "20", inclusive = true, message = "weightKg must be >= 20")
    @DecimalMax(value = "500", inclusive = true, message = "weightKg must be <= 500")
    public Double getWeightKg() { return weightKg; }

    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    @Pattern(regexp = "^(?i)(MALE|FEMALE|OTHER)?$", message = "gender must be MALE, FEMALE or OTHER", groups = UserDto.UpdateValidations.class)
    public String getGender() { return gender; }

    public void setGender(String gender) { this.gender = gender; }
}
