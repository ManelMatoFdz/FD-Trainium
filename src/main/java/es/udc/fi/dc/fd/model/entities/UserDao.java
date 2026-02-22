package es.udc.fi.dc.fd.model.entities;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * The Interface UserDao.
 */
public interface UserDao extends JpaRepository<Users, Long> {

	/**
	 * Exists by user name.
	 *
	 * @param userName the user name
	 * @return true, if successful
	 */
	boolean existsByUserName(String userName);

	/**
	 * Find by user name.
	 *
	 * @param userName the user name
	 * @return the optional
	 */
	Optional<Users> findByUserName(String userName);

	/**
	 * Find users whose username contains the given substring, case-insensitive,
	 * excluding a given role.
	 *
	 * @param userName the substring to search in usernames
	 * @param role the role to exclude (e.g., ADMIN)
	 * @return the list of matching users not having the excluded role
	 */
	java.util.List<Users> findByUserNameContainingIgnoreCaseAndRoleNot(String userName, Users.RoleType role);

	/**
	 * Find users whose username contains the given substring, case-insensitive,
	 * excluding a given role and excluding banned users.
	 */
	java.util.List<Users> findByUserNameContainingIgnoreCaseAndRoleNotAndBannedByAdminFalse(
			String userName, Users.RoleType role);

	/**
	 * Find all users banned by admin (for admin panel).
	 */
	java.util.List<Users> findByBannedByAdminTrue();

}
