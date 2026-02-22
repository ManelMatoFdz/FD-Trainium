package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.*;
import es.udc.fi.dc.fd.dto.FeedItemDto;

import java.util.List;

/**
 * The Interface UserService.
 */
public interface UserService {
	
	/**
	 * Sign up.
	 *
	 * @param user the user
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	void signUp(Users user) throws DuplicateInstanceException;
	
	/**
	 * Login.
	 *
	 * @param userName the username
	 * @param password the password
	 * @return the user
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	Users login(String userName, String password) throws IncorrectLoginException, InstanceNotFoundException;
	
	/**
	 * Login from id.
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users loginFromId(Long id) throws InstanceNotFoundException;

	/**
	 * Get profile
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users getProfile(Long id) throws InstanceNotFoundException;

	/**
	 * Find user by id (no permission check for current user).
	 *
	 * @param id the user id
	 * @return the user
	 * @throws InstanceNotFoundException if the user does not exist
	 */
	Users findUserById(Long id) throws InstanceNotFoundException;

	/**
	 * Search users by username containing the given substring (case-insensitive).
	 * Returns an empty list if the term is null/blank.
	 *
	 * @param userNamePart substring to look for in usernames
	 * @return list of matching users
	 */
	java.util.List<Users> searchUser(Long requesterId, String userNamePart);

	/**
	 * Update profile.
	 *
	 * @param id the id
	 * @param firstName the first name
	 * @param lastName the last name
	 * @param email the email
	 * @param formation the formation
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
    Users updateProfile(Long id, String firstName, String lastName, String email, String formation,
                    String avatarUrl, byte[] avatarImage, String avatarImageType,
                    Double heightCm, Double weightKg, String gender)
    throws InstanceNotFoundException;
	
	/**
	 * Change password.
	 *
	 * @param id the id
	 * @param oldPassword the old password
	 * @param newPassword the new password
	 * @throws InstanceNotFoundException the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;

	/**
	 * Follow another user.
	 *
	 * @param userId    the user id who wants to follow
	 * @param followeeId the user id to follow
	 * @throws InstanceNotFoundException if user or followee not found
	 * @throws AlreadyFollowedException  if already following
	 */
	void followTrainer(Long userId, Long followeeId) throws InstanceNotFoundException, AlreadyFollowedException;

	/**
	 * Unfollow another user.
	 *
	 * @param userId    the user id who wants to unfollow
	 * @param followeeId the user id to unfollow
	 * @throws InstanceNotFoundException if user or followee not found
	 */
	void unfollowTrainer(Long userId, Long followeeId) throws InstanceNotFoundException;

	/**
	 * Check if a user is following another user.
	 *
	 * @param userId the user id
	 * @param followeeId the other user id
	 * @return true if userId follows followeeId, false otherwise
	 * @throws InstanceNotFoundException if followee not found
	 */
	boolean isFollowingTrainer(Long userId, Long followeeId) throws InstanceNotFoundException;

	/**
	 * Get the list of followers of a user.
	 *
	 * @param id the user id
	 * @return list of users who follow the given user
	 * @throws InstanceNotFoundException if user not found
	 */
	java.util.List<Users> getFollowers(Long id) throws InstanceNotFoundException;

	/**
	 * Get the list of users that a user is following.
	 *
	 * @param id the user id
	 * @return list of users the given user is following
	 * @throws InstanceNotFoundException if user not found
	 */
	java.util.List<Users> getFollowing(Long id) throws InstanceNotFoundException;

	/**
	 * Calcula las insignias del usuario en base a sus ejecuciones de rutinas.
	 *
	 * @param id id del usuario
	 * @return lista de códigos de insignias desbloqueadas
	 * @throws InstanceNotFoundException si el usuario no existe
	 */
	java.util.List<String> getUserBadges(Long id) throws InstanceNotFoundException;

	Users activatePremium(Long userId) throws InstanceNotFoundException;

	Users deactivatePremium(Long userId) throws InstanceNotFoundException;

	/**
	 * Obtiene el feed de actividad para un usuario.
	 * 
	 * El feed incluye las ejecuciones de rutinas realizadas por los usuarios
	 * que sigue el usuario actual, ordenadas por fecha descendente.
	 * 
	 * @param userId ID del usuario que solicita el feed
	 * @param page número de página (0-indexed)
	 * @param size tamaño de página
	 * @return página de FeedItemDto ordenada cronológicamente
	 * @throws InstanceNotFoundException si el usuario no existe
	 */
	org.springframework.data.domain.Page<FeedItemDto> getFeed(Long userId, int page, int size) throws InstanceNotFoundException;

	void blockUser(Long userId, Long blockedUserId) throws InstanceNotFoundException, AlreadyBlockedException;

	void unblockUser(Long userId, Long blockedUserId) throws InstanceNotFoundException, NotBlockedException;

	boolean isBlocked(Long userId, Long otherUserId) throws InstanceNotFoundException;

	List<Users> getBlockedUsers(Long userId) throws InstanceNotFoundException;

	/**
	 * Ban a user by admin. Only admins can call this.
	 * The banned user will not be able to login and will be invisible to other users.
	 *
	 * @param adminId the admin user id performing the ban
	 * @param userId  the user id to ban
	 * @throws InstanceNotFoundException if user not found
	 * @throws PermissionException       if caller is not admin
	 */
	void adminBanUser(Long adminId, Long userId) throws InstanceNotFoundException, PermissionException;

	/**
	 * Unban a user by admin.
	 *
	 * @param adminId the admin user id performing the unban
	 * @param userId  the user id to unban
	 * @throws InstanceNotFoundException if user not found
	 * @throws PermissionException       if caller is not admin
	 */
	void adminUnbanUser(Long adminId, Long userId) throws InstanceNotFoundException, PermissionException;

	/**
	 * Get all banned users. Only admins can call this.
	 *
	 * @param adminId the admin user id requesting the list
	 * @return list of banned users
	 * @throws InstanceNotFoundException if admin not found
	 * @throws PermissionException       if caller is not admin
	 */
	List<Users> getBannedUsers(Long adminId) throws InstanceNotFoundException, PermissionException;

}
