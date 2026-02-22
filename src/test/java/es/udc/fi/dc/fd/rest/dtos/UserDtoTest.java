package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import static org.junit.Assert.*;

public class UserDtoTest {

    @Test
    public void testNoArgConstructor() {
        UserDto dto = new UserDto();
        assertNotNull(dto);
        assertNull(dto.getId());
        assertNull(dto.getUserName());
        assertNull(dto.getPassword());
        assertNull(dto.getFirstName());
        assertNull(dto.getLastName());
        assertNull(dto.getEmail());
        assertNull(dto.getRole());
        assertNull(dto.getFormation());
        assertNull(dto.getAvatarSeed());
        assertNull(dto.getAvatarUrl());
        assertNull(dto.getAvatarImage());
        assertNull(dto.getAvatarImageType());
        assertNull(dto.getHeightCm());
        assertNull(dto.getWeightKg());
        assertNull(dto.getBmi());
        assertNull(dto.getBmiCategory());
        assertNull(dto.getGender());
        assertNull(dto.getFollowersCount());
        assertNull(dto.getFollowingCount());
        assertNull(dto.getIsPremium());
        assertNull(dto.getBadges());
    }

    @Test
    public void testParameterizedConstructor() {
        Long id = 1L;
        String userName = "testuser";
        String firstName = "John";
        String lastName = "Doe";
        String email = "john.doe@example.com";
        String role = "USER";
        String formation = "Computer Science";
        String avatarSeed = "avatar123";
        String avatarUrl = "https://example.com/avatar.jpg";
        byte[] avatarImage = new byte[]{1, 2, 3, 4, 5};
        String avatarImageType = "image/jpeg";
        Boolean isPremium = false;

        UserDto dto = new UserDto(id, userName, firstName, lastName, email, role, formation,
                avatarSeed, avatarUrl, avatarImage, avatarImageType, isPremium);

        assertEquals(id, dto.getId());
        assertEquals(userName, dto.getUserName());
        assertEquals(firstName, dto.getFirstName());
        assertEquals(lastName, dto.getLastName());
        assertEquals(email, dto.getEmail());
        assertEquals(role, dto.getRole());
        assertEquals(formation, dto.getFormation());
        assertEquals(avatarSeed, dto.getAvatarSeed());
        assertEquals(avatarUrl, dto.getAvatarUrl());
        assertArrayEquals(avatarImage, dto.getAvatarImage());
        assertEquals(avatarImageType, dto.getAvatarImageType());
        assertEquals(isPremium, dto.getIsPremium());
    }

    @Test
    public void testSetId() {
        UserDto dto = new UserDto();
        dto.setId(99L);

        assertEquals(Long.valueOf(99L), dto.getId());
    }

    @Test
    public void testSetUserName() {
        UserDto dto = new UserDto();
        dto.setUserName("newuser");

        assertEquals("newuser", dto.getUserName());
    }

    @Test
    public void testSetUserNameTrimming() {
        UserDto dto = new UserDto();
        dto.setUserName("  username  ");

        assertEquals("username", dto.getUserName());
    }

    @Test
    public void testSetPassword() {
        UserDto dto = new UserDto();
        dto.setPassword("securepassword");

        assertEquals("securepassword", dto.getPassword());
    }

    @Test
    public void testSetFirstName() {
        UserDto dto = new UserDto();
        dto.setFirstName("Jane");

        assertEquals("Jane", dto.getFirstName());
    }

    @Test
    public void testSetFirstNameTrimming() {
        UserDto dto = new UserDto();
        dto.setFirstName("  Jane  ");

        assertEquals("Jane", dto.getFirstName());
    }

    @Test
    public void testSetLastName() {
        UserDto dto = new UserDto();
        dto.setLastName("Smith");

        assertEquals("Smith", dto.getLastName());
    }

    @Test
    public void testSetLastNameTrimming() {
        UserDto dto = new UserDto();
        dto.setLastName("  Smith  ");

        assertEquals("Smith", dto.getLastName());
    }

