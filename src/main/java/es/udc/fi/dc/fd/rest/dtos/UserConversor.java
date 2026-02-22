package es.udc.fi.dc.fd.rest.dtos;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Users;

/**
 * The Class UserConversor.
 */
public class UserConversor {

	/**
	 * Instantiates a new user conversor.
	 */
	private UserConversor() {
	}

	/**
	 * To user dto.
	 *
	 * @param u the u
	 * @return the user dto
	 */
	public static UserDto toUserDto(Users u) {
	    UserDto dto = new UserDto();
	    dto.setId(u.getId());
	    dto.setUserName(u.getUserName());
	    dto.setFirstName(u.getFirstName());
	    dto.setLastName(u.getLastName());
	    dto.setEmail(u.getEmail());
	    dto.setRole(u.getRole().toString());
	    dto.setFormation(u.getFormation());
	    dto.setAvatarSeed(u.getAvatarSeed());
	    dto.setHeightCm(u.getHeightCm());
	    dto.setWeightKg(u.getWeightKg());
	    dto.setBmi(u.getBmi());
	    dto.setBmiCategory(u.getBmiCategory());
	    dto.setGender(u.getGender());
	    dto.setFollowersCount(u.getFollowersCount());
	    dto.setFollowingCount(u.getFollowingCount());
		dto.setIsPremium(u.getIsPremium());
		dto.setBannedByAdmin(u.getBannedByAdmin());

	    String url = u.getAvatarUrl();
	    if (url == null && u.getAvatarImage() != null) {
	        String type = (u.getAvatarImageType() == null || u.getAvatarImageType().isBlank())
	                ? "image/png" : u.getAvatarImageType();
	        String b64 = Base64.getEncoder().encodeToString(u.getAvatarImage());
	        url = "data:" + type + ";base64," + b64;
	    }
	    dto.setAvatarUrl(url);

	    return dto;
	}

	/**
	 * Converts a list of Users entities to a list of UserDto.
	 *
	 * @param users the list of Users entities
	 * @return the list of UserDto
	 */
	public static List<UserDto> toUserDtos(List<Users> users) {
		return users.stream().map(UserConversor::toUserDto).collect(Collectors.toList());
	}

	/**
	 * To user.
	 *
	 * @param userDto the user dto
	 * @return the user
	 */
	public static final Users toUser(UserDto userDto) {

		Users u = new Users(userDto.getUserName(), userDto.getPassword(), userDto.getFirstName(), userDto.getLastName(),
				userDto.getEmail(), userDto.getFormation());
		u.setHeightCm(userDto.getHeightCm());
		u.setWeightKg(userDto.getWeightKg());
		u.setGender(userDto.getGender());
		return u;
	}

	/**
	 * To authenticated user dto.
	 *
	 * @param serviceToken the service token
	 * @param user         the user
	 * @return the authenticated user dto
	 */
	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, Users user) {

		AuthenticatedUserDto dto = new AuthenticatedUserDto();
        dto.setServiceToken(serviceToken);
        dto.setUserDto(toUserDto(user));
        return dto;

	}

	public static UserSummaryDto toUserSummaryDto(Users u) {

		String url = u.getAvatarUrl();
		if (url == null && u.getAvatarImage() != null) {
			String type = (u.getAvatarImageType() == null || u.getAvatarImageType().isBlank())
					? "image/png" : u.getAvatarImageType();
			String b64 = Base64.getEncoder().encodeToString(u.getAvatarImage());
			url = "data:" + type + ";base64," + b64;
		}

		return new UserSummaryDto(
				u.getId(),
				u.getUserName(),
				url,
				u.getAvatarSeed()
		);
	}

	public static List<UserSummaryDto> toUserSummaryDtos(List<Users> users) {
		return users.stream()
				.map(UserConversor::toUserSummaryDto)
				.collect(Collectors.toList());
	}


}

