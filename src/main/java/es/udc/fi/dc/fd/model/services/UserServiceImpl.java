package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.events.BadgesEarnedEvent;
import es.udc.fi.dc.fd.model.services.exceptions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.dto.FeedItemDto;

/**
 * The Class UserServiceImpl.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {
    private static final String ENTITY_USER = "project.entities.user";

	/** The permission checker. */
	@Autowired
	private PermissionChecker permissionChecker;

	/** The password encoder. */
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	/** The user dao. */
	@Autowired
	private UserDao userDao;

	/** The notification dao. */
	@Autowired
    private NotificationDao notificationDao;

	/** The routine execution dao. */
	@Autowired
	private RoutineExecutionDao routineExecutionDao;

	/** The routine dao. */
	@Autowired
	private RoutineDao routineDao;

	@Autowired
	private es.udc.fi.dc.fd.model.entities.RoutineExecutionCommentDao routineExecutionCommentDao;

    @Autowired
    private MessageSource messageSource;

	@Autowired
	private org.springframework.context.ApplicationEventPublisher eventPublisher;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	@Lazy
	private RoutineExecutionService routineExecutionService;

	/**
	 * Sign up.
	 *
	 * @param user the user
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	@Override
	public void signUp(Users user) throws DuplicateInstanceException {

        if (userDao.existsByUserName(user.getUserName())) {
            throw new DuplicateInstanceException(ENTITY_USER, user.getUserName());
        }

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		
		if (user.getFormation() != null && !user.getFormation().isEmpty()) user.setRole(Users.RoleType.TRAINER);
		else user.setRole(Users.RoleType.USER);

		if (user.getAvatarSeed() == null) {
            user.setAvatarSeed(UUID.randomUUID().toString());
        }

		// Inicializar contadores de seguimiento en 0
		user.setFollowersCount(0L);
		user.setFollowingCount(0L);

		userDao.save(user);

	}

	/**
	 * Login.
	 *
	 * @param userName the username
	 * @param password the password
	 * @return the user
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	@Override
	@Transactional
	public Users login(String userName, String password) throws IncorrectLoginException, InstanceNotFoundException {

		Optional<Users> user = userDao.findByUserName(userName);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}
		Users useropt = user.get();

		// Check if user is banned by admin - treat as non-existent
		if (Boolean.TRUE.equals(useropt.getBannedByAdmin())) {
			throw new IncorrectLoginException(userName, password);
		}

		if (!passwordEncoder.matches(password, useropt.getPassword())) {
			throw new IncorrectLoginException(userName, password);
		}

		notificationService.checkDailyStreakWarning(useropt.getId());

		return user.get();

	}

	/**
	 * Login from id.
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Users loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	/**
	 * Get profile
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Users getProfile(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	/**
	 * Find user by id (no permission check for current user).
	 */
	@Override
	@Transactional(readOnly = true)
	public Users findUserById(Long id) throws InstanceNotFoundException {
        return userDao.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_USER, id));
	}

	/**
	 * Search users by username containing the given substring (case-insensitive).
	 */
	@Override
	@Transactional(readOnly = true)
	public List<Users> searchUser(Long requesterId, String userNamePart) {
		if (userNamePart == null || userNamePart.isBlank()) {
			return Collections.emptyList();
		}
		Users requester;
		try {
			requester = permissionChecker.checkUser(requesterId);
		} catch (InstanceNotFoundException e) {
			return Collections.emptyList();
		}

		Set<Long> blockedByIds = requester.getBlockedByUsers()
				.stream().map(Users::getId).collect(Collectors.toSet());

		List<Users> results;
		if (requester.isAdmin()) {
			// ADMINs can see all users including banned ones
			results = userDao.findByUserNameContainingIgnoreCaseAndRoleNot(
					userNamePart.trim(), Users.RoleType.ADMIN);
		} else {
			// Regular users cannot see banned users
			results = userDao.findByUserNameContainingIgnoreCaseAndRoleNotAndBannedByAdminFalse(
					userNamePart.trim(), Users.RoleType.ADMIN);
		}

		return results.stream()
				.filter(u -> !blockedByIds.contains(u.getId()))
				.collect(Collectors.toList());
	}

	/**
	 * Update profile.
	 *
	 * @param id        the id
	 * @param firstName the first name
	 * @param lastName  the last name
	 * @param email     the email
	 * @param formation the formation
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
    public Users updateProfile(Long id, String firstName, String lastName, String email, String formation, String avatarUrl, byte[] avatarImage, String avatarImageType,
                               Double heightCm, Double weightKg, String gender)
                throws InstanceNotFoundException, IllegalArgumentException {

		Users user = permissionChecker.checkUser(id);

		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setEmail(email);

		if (avatarUrl == null || avatarUrl.isBlank()) {
			user.setAvatarUrl(null);
		} else {
			user.setAvatarUrl(avatarUrl);
		}

		if (user.getFormation() != null) user.setFormation(formation);

		if (checkUserImagen(avatarImage, avatarImageType)) {
			user.setAvatarImage(avatarImage);
			user.setAvatarImageType(avatarImageType);
		} else {
			user.setAvatarImage(null);
			user.setAvatarImageType(null);
		}

		if (heightCm != null) {
			user.setHeightCm(heightCm);
		}

		if (weightKg != null) {
			user.setWeightKg(weightKg);
		}

		if (gender != null && !gender.isBlank()) {
			user.setGender(gender.toUpperCase());
		}

		return user;

	}

	/**
	 * Change password.
	 *
	 * @param id          the id
	 * @param oldPassword the old password
	 * @param newPassword the new password
	 * @throws InstanceNotFoundException  the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	@Override
	public void changePassword(Long id, String oldPassword, String newPassword)
			throws InstanceNotFoundException, IncorrectPasswordException {

		Users user = permissionChecker.checkUser(id);

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		} else {
			user.setPassword(passwordEncoder.encode(newPassword));
		}

	}

	private static final long MAX_IMAGE_SIZE = 16L * 1024 * 1024; // 16 MB

	private static final Set<String> OK_TYPES = Set.of(
	    "image/png",
	    "image/jpeg",
	    "image/jpg",
	    "image/webp",
	    "image/gif",
	    "image/svg+xml"
	);

	private boolean checkUserImagen(byte[] avatarImage, String avatarImageType) throws IllegalArgumentException {

		if (avatarImage != null && avatarImage.length > 0 &&
		    avatarImageType != null && !avatarImageType.isEmpty()) {

			String type = avatarImageType.toLowerCase();

			if (!OK_TYPES.contains(type)) {
				throw new IllegalArgumentException("project.error.avatar.format");
			}

			if (avatarImage.length > MAX_IMAGE_SIZE) {
				throw new IllegalArgumentException("project.error.avatar.size");
			}

			return true;
		}

		return false;
	}

	/**
	 * Follow user.
	 *
	 * @param userId    the user id
	 * @param followeeId the user id to follow
	 * @throws InstanceNotFoundException if user or followee not found
	 * @throws AlreadyFollowedException  if already following
	 */
	@Override
	@Transactional
	public void followTrainer(Long userId, Long followeeId) throws InstanceNotFoundException, AlreadyFollowedException {
		Users user = permissionChecker.checkUser(userId);

		Users followee = permissionChecker.checkUser(followeeId);

		boolean alreadyFollowing = followee.getFollowers().stream()
				.anyMatch(follower -> follower.getId().equals(userId));

		if (alreadyFollowing) {
			throw new AlreadyFollowedException();
		}

		List<String> oldBadges = getUserBadges(user.getId());
		List<String> oldBadges2 = getUserBadges(followee.getId());

		// Añadir la relación de seguimiento
		user.getFollowing().add(followee);
		followee.getFollowers().add(user);

		// Actualizar contadores explícitamente
		user.setFollowingCount((long) user.getFollowing().size());
		followee.setFollowersCount((long) followee.getFollowers().size());

		// Persistir ambos usuarios con los contadores actualizados
		userDao.save(user);
		userDao.save(followee);

		List<String> newBadges = getUserBadges(user.getId());
		newBadges.removeAll(oldBadges);

		if (!newBadges.isEmpty()) {
			eventPublisher.publishEvent(new BadgesEarnedEvent(this, user, newBadges));
		}

		List<String> newBadges2 = getUserBadges(followee.getId());
		newBadges2.removeAll(oldBadges2);

		if (!newBadges2.isEmpty()) {
			eventPublisher.publishEvent(new BadgesEarnedEvent(this, followee, newBadges2));
		}
		// Notificación al usuario seguido
		var locale = LocaleContextHolder.getLocale();
		String title = messageSource.getMessage("notification.user.followed.title", null, locale);
		String message = messageSource.getMessage(
				"notification.user.followed.message",
				new Object[]{ user.getUserName() },
				locale);
		notificationDao.save(new Notification(followee, title, message));
	}

	/**
	 * Unfollow user.
	 *
	 * @param userId    the user id
	 * @param followeeId the user id to unfollow
	 * @throws InstanceNotFoundException if user or followee not found
	 * @throws AlreadyNotFollowedException  if not currently following
	 */
	@Override
	@Transactional
	public void unfollowTrainer(Long userId, Long followeeId) throws InstanceNotFoundException, AlreadyNotFollowedException {
		Users user = permissionChecker.checkUser(userId);

		Users followee = permissionChecker.checkUser(followeeId);

		boolean following = followee.getFollowers().stream()
				.anyMatch(follower -> follower.getId().equals(userId));

		if (!following) {
			throw new AlreadyNotFollowedException();
		}

		// Eliminar la relación de seguimiento
		user.getFollowing().remove(followee);
		followee.getFollowers().remove(user);

		// Actualizar contadores explícitamente
		user.setFollowingCount((long) user.getFollowing().size());
		followee.setFollowersCount((long) followee.getFollowers().size());

		// Persistir ambos usuarios con los contadores actualizados
		userDao.save(user);
		userDao.save(followee);
	}

	/**
	 * Comprueba si un usuario sigue a otro.
	 *
	 * @param userId    ID del usuario que quiere seguir
	 * @param followeeId ID del otro usuario
	 * @return true si el usuario sigue al otro, false en caso contrario
	 * @throws InstanceNotFoundException si el usuario no existe
	 */
	@Override
	@Transactional
	public boolean isFollowingTrainer(Long userId, Long followeeId) throws InstanceNotFoundException {
        Users followee = userDao.findById(followeeId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_USER, followeeId));

		return followee.getFollowers().stream()
				.anyMatch(follower -> follower.getId().equals(userId));
	}

	/**
	 * Get followers list for a user.
	 */
	@Override
	@Transactional(readOnly = true)
	public java.util.List<Users> getFollowers(Long id) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(id);
		return new java.util.ArrayList<>(user.getFollowers());
	}

	/**
	 * Get following list for a user.
	 */
	@Override
	@Transactional(readOnly = true)
	public java.util.List<Users> getFollowing(Long id) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(id);
		return new java.util.ArrayList<>(user.getFollowing());
	}

	/**
	 * Calcula las insignias del usuario a partir de sus ejecuciones de rutinas.
	 */
	@Override
	@Transactional(readOnly = true)
	public java.util.List<String> getUserBadges(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		java.util.List<RoutineExecution> executions = routineExecutionDao.findByUser_Id(userId);
		java.util.List<String> badges = new java.util.ArrayList<>(UserBadgesCalculator.calculateBadges(executions));

		long followers = user.getFollowersCount() != null ? user.getFollowersCount() : 0L;
		long following = user.getFollowingCount() != null ? user.getFollowingCount() : 0L;
		long comments = routineExecutionCommentDao.countByUser_Id(userId);
		long likes = routineExecutionService.getTotalLikesReceived(userId, executions);

		addSocialBadges(badges, followers, "followers");
		addSocialBadges(badges, following, "following");
		addSocialBadges(badges, comments, "comments");
		addSocialBadges(badges, likes, "likes");

		return badges;
	}

	private void addSocialBadges(java.util.List<String> badges, long count, String baseCode) {
		if (count >= 1) {
			badges.add(baseCode + "_bronze");
		}
		if (count >= 5) {
			badges.add(baseCode + "_silver");
		}
		if (count >= 10) {
			badges.add(baseCode + "_gold");
		}
	}

	@Override
	@Transactional
	public Users activatePremium(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);

		if (user.getRole() == Users.RoleType.TRAINER) {
			user.setIsPremium(true);
			userDao.save(user);

			var locale = LocaleContextHolder.getLocale();
			String title = messageSource.getMessage("notification.premium.activated.title", null, locale);
			String message = messageSource.getMessage(
					"notification.premium.activated.message",
					new Object[]{ user.getUserName() },
					locale);
			notificationDao.save(new Notification(user, title, message));
		}
		return user;
	}

	@Override
	@Transactional
	public Users deactivatePremium(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);

		if (user.getRole() == Users.RoleType.TRAINER) {
			user.setIsPremium(false);
			userDao.save(user);

			var locale = LocaleContextHolder.getLocale();
			String title = messageSource.getMessage("notification.premium.deactivated.title", null, locale);
			String message = messageSource.getMessage(
					"notification.premium.deactivated.message",
					new Object[]{ user.getUserName() },
					locale);
			notificationDao.save(new Notification(user, title, message));
		}

		return user;
	}

	/**
	 * Obtiene el feed de actividad para un usuario.
	 * Incluye tanto ejecuciones como rutinas públicas nuevas de los usuarios seguidos.
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<FeedItemDto> getFeed(Long userId, int page, int size) throws InstanceNotFoundException {
		Users user = userDao.findById(userId)
			.orElseThrow(() -> new InstanceNotFoundException(ENTITY_USER, userId));

		Set<Users> following = user.getFollowing();
		if (following.isEmpty()) {
			return Page.empty();
		}
		// Filtrar los usuarios bloqueados y que nos han bloqueado
		Set<Long> blockedIds = user.getBlockedUsers().stream().map(Users::getId).collect(Collectors.toSet());
		Set<Long> blockedByIds = user.getBlockedByUsers().stream().map(Users::getId).collect(Collectors.toSet());

		List<Long> followingIds = following.stream()
			.map(Users::getId)
			.filter(id -> !blockedIds.contains(id) && !blockedByIds.contains(id)) // excluir bloqueos
			.collect(java.util.stream.Collectors.toList());

		// Obtener ejecuciones de seguidos (más elementos para combinar)
		int fetchSize = size * 2;
		Pageable execPageable = PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.DESC, "performedAt"));
		List<RoutineExecution> executions = routineExecutionDao.findByUserIdIn(followingIds, execPageable).getContent();

		// Obtener rutinas públicas de seguidos
		Pageable routinePageable = PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.DESC, "createdAt"));
		List<Routine> routines = routineDao.findByUserIdInAndOpenPublicTrue(followingIds, routinePageable).getContent();

		// Combinar ambos tipos en una lista de DTOs
		List<FeedItemDto> allItems = new ArrayList<>();
		
		for (RoutineExecution exec : executions) {
			allItems.add(toFeedItemDto(exec, userId));
		}
		
		for (Routine routine : routines) {
			allItems.add(toFeedItemDto(routine));
		}

		// Ordenar por fecha descendente (más reciente primero)
		allItems.sort(Comparator.comparing(
			(FeedItemDto dto) -> dto.getPerformedAt() != null ? dto.getPerformedAt() : LocalDateTime.MIN
		).reversed());

		// Aplicar paginación manual
		int start = page * size;
		int end = Math.min(start + size, allItems.size());
		
		if (start >= allItems.size()) {
			return Page.empty();
		}

		List<FeedItemDto> pageContent = allItems.subList(start, end);
		int totalElements = allItems.size();

		return new org.springframework.data.domain.PageImpl<>(
			pageContent,
			PageRequest.of(page, size),
			totalElements
		);
	}

	/**
	 * Convierte una RoutineExecution a FeedItemDto.
	 */
	private FeedItemDto toFeedItemDto(RoutineExecution execution, Long currentUserId) {
		FeedItemDto dto = new FeedItemDto();
		dto.setId(execution.getId());
		dto.setRoutineId(execution.getRoutine().getId());
		dto.setRoutineName(execution.getRoutine().getName());
		dto.setAuthorId(execution.getUser().getId());
		dto.setAuthorUserName(execution.getUser().getUserName());
		dto.setAuthorAvatarSeed(execution.getUser().getAvatarSeed());
		dto.setPerformedAt(execution.getPerformedAt());
		dto.setType("EXECUTION");
		dto.setLikesCount(execution.getLikedByUsers() != null ? execution.getLikedByUsers().size() : 0);
		dto.setCommentsCount(execution.getComments() != null ? execution.getComments().size() : 0);
		dto.setTotalDurationSec(execution.getTotalDurationSec());
		dto.setRoutineLevel(execution.getRoutine().getLevel());
		if (execution.getRoutine().getCategory() != null) {
			dto.setCategoryName(execution.getRoutine().getCategory().getName());
		}
		
		// Verificar si el usuario actual ha dado like
		boolean likedByMe = execution.getLikedByUsers() != null && 
			execution.getLikedByUsers().stream()
				.anyMatch(u -> u.getId().equals(currentUserId));
		dto.setLikedByCurrentUser(likedByMe);
		
		return dto;
	}

	/**
	 * Convierte una Routine a FeedItemDto.
	 */
	private FeedItemDto toFeedItemDto(Routine routine) {
		FeedItemDto dto = new FeedItemDto();
		dto.setId(routine.getId());
		dto.setRoutineId(routine.getId());
		dto.setRoutineName(routine.getName());
		dto.setAuthorId(routine.getUser().getId());
		dto.setAuthorUserName(routine.getUser().getUserName());
		dto.setAuthorAvatarSeed(routine.getUser().getAvatarSeed());
		dto.setPerformedAt(routine.getCreatedAt());
		dto.setType("ROUTINE");
		dto.setLikesCount(0); // Las rutinas no tienen likes (por ahora)
		dto.setCommentsCount(0);
		dto.setTotalDurationSec(null);
		dto.setRoutineLevel(routine.getLevel());
		if (routine.getCategory() != null) {
			dto.setCategoryName(routine.getCategory().getName());
		}
		dto.setLikedByCurrentUser(false); // Las rutinas no tienen likes
		return dto;
	}

	@Override
	@Transactional
	public void blockUser(Long userId, Long blockedUserId) throws InstanceNotFoundException, AlreadyBlockedException {
		Users user = permissionChecker.checkUser(userId);
		Users blocked = permissionChecker.checkUser(blockedUserId);

		if (user.getBlockedUsers().contains(blocked)) {
			throw new AlreadyBlockedException();
		}

		user.getBlockedUsers().add(blocked);

		//Los usuarios se dejan de seguir mutuamente
		if (user.getFollowing().contains(blocked)) {
			user.unfollow(blocked);
		}

		if (blocked.getFollowing().contains(user)) {
			blocked.unfollow(user);
		}

		userDao.save(user);
		userDao.save(blocked);
	}

	@Override
	@Transactional
	public void unblockUser(Long userId, Long blockedUserId) throws InstanceNotFoundException, NotBlockedException {
		Users user = permissionChecker.checkUser(userId);
		Users blocked = permissionChecker.checkUser(blockedUserId);

		if (!user.getBlockedUsers().contains(blocked)) {
			throw new NotBlockedException();
		}

		user.getBlockedUsers().remove(blocked);
		userDao.save(user);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean isBlocked(Long userId, Long otherUserId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		Users other = permissionChecker.checkUser(otherUserId);

		return user.getBlockedUsers().contains(other);
	}
	@Override
	@Transactional(readOnly = true)
	public List<Users> getBlockedUsers(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		return new ArrayList<>(user.getBlockedUsers());
	}

	@Override
	@Transactional
	public void adminBanUser(Long adminId, Long userId) 
			throws InstanceNotFoundException, PermissionException {
		Users admin = permissionChecker.checkUser(adminId);
		if (!admin.isAdmin()) {
			throw new PermissionException();
		}

		Users userToBan = permissionChecker.checkUser(userId);

		// Cannot ban another admin
		if (userToBan.isAdmin()) {
			throw new PermissionException();
		}

		userToBan.setBannedByAdmin(true);
		userDao.save(userToBan);
	}

	@Override
	@Transactional
	public void adminUnbanUser(Long adminId, Long userId)
			throws InstanceNotFoundException, PermissionException {
		Users admin = permissionChecker.checkUser(adminId);
		if (!admin.isAdmin()) {
			throw new PermissionException();
		}

		Users userToUnban = permissionChecker.checkUser(userId);
		userToUnban.setBannedByAdmin(false);
		userDao.save(userToUnban);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Users> getBannedUsers(Long adminId)
			throws InstanceNotFoundException, PermissionException {
		Users admin = permissionChecker.checkUser(adminId);
		if (!admin.isAdmin()) {
			throw new PermissionException();
		}

		return userDao.findByBannedByAdminTrue();
	}

}
