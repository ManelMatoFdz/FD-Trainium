package es.udc.fi.dc.fd.model.entities;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Transient;

/**
 * The Class User.
 */
@Entity
public class                Users {

	/**
	 * The Enum RoleType.
	 */
	public enum RoleType {
		/** The user. */
		USER,
		/** The trainer*/
		TRAINER,
		/** The admin*/
		ADMIN
	}

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

	/** The formation. */
	private String formation;

	/** The role. */
	private RoleType role;

	/** The avatar seed. */
    private String avatarSeed;

	/** The avatar url. */
	private String avatarUrl;

    /** The avatar image. */
    private byte[] avatarImage;

	/** The avatar image type. */
    private String avatarImageType;

	// Height in centimeters (nullable)
	private Double heightCm;

	// Weight in kilograms (nullable)
	private Double weightKg;

	// Gender (nullable): MALE | FEMALE | OTHER
	private String gender;

	// Denormalized follower/following counts
	private Long followersCount;

	// Denormalized following counts
	private Long followingCount;

	private Set<Routine> savedRoutines = new HashSet<>();

	private Set<Users> following = new HashSet<>();

	private Set<Users> followers = new HashSet<>();
	private Boolean premium = false;

	private Set<Users> blockedUsers = new HashSet<>();

	private Set<Users> blockedByUsers = new HashSet<>();

	private Boolean bannedByAdmin = false;

	/**
	 * Instantiates a new user.
	 */
	public Users() {
	}

	/**
	 * Instantiates a new user.
	 *
	 * @param userName  the username
	 * @param password  the password
	 * @param firstName the first name
	 * @param lastName  the last name
	 * @param email     the email
	 * @param formation the formation of the trainer
	 */
	public Users(String userName, String password, String firstName, String lastName, String email, String formation) {

		this.userName = userName;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.formation = formation;
		this.avatarSeed = "default-" + userName;

	}

	/**
	 * Gets the id.
	 *
	 * @return the id
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
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
	public String getUserName() {
		return userName;
	}

	/**
	 * Sets the username.
	 *
	 * @param userName the new username
	 */
	public void setUserName(String userName) {
		this.userName = userName;
	}

	/**
	 * Gets the password.
	 *
	 * @return the password
	 */
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
	public String getFirstName() {
		return firstName;
	}

	/**
	 * Sets the first name.
	 *
	 * @param firstName the new first name
	 */
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	/**
	 * Gets the last name.
	 *
	 * @return the last name
	 */
	public String getLastName() {
		return lastName;
	}

	/**
	 * Sets the last name.
	 *
	 * @param lastName the new last name
	 */
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	/**
	 * Gets the email.
	 *
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * Sets the email.
	 *
	 * @param email the new email
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * Gets the formation.
	 *
	 * @return the formation
	 */
	public String getFormation() {
		return formation;
	}

	/**
	 * Sets the formation.
	 *
	 * @param formation the new formation
	 */
	public void setFormation(String formation) {
		this.formation = formation;
	}

	/**
	 * Gets the role.
	 *
	 * @return the role
	 */
	public RoleType getRole() {
		return role;
	}

	/**
	 * Sets the role.
	 *
	 * @param role the new role
	 */
	public void setRole(RoleType role) {
		this.role = role;
	}

	/**
	 * Indicates if the user has admin role.
	 * @return true if admin, false otherwise
	 */
	@Transient
	public boolean isAdmin() {
		return RoleType.ADMIN.equals(role);
	}


	@ManyToMany
	@JoinTable(
		name = "UserRoutines",
		joinColumns = @JoinColumn(name = "userId"),
		inverseJoinColumns = @JoinColumn(name = "routineId")
	)
	public Set<Routine> getSavedRoutines() {
		return savedRoutines;
	}

	public void setSavedRoutines(Set<Routine> savedRoutines) {
		this.savedRoutines = savedRoutines;
	}

	public void addSavedRoutine(Routine routine) {
		this.savedRoutines.add(routine);
		routine.getSavedByUsers().add(this);
	}

	public void removeSavedRoutine(Routine routine) {
		this.savedRoutines.remove(routine);
		routine.getSavedByUsers().remove(this);
	}

	@Column(length = 64, nullable = false)
	public String getAvatarSeed() { return avatarSeed; }

