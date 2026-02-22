package es.udc.fi.dc.fd.rest.controllers;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.exceptions.*;
import es.udc.fi.dc.fd.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.udc.fi.dc.fd.dto.FeedItemDto;
import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.WrappedService;
import es.udc.fi.dc.fd.model.services.WrappedStats;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyFollowedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyNotFollowedException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.NotBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.common.JwtInfo;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ChangePasswordParamsDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.UpdateProfileParamsDto;
import es.udc.fi.dc.fd.rest.dtos.UserConversor;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toAuthenticatedUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUser;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDtos;
import es.udc.fi.dc.fd.rest.dtos.UserDto;
import es.udc.fi.dc.fd.rest.dtos.UserSummaryDto;

/**
 * The Class UserController.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

	/** The Constant INCORRECT_LOGIN_EXCEPTION_CODE. */
	private static final String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";

	/** The Constant INCORRECT_PASSWORD_EXCEPTION_CODE. */
	private static final String INCORRECT_PASS_EXCEPTION_CODE = "project.exceptions.IncorrectPasswordException";

	/** The message source. */
	@Autowired
	private MessageSource messageSource;

	/** The jwt generator. */
	@Autowired
	private JwtGenerator jwtGenerator;

	/** The user service. */
	@Autowired
	private UserService userService;

	/** The wrapped service for yearly statistics. */
	@Autowired
	private WrappedService wrappedService;

	/**
	 * Handle incorrect login exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(IncorrectLoginException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
				INCORRECT_LOGIN_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorsDto handleIllegalArgumentException(IllegalArgumentException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(IllegalArgumentException.class.getName(), null,
				IllegalArgumentException.class.getName(), locale);

		return new ErrorsDto(errorMessage);

	}
	
	/**
	 * Handle incorrect password exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(IncorrectPasswordException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectPasswordException(IncorrectPasswordException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_PASS_EXCEPTION_CODE, null,
				INCORRECT_PASS_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ExceptionHandler(AlreadyFollowedException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorsDto handleAlreadyFollowedException(AlreadyFollowedException exception, Locale locale) {

		String errorMessage = messageSource.getMessage("project.exceptions.AlreadyFollowedException", null,
				"project.exceptions.AlreadyFollowedException", locale);

		return new ErrorsDto(errorMessage);
	}

	@ExceptionHandler(AlreadyNotFollowedException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorsDto handleAlreadyNotFollowedException(AlreadyNotFollowedException exception, Locale locale) {

		String errorMessage = messageSource.getMessage("project.exceptions.AlreadyNotFollowedException", null,
				"project.exceptions.AlreadyNotFollowedException", locale);

		return new ErrorsDto(errorMessage);
	}
	@ExceptionHandler(AlreadyBlockedException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorsDto handleAlreadyBlockedException(AlreadyBlockedException exception, Locale locale) {
		String errorMessage = messageSource.getMessage(
				"project.exceptions.AlreadyBlockedException",
				null,
				"project.exceptions.AlreadyBlockedException",
				locale
		);
		return new ErrorsDto(errorMessage);
	}

	@ExceptionHandler(NotBlockedException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorsDto handleNotBlockedException(NotBlockedException exception, Locale locale) {
		String errorMessage = messageSource.getMessage(
				"project.exceptions.NotBlockedException",
				null,
				"project.exceptions.NotBlockedException",
				locale
		);
		return new ErrorsDto(errorMessage);
	}



	/**
	 * Sign up.
	 *
	 * @param userDto the user dto
	 * @return the response entity
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	@PostMapping("/signUp")
	public ResponseEntity<AuthenticatedUserDto> signUp(
			@Validated({ UserDto.AllValidations.class }) @RequestBody UserDto userDto)
			throws DuplicateInstanceException {

		Users user = toUser(userDto);

		userService.signUp(user);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.getId())
				.toUri();

		return ResponseEntity.created(location).body(toAuthenticatedUserDto(generateServiceToken(user), user));

	}

	/**
	 * Login.
	 *
	 * @param params the params
	 * @return the authenticated user dto
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	@PostMapping("/login")
	public AuthenticatedUserDto login(@Validated @RequestBody LoginParamsDto params) throws IncorrectLoginException, InstanceNotFoundException {

		Users user = userService.login(params.getUserName(), params.getPassword());

		return toAuthenticatedUserDto(generateServiceToken(user), user);

	}

	/**
	 * Login from service token.
	 *
	 * @param userId       the user id
	 * @param serviceToken the service token
	 * @return the authenticated user dto
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@PostMapping("/loginFromServiceToken")
	public AuthenticatedUserDto loginFromServiceToken(@RequestAttribute Long userId,
			@RequestAttribute String serviceToken) throws InstanceNotFoundException {

		Users user = userService.loginFromId(userId);

		return toAuthenticatedUserDto(serviceToken, user);

	}

	/**
	 * Get my profile (authenticated user).
	 *
	 * @param userId the id of the authenticated user (from JWT)
	 * @return the user dto
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@GetMapping("/myProfile")
	public UserDto getMyProfile(@RequestAttribute Long userId)
			throws InstanceNotFoundException {
		var user = userService.getProfile(userId);
		UserDto dto = toUserDto(user);
		dto.setBadges(userService.getUserBadges(userId));
		return dto;
	}

	/**
	 * Find a user profile by id (no ownership restriction beyond authentication).
	 */
	@GetMapping("/{id}")
	public UserDto findUserById(@PathVariable("id") Long id) throws InstanceNotFoundException {
		var user = userService.findUserById(id);
		UserDto dto = toUserDto(user);
		dto.setBadges(userService.getUserBadges(id));
		return dto;
	}

	/**
	 * List followers of a user.
	 */
	@GetMapping("/{id}/followers")
	public List<UserDto> getFollowers(@PathVariable("id") Long id) throws InstanceNotFoundException {
		return toUserDtos(userService.getFollowers(id));
	}

	/**
	 * List users followed by a user.
	 */
	@GetMapping("/{id}/following")
	public List<UserDto> getFollowing(@PathVariable("id") Long id) throws InstanceNotFoundException {
		return toUserDtos(userService.getFollowing(id));
	}

	/**
	 * Search users by username containing the given substring (case-insensitive).
	 * Accepts either 'userName' or 'username' as query parameter names.
	 */
	@GetMapping("/search")
	public List<UserDto> searchUsers(
			@RequestAttribute Long userId,
			@RequestParam(name = "userName", required = false) String userName,
			@RequestParam(name = "username", required = false) String username
	) {
		String term = resolveSearchTerm(userName, username);
		return toUserDtos(userService.searchUser(userId,term));
	}


	/**
	 * Update profile.
	 *
	 * @param userId  the user id
	 * @param id      the id
	 * @param userDto the user dto
	 * @return the user dto
	 * @throws InstanceNotFoundException the instance not found exception
	 * @throws PermissionException       the permission exception
	 */
	@PutMapping("{id}") 
	public UserDto updateProfile(
			@RequestAttribute Long userId,
			@PathVariable("id") Long id,
			@Validated({ UserDto.UpdateValidations.class })
			@RequestBody UpdateProfileParamsDto userDto) 
			throws InstanceNotFoundException, PermissionException {

		if (!id.equals(userId)) {
			throw new PermissionException();
		}

		var updated = userService.updateProfile(
			id,
			userDto.getFirstName(),
			userDto.getLastName(),
			userDto.getEmail(),
			userDto.getFormation(),
			userDto.getAvatarUrl(),       
			userDto.getAvatarImage(),    
				userDto.getAvatarImageType(),
				userDto.getHeightCm(),
				userDto.getWeightKg(),
				userDto.getGender()
			);

		return toUserDto(updated);
	}

	/**
	 * Change password.
	 *
	 * @param userId the user id
	 * @param id     the id
	 * @param params the params
	 * @throws PermissionException        the permission exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	@PostMapping("/{id}/changePassword")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@RequestAttribute Long userId, @PathVariable Long id,
			@Validated @RequestBody ChangePasswordParamsDto params)
			throws PermissionException, InstanceNotFoundException, IncorrectPasswordException {

		if (!id.equals(userId)) {
			throw new PermissionException();
		}

		userService.changePassword(id, params.getOldPassword(), params.getNewPassword());

	}
	
	/**
	 * Resolve search term from query parameters.
	 *
	 * @param userName the userName parameter
	 * @param username the username parameter
	 * @return the resolved search term
	 */
	private String resolveSearchTerm(String userName, String username) {
		if (userName != null && !userName.isBlank()) {
			return userName;
		}
		if (username != null) {
			return username;
		}
		return "";
	}

	/**
	 * Generate service token.
	 *
	 * @param user the user
	 * @return the string
	 */
	private String generateServiceToken(Users user) {

		JwtInfo jwtInfo = new JwtInfo(user.getId(), user.getUserName(), user.getRole().toString());

		return jwtGenerator.generate(jwtInfo);

	}

	/**
	 * Follow another user.
	 *
	 * @param userId the authenticated user id
	 * @param id the id of the user to follow
	 * @throws InstanceNotFoundException if user not found
	 * @throws AlreadyFollowedException if already following
	 */
	@PostMapping("/{id}/follow")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void followUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException, AlreadyFollowedException {
		userService.followTrainer(userId, id);
	}

	/**
	 * Unfollow another user.
	 *
	 * @param userId the authenticated user id
	 * @param id the id of the user to unfollow
	 * @throws InstanceNotFoundException if user not found
	 */
	@DeleteMapping("/{id}/unfollow")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void unfollowUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException {
		userService.unfollowTrainer(userId, id);
	}

	/**
	 * Check if the authenticated user is following another user.
	 *
	 * @param userId the authenticated user id
	 * @param id the id of the other user
	 * @return true if following, false otherwise
	 * @throws InstanceNotFoundException if user not found
	 */
	@GetMapping("/{id}/isFollowing")
	public boolean isFollowingUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException {
		return userService.isFollowingTrainer(userId, id);
	}

	@PostMapping("/{id}/premium")
	public UserDto activatePremium(@PathVariable Long id) throws InstanceNotFoundException {
		return toUserDto(userService.activatePremium(id));
	}

	@PostMapping("/{id}/premium/remove")
	public UserDto deactivatePremium(@PathVariable Long id) throws InstanceNotFoundException {
		return toUserDto(userService.deactivatePremium(id));
	}

	/**
	 * Obtiene el feed de actividad del usuario autenticado.
	 *
	 * El feed contiene las ejecuciones de rutinas de los usuarios que sigue,
	 * ordenadas cronológicamente (más recientes primero).
	 * 
	 * @param userId ID del usuario autenticado (inyectado desde el token JWT)
	 * @param page número de página (por defecto 0)
	 * @param size tamaño de página (por defecto 10)
	 * @return página de FeedItemDto
	 */
	@GetMapping("/feed")
	public Page<FeedItemDto> getFeed(
			@RequestAttribute Long userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
		return userService.getFeed(userId, page, size);
	}

	/**
	 * Get the user's wrapped yearly statistics.
	 *
	 * @param userId the authenticated user id (from JWT)
	 * @param year   the year to get stats for (defaults to current year)
	 * @return the wrapped statistics
	 * @throws InstanceNotFoundException if user not found
	 */
	@GetMapping("/wrapped")
	public WrappedStats getWrapped(
			@RequestAttribute Long userId,
			@RequestParam(required = false) Integer year) throws InstanceNotFoundException {
		// If year not provided, use current year if in December, otherwise previous year
		int currentYear = java.time.Year.now().getValue();
		int currentMonth = java.time.LocalDate.now().getMonthValue();
		int targetYear;
		if (year != null) {
			targetYear = year;
		} else {
			targetYear = (currentMonth == 12) ? currentYear : currentYear - 1;
		}
		return wrappedService.getWrappedStats(userId, targetYear);
	}

	@PostMapping("/{id}/block")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void blockUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException, AlreadyBlockedException {
		userService.blockUser(userId, id);
	}

	@DeleteMapping("/{id}/unblock")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void unblockUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException, NotBlockedException {
		userService.unblockUser(userId, id);
	}

	@GetMapping("/{id}/isBlocked")
	public Map<String, Boolean> isBlocked(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException {

		boolean blockedByMe = userService.isBlocked(userId, id);
		boolean blockedMe = userService.isBlocked(id, userId);

		Map<String, Boolean> response = new HashMap<>();
		response.put("blockedByMe", blockedByMe);
		response.put("blockedMe", blockedMe);

		return response;
	}

	@GetMapping("/blocked")
	public List<UserSummaryDto> getBlockedUsers(@RequestParam Long userId)
			throws InstanceNotFoundException {

		List<Users> blocked = userService.getBlockedUsers(userId);
		return blocked.stream()
				.map(UserConversor::toUserSummaryDto)
				.toList();
	}

	/**
	 * Ban a user (ADMIN only).
	 * The banned user will not be able to login and will be invisible to regular users.
	 */
	@PostMapping("/{id}/admin-ban")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void adminBanUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException, PermissionException {
		userService.adminBanUser(userId, id);
	}

	/**
	 * Unban a user (ADMIN only).
	 */
	@DeleteMapping("/{id}/admin-ban")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void adminUnbanUser(@RequestAttribute Long userId, @PathVariable Long id)
			throws InstanceNotFoundException, PermissionException {
		userService.adminUnbanUser(userId, id);
	}

	/**
	 * Get all banned users (ADMIN only).
	 */
	@GetMapping("/admin-banned")
	public List<UserSummaryDto> getBannedUsers(@RequestAttribute Long userId)
			throws InstanceNotFoundException, PermissionException {
		return userService.getBannedUsers(userId).stream()
				.map(UserConversor::toUserSummaryDto)
				.toList();
	}

}