    @Test
    public void testSetEmail() {
        UserDto dto = new UserDto();
        dto.setEmail("jane.smith@example.com");

        assertEquals("jane.smith@example.com", dto.getEmail());
    }

    @Test
    public void testSetEmailTrimming() {
        UserDto dto = new UserDto();
        dto.setEmail("  jane.smith@example.com  ");

        assertEquals("jane.smith@example.com", dto.getEmail());
    }

    @Test
    public void testSetRole() {
        UserDto dto = new UserDto();
        dto.setRole("TRAINER");

        assertEquals("TRAINER", dto.getRole());
    }

    @Test
    public void testSetFormation() {
        UserDto dto = new UserDto();
        dto.setFormation("Sports Science");

        assertEquals("Sports Science", dto.getFormation());
    }

    @Test
    public void testSetAvatarSeed() {
        UserDto dto = new UserDto();
        dto.setAvatarSeed("newseed123");

        assertEquals("newseed123", dto.getAvatarSeed());
    }

    @Test
    public void testSetAvatarUrl() {
        UserDto dto = new UserDto();
        dto.setAvatarUrl("https://newurl.com/avatar.png");

        assertEquals("https://newurl.com/avatar.png", dto.getAvatarUrl());
    }

    @Test
    public void testSetAvatarImage() {
        UserDto dto = new UserDto();
        byte[] imageData = new byte[]{10, 20, 30, 40, 50};
        dto.setAvatarImage(imageData);

        assertArrayEquals(imageData, dto.getAvatarImage());
    }

    @Test
    public void testSetAvatarImageType() {
        UserDto dto = new UserDto();
        dto.setAvatarImageType("image/png");

        assertEquals("image/png", dto.getAvatarImageType());
    }

    @Test
    public void testSetHeightCm() {
        UserDto dto = new UserDto();
        dto.setHeightCm(180.5);

        assertEquals(Double.valueOf(180.5), dto.getHeightCm());
    }

    @Test
    public void testSetWeightKg() {
        UserDto dto = new UserDto();
        dto.setWeightKg(75.2);

        assertEquals(Double.valueOf(75.2), dto.getWeightKg());
    }

    @Test
    public void testSetBmi() {
        UserDto dto = new UserDto();
        dto.setBmi(22.5);

        assertEquals(Double.valueOf(22.5), dto.getBmi());
    }

    @Test
    public void testSetBmiCategory() {
        UserDto dto = new UserDto();
        dto.setBmiCategory("Normal");

        assertEquals("Normal", dto.getBmiCategory());
    }

    @Test
    public void testSetGender() {
        UserDto dto = new UserDto();
        dto.setGender("FEMALE");

        assertEquals("FEMALE", dto.getGender());
    }

    @Test
    public void testSetFollowersCount() {
        UserDto dto = new UserDto();
        dto.setFollowersCount(150L);

        assertEquals(Long.valueOf(150L), dto.getFollowersCount());
    }

    @Test
    public void testSetFollowingCount() {
        UserDto dto = new UserDto();
        dto.setFollowingCount(85L);

        assertEquals(Long.valueOf(85L), dto.getFollowingCount());
    }

    @Test
    public void testSetIsPremium() {
        UserDto dto = new UserDto();
        dto.setIsPremium(true);

        assertTrue(dto.getIsPremium());

        dto.setIsPremium(false);
        assertFalse(dto.getIsPremium());
    }

    @Test
    public void testConstructorWithNullValues() {
        UserDto dto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null);

