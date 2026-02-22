package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * The Class UserDto.
 */
@SuppressWarnings("squid:S107")
public class UserDto {
	
	/**
	 * The Interface AllValidations.
	 */
	public interface AllValidations {}
	
	/**
	 * The Interface UpdateValidations.
	 */
	public interface UpdateValidations {}

	/** The id. */
	private Long id;
	
	/** The username. */
	private String userName;
	
	/** The password. */
	private String password;
	
	/** The first name. */
	private String firstName;
	
	/** The last name. */
	private String lastName;
	
	/** The email. */
	private String email;
	
	/** The role. */
	private String role;

	/** The formation */
	private String formation;

	/** The avatar seed */
	private String avatarSeed;

	/** The avatar url */
    private String avatarUrl;

	/** The avatar image */
	private byte[]  avatarImage;

	/** The avatar image type */
	private String avatarImageType;

	// Height (cm) and weight (kg)
	private Double heightCm;
	private Double weightKg;

	// Computed BMI and category (read-only for clients)
	private Double bmi;
	private String bmiCategory;

	// Gender (MALE|FEMALE|OTHER)
	private String gender;

	// Followers and following counts
	private Long followersCount;
	private Long followingCount;
	private Boolean isPremium;

	// Badge codes calculated from training history
	private java.util.List<String> badges;

	// Whether the user is banned by admin (only visible to admins)
	private Boolean bannedByAdmin;


	/**
	 * Instantiates a new user dto.
	 */
	public UserDto() {}

	/**
	 * Instantiates a new user dto.
	 *
	 * @param id the id
	 * @param userName the username
	 * @param firstName the first name
	 * @param lastName the last name
	 * @param email the email
	 * @param role the role
	 * @param formation the formation
	 */
	public UserDto(Long id, String userName, String firstName, String lastName, String email, String role, String formation, String avatarSeed, String avatarUrl, byte[] avatarImage, String avatarImageType, Boolean isPremium) {

		this.id = id;
		this.userName = userName != null ? userName.trim() : null;
		this.firstName = firstName != null ? firstName.trim() : null;
		this.lastName = lastName != null ? lastName.trim() : null;
		this.email = email != null ? email.trim() : null;
		this.role = role;
		this.formation = formation;
		this.avatarSeed = avatarSeed;
		this.avatarUrl = avatarUrl;
		this.avatarImage = avatarImage;
		this.avatarImageType = avatarImageType;
		this.isPremium = isPremium;
		
	}

	/**
	 * Gets the id.
	 *
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Sets the id.
	 *
	 * @param id the new id
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * Gets the username.
	 *
	 * @return the username
	 */
	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class})
	public String getUserName() {
		return userName;
	}

	/**
	 * Sets the username.
	 *
	 * @param userName the new username
	 */
	public void setUserName(String userName) {
		this.userName = userName.trim();
	}

	/**
	 * Gets the password.
	 *
	 * @return the password
	 */
	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class})
	public String getPassword() {
		return password;
	}

	/**
	 * Sets the password.
	 *
	 * @param password the new password
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * Gets the first name.
	 *
	 * @return the first name
	 */
	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class, UpdateValidations.class})
	public String getFirstName() {
		return firstName;
	}

	/**
	 * Sets the first name.
	 *
	 * @param firstName the new first name
	 */
	public void setFirstName(String firstName) {
		this.firstName = firstName.trim();
	}

	/**
	 * Gets the last name.
	 *
	 * @return the last name
	 */
	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class, UpdateValidations.class})
	public String getLastName() {
		return lastName;
	}

	/**
	 * Sets the last name.
	 *
	 * @param lastName the new last name
	 */
	public void setLastName(String lastName) {
		this.lastName = lastName.trim();
	}

	/**
	 * Gets the email.
	 *
	 * @return the email
	 */
	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class, UpdateValidations.class})
	@Email(groups={AllValidations.class, UpdateValidations.class})
	public String getEmail() {
		return email;
	}

	/**
	 * Sets the email.
	 *
	 * @param email the new email
	 */
	public void setEmail(String email) {
		this.email = email.trim();
	}

	/**
	 * Gets the role.
	 *
	 * @return the role
	 */
	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	public String getRole() {
		return role;
	}

	/**
	 * Sets the role.
	 *
	 * @param role the new role
	 */
	public void setRole(String role) {
		this.role = role;
	}

	/**
	 * Gets the formation.
	 *
	 * @return the role
	 */
	public String getFormation() {
		return formation;
	}

	/**
	 * Sets the formation.
	 *
	 * @param formation the new role
	 */
	public void setFormation(String formation) {
		this.formation = formation;
	}

	/**
	 * Gets the avatar seed.
	 *
	 * @return the avatar seed
	 */
	public String getAvatarSeed() {
		return avatarSeed;
	}

	/**
	 * Sets the avatar seed.
	 *
	 * @param avatarSeed the new avatar seed
	 */
	public void setAvatarSeed(String avatarSeed) {
		this.avatarSeed = avatarSeed;
	}

	/**
	 * Gets the avatar URL.
	 *
	 * @return the avatar URL
	 */
	public String getAvatarUrl() {
		return avatarUrl;
	}

	/**
	 * Sets the avatar URL.
	 *
	 * @param avatarUrl the new avatar URL
	 */
	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}

	/**
	 * Gets the avatar image.
	 *
	 * @return the avatar image
	 */
	public byte[] getAvatarImage() {
		return avatarImage;
	}
	
	/**
	 * Sets the avatar image.
	 *
	 * @param avatarImage the new avatar image
	 */
	public void setAvatarImage(byte[] avatarImage) {
		this.avatarImage = avatarImage;
	}

	/**
	 * Gets the avatar image type.
	 *
	 * @return the avatar image type
	 */
	public String getAvatarImageType() {
		return avatarImageType;
	}

	/**
	 * Sets the avatar image type.
	 *
	 * @param avatarImageType the new avatar image type
	 */
	public void setAvatarImageType(String avatarImageType) {
		this.avatarImageType = avatarImageType;
	}

	public Double getHeightCm() { return heightCm; }

	public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

	public Double getWeightKg() { return weightKg; }

	public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

	public Double getBmi() { return bmi; }

	public void setBmi(Double bmi) { this.bmi = bmi; }

	public String getBmiCategory() { return bmiCategory; }

	public void setBmiCategory(String bmiCategory) { this.bmiCategory = bmiCategory; }

	public String getGender() { return gender; }

	public void setGender(String gender) { this.gender = gender; }

	public Long getFollowersCount() { return followersCount; }

	public void setFollowersCount(Long followersCount) { this.followersCount = followersCount; }

	public Long getFollowingCount() { return followingCount; }

	public void setFollowingCount(Long followingCount) { this.followingCount = followingCount; }

	public Boolean getIsPremium() { return isPremium; }

	public void setIsPremium(Boolean isPremium) { this.isPremium = isPremium; }

	public java.util.List<String> getBadges() { return badges; }

	public void setBadges(java.util.List<String> badges) { this.badges = badges; }

	public Boolean getBannedByAdmin() { return bannedByAdmin; }

	public void setBannedByAdmin(Boolean bannedByAdmin) { this.bannedByAdmin = bannedByAdmin; }

}