    public void setAvatarSeed(String avatarSeed) { this.avatarSeed = avatarSeed; }

    @Column(length = 255)
	public String getAvatarUrl() { return avatarUrl; }

    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    @Lob
    @Basic(fetch = FetchType.LAZY)
	@Column(columnDefinition = "MEDIUMBLOB")
	public byte[] getAvatarImage() { return avatarImage; }

    public void setAvatarImage(byte[] avatarImage) { this.avatarImage = avatarImage; }

	@Column(length = 64)
    public String getAvatarImageType() { return avatarImageType; }

    public void setAvatarImageType(String avatarImageType) { this.avatarImageType = avatarImageType; }

	@Column
	public Double getHeightCm() { return heightCm; }

	public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

	@Column
	public Double getWeightKg() { return weightKg; }

	public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

	public Long getFollowersCount() { return followersCount; }

	public void setFollowersCount(Long followersCount) { this.followersCount = followersCount; }

	public Long getFollowingCount() { return followingCount; }

	public void setFollowingCount(Long followingCount) { this.followingCount = followingCount; }

	@Transient
	public Double getBmi() {
		if (heightCm == null || weightKg == null) return null;
		if (heightCm <= 0 || weightKg <= 0) return null;
		double h = heightCm / 100.0;
		if (h <= 0) return null;
		return weightKg / (h * h);
	}

	@Transient
	public String getBmiCategory() {
		Double bmi = getBmi();
		if (bmi == null) return null;
		if (bmi < 18.5) return "UNDERWEIGHT";
		if (bmi < 25.0) return "NORMAL";
		if (bmi < 30.0) return "OVERWEIGHT";
		return "OBESITY";
	}

	@Column(length = 16)
	public String getGender() { return gender; }

	public void setGender(String gender) { this.gender = gender; }

	@Column(name = "premium")
	public Boolean getIsPremium() { return premium; }
	public void setIsPremium(Boolean isPremium) { this.premium = isPremium; }

	@Column(name = "bannedByAdmin")
	public Boolean getBannedByAdmin() { return bannedByAdmin; }
	public void setBannedByAdmin(Boolean bannedByAdmin) { this.bannedByAdmin = bannedByAdmin; }

    // owning side: usuarios que este usuario sigue
    @ManyToMany
    @JoinTable(
        name = "UserFollows",
        joinColumns = @JoinColumn(name = "followerId"),
        inverseJoinColumns = @JoinColumn(name = "followeeId")
    )
    public Set<Users> getFollowing() {
        return following;
    }

    public void setFollowing(Set<Users> following) {
        this.following = following;
    }

    // inverse side: usuarios que siguen a este usuario
    @ManyToMany(mappedBy = "following")
    public Set<Users> getFollowers() {
        return followers;
    }

    public void setFollowers(Set<Users> followers) {
        this.followers = followers;
    }

    public void follow(Users user) {
        if (user == null || this.equals(user)) {
            return;
        }
        if (this.getFollowing().contains(user)) {
            return; // ya lo sigue
        }
        this.getFollowing().add(user);
        user.getFollowers().add(this);
        this.setFollowingCount((long) this.getFollowing().size());
        user.setFollowersCount((long) user.getFollowers().size());
    }

    public void unfollow(Users user) {
        if (user == null || this.equals(user)) {
            return;
        }
        if (!this.getFollowing().contains(user)) {
            return; // no lo seguía
        }
        this.getFollowing().remove(user);
        user.getFollowers().remove(this);
        this.setFollowingCount((long) this.getFollowing().size());
        user.setFollowersCount((long) user.getFollowers().size());
    }
	@ManyToMany
	@JoinTable(
			name = "user_blocks",
			joinColumns = @JoinColumn(name = "blocker_id"),
			inverseJoinColumns = @JoinColumn(name = "blocked_id")
	)
	public Set<Users> getBlockedUsers() {
		return blockedUsers;
	}

	public void setBlockedUsers(Set<Users> blockedUsers) {
		this.blockedUsers = blockedUsers;
	}
	@ManyToMany(mappedBy = "blockedUsers")
	public Set<Users> getBlockedByUsers() {
		return blockedByUsers;
	}

	public void setBlockedByUsers(Set<Users> blockedByUsers) {
		this.blockedByUsers = blockedByUsers;
	}
}