        assertNull(dto.getId());
        assertNull(dto.getUserName());
        assertNull(dto.getFirstName());
        assertNull(dto.getLastName());
        assertNull(dto.getEmail());
        assertNull(dto.getRole());
        assertNull(dto.getFormation());
        assertNull(dto.getAvatarSeed());
        assertNull(dto.getAvatarUrl());
        assertNull(dto.getAvatarImage());
        assertNull(dto.getAvatarImageType());
        assertNull(dto.getIsPremium());
    }

    @Test
    public void testConstructorWithEmptyStrings() {
        UserDto dto = new UserDto(1L, "", "", "", "", "", "", "", "", new byte[0], "", false);

        assertEquals("", dto.getUserName());
        assertEquals("", dto.getFirstName());
        assertEquals("", dto.getLastName());
        assertEquals("", dto.getEmail());
        assertEquals("", dto.getRole());
        assertEquals("", dto.getFormation());
        assertEquals("", dto.getAvatarSeed());
        assertEquals("", dto.getAvatarUrl());
        assertArrayEquals(new byte[0], dto.getAvatarImage());
        assertEquals("", dto.getAvatarImageType());
        assertFalse(dto.getIsPremium());
    }

    @Test
    public void testAllGettersAndSetters() {
        UserDto dto = new UserDto();

        dto.setId(1L);
        dto.setUserName("testuser");
        dto.setPassword("password123");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setEmail("john.doe@example.com");
        dto.setRole("TRAINER");
        dto.setFormation("Sports Science");
        dto.setAvatarSeed("seed123");
        dto.setAvatarUrl("https://avatar.com/img.jpg");
        byte[] imageData = new byte[]{1, 2, 3};
        dto.setAvatarImage(imageData);
        dto.setAvatarImageType("image/jpeg");
        dto.setHeightCm(185.0);
        dto.setWeightKg(80.0);
        dto.setBmi(23.4);
        dto.setBmiCategory("Normal");
        dto.setGender("MALE");
        dto.setFollowersCount(200L);
        dto.setFollowingCount(100L);
        dto.setIsPremium(true);
        java.util.List<String> badges = java.util.Arrays.asList("first_workout", "strength_weight_40");
        dto.setBadges(badges);

        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals("testuser", dto.getUserName());
        assertEquals("password123", dto.getPassword());
        assertEquals("John", dto.getFirstName());
        assertEquals("Doe", dto.getLastName());
        assertEquals("john.doe@example.com", dto.getEmail());
        assertEquals("TRAINER", dto.getRole());
        assertEquals("Sports Science", dto.getFormation());
        assertEquals("seed123", dto.getAvatarSeed());
        assertEquals("https://avatar.com/img.jpg", dto.getAvatarUrl());
        assertArrayEquals(imageData, dto.getAvatarImage());
        assertEquals("image/jpeg", dto.getAvatarImageType());
        assertEquals(Double.valueOf(185.0), dto.getHeightCm());
        assertEquals(Double.valueOf(80.0), dto.getWeightKg());
        assertEquals(Double.valueOf(23.4), dto.getBmi());
        assertEquals("Normal", dto.getBmiCategory());
        assertEquals("MALE", dto.getGender());
        assertEquals(Long.valueOf(200L), dto.getFollowersCount());
        assertEquals(Long.valueOf(100L), dto.getFollowingCount());
        assertTrue(dto.getIsPremium());
        assertEquals(badges, dto.getBadges());
    }

    @Test
    public void testZeroValues() {
        UserDto dto = new UserDto();
        dto.setFollowersCount(0L);
        dto.setFollowingCount(0L);
        dto.setHeightCm(0.0);
        dto.setWeightKg(0.0);
        dto.setBmi(0.0);

        assertEquals(Long.valueOf(0L), dto.getFollowersCount());
        assertEquals(Long.valueOf(0L), dto.getFollowingCount());
        assertEquals(Double.valueOf(0.0), dto.getHeightCm());
        assertEquals(Double.valueOf(0.0), dto.getWeightKg());
        assertEquals(Double.valueOf(0.0), dto.getBmi());
    }

    @Test
    public void testNullAvatarImage() {
        UserDto dto = new UserDto();
        dto.setAvatarImage(null);

        assertNull(dto.getAvatarImage());
    }

    @Test
    public void testEmptyAvatarImage() {
        UserDto dto = new UserDto();
        dto.setAvatarImage(new byte[0]);

        assertNotNull(dto.getAvatarImage());
        assertEquals(0, dto.getAvatarImage().length);
    }
}
