package es.udc.fi.dc.fd.model.services;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import es.udc.fi.dc.fd.model.services.exceptions.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import jakarta.transaction.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserDao userDao;

    private Users createUser(String userName) {
        return new Users(userName, "password", "firstName", "lastName", userName + "@mail.com", null);
    }


    @Test
    public void testSearchUser_excludesAdmin() throws DuplicateInstanceException {
        Users requester = createUser("requester");
        userService.signUp(requester);

        Users alice = createUser("alice");
        userService.signUp(alice);

        Users alicia = createUser("alicia");
        alicia.setFormation("X");
        userService.signUp(alicia);

        Users admin = new Users("adminAli", "p", "A", "D", "a@d.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        userDao.save(admin);

        List<Users> found = userService.searchUser(requester.getId(),"ali");
        List<String> names = found.stream().map(Users::getUserName).toList();

        assertTrue(names.contains("alice"));
        assertTrue(names.contains("alicia"));
        assertFalse(names.contains("adminAli"));
        assertEquals(2, found.size());
    }

    @Test
    public void testSearchUser_emptyOrNull() throws DuplicateInstanceException {
        Users requester = createUser("requester");
        userService.signUp(requester);

        assertTrue(userService.searchUser(requester.getId(),"").isEmpty());
        assertTrue(userService.searchUser(requester.getId(),"   ").isEmpty());
        assertTrue(userService.searchUser(requester.getId(),null).isEmpty());
        assertTrue(userService.searchUser(requester.getId(),"zzzz").isEmpty());
    }


    @Test
    public void testSignUpAndLoginFromId() throws Exception {
        Users user = createUser("user");
        userService.signUp(user);
        Users logged = userService.loginFromId(user.getId());
        assertEquals(user, logged);
    }


    @Test
    public void testSignUpAndLoginTrainer() throws Exception {
        Users t = createUser("t");
        t.setRole(Users.RoleType.TRAINER);
        t.setFormation("F");
        userService.signUp(t);

        Users r = userService.loginFromId(t.getId());
        assertEquals(Users.RoleType.TRAINER, r.getRole());
        assertEquals("F", r.getFormation());
    }


    @Test
    public void testUpdateProfile_basic() throws Exception {
        Users u = createUser("u1");
        u.setRole(Users.RoleType.TRAINER);
        u.setFormation("A");
        userService.signUp(u);

        userService.updateProfile(
                u.getId(), "C", "G", "c@g.com", "B", null, new byte[0], null,
                180.0, 75.0, "M"
        );

        Users updated = userService.loginFromId(u.getId());
        assertEquals("C", updated.getFirstName());
        assertEquals("G", updated.getLastName());
        assertEquals("c@g.com", updated.getEmail());
        assertEquals("B", updated.getFormation());
        assertEquals(180.0, updated.getHeightCm(), 0.1);
        assertEquals(75.0, updated.getWeightKg(), 0.1);
        assertEquals("M", updated.getGender());
    }


    @Test(expected = IllegalArgumentException.class)
    public void testUpdateProfile_invalidImage() throws Exception {
        Users u = createUser("imgTest");
        userService.signUp(u);
        byte[] huge = new byte[20 * 1024 * 1024];
        userService.updateProfile(u.getId(), "A", "B", "a@b.com", "", "", huge, "image/png", null, null, null);
    }


    @Test
    public void testSignUpDuplicateUser() throws DuplicateInstanceException {
        Users u = createUser("dup");
        userService.signUp(u);
        try {
            userService.signUp(createUser("dup"));
            fail();
        } catch (DuplicateInstanceException e) {
            assertTrue(true);
        }
    }


    @Test(expected = IncorrectLoginException.class)
    public void testLoginIncorrectUsername() throws Exception {
        userService.login("noUser", "p");
    }


    @Test(expected = IncorrectLoginException.class)
    public void testLoginIncorrectPassword() throws Exception {
        Users u = createUser("up");
        userService.signUp(u);
        userService.login("up", "wrong");
    }


    @Test
    public void testChangePasswordSuccess() throws Exception {
        Users u = createUser("cp");
        userService.signUp(u);

        userService.changePassword(u.getId(), "password", "newP");
        Users logged = userService.login("cp", "newP");

        assertEquals(u.getId(), logged.getId());
    }


    @Test(expected = IncorrectPasswordException.class)
    public void testChangePasswordIncorrectOld() throws Exception {
        Users u = createUser("cp2");
        userService.signUp(u);
        userService.changePassword(u.getId(), "badOld", "n");
    }


    @Test
    public void testFollowFlow() throws Exception {
        Users a = createUser("a1");
        Users b = createUser("b1");
        userService.signUp(a);
        userService.signUp(b);

        assertTrue(userService.getFollowers(a.getId()).isEmpty());
        assertTrue(userService.getFollowing(a.getId()).isEmpty());

        userService.followTrainer(a.getId(), b.getId());

        assertEquals(1, userService.getFollowers(b.getId()).size());
        assertEquals(1, userService.getFollowing(a.getId()).size());
    }


    @Test(expected = AlreadyFollowedException.class)
    public void testFollowAlreadyFollowed() throws Exception {
        Users a = createUser("fa");
        Users b = createUser("fb");
        userService.signUp(a);
        userService.signUp(b);

        userService.followTrainer(a.getId(), b.getId());
        userService.followTrainer(a.getId(), b.getId());
    }


    @Test
    public void testUnfollowFlow() throws Exception {
        Users a = createUser("ua");
        Users b = createUser("ub");
        userService.signUp(a);
        userService.signUp(b);

        userService.followTrainer(a.getId(), b.getId());
        userService.unfollowTrainer(a.getId(), b.getId());

        assertTrue(userService.getFollowers(b.getId()).isEmpty());
        assertTrue(userService.getFollowing(a.getId()).isEmpty());
    }


    @Test(expected = AlreadyNotFollowedException.class)
    public void testUnfollowNotFollowing() throws Exception {
        Users a = createUser("xx");
        Users b = createUser("yy");
        userService.signUp(a);
        userService.signUp(b);

        userService.unfollowTrainer(a.getId(), b.getId());
    }


    @Test
    public void testIsFollowingTrainer() throws Exception {
        Users a = createUser("if1");
        Users b = createUser("if2");
        userService.signUp(a);
        userService.signUp(b);

        assertFalse(userService.isFollowingTrainer(a.getId(), b.getId()));
        userService.followTrainer(a.getId(), b.getId());
        assertTrue(userService.isFollowingTrainer(a.getId(), b.getId()));
    }


    @Test(expected = InstanceNotFoundException.class)
    public void testGetFollowersUserNotFound() throws Exception {
        userService.getFollowers(999999L);
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testGetFollowingUserNotFound() throws Exception {
        userService.getFollowing(888888L);
    }

    //Tests usuario premium
    @Test
    public void testActivatePremium_TrainerOk() throws Exception {
        Users trainer = createUser("trainer");
        trainer.setRole(Users.RoleType.TRAINER);
        trainer.setIsPremium(false);
        trainer.setFormation("Certified Personal Trainer");

        userService.signUp(trainer);

        Users updated = userService.activatePremium(trainer.getId());

        assertTrue(updated.getIsPremium());
    }

    @Test
    public void testActivatePremium_UserIgnored() throws Exception {
        Users user = createUser("user");
        user.setRole(Users.RoleType.USER);
        user.setIsPremium(false);

        userService.signUp(user);

        Users updated = userService.activatePremium(user.getId());

        assertFalse(updated.getIsPremium());
    }

    @Test
    public void testDeactivatePremium_TrainerOk() throws Exception {
        Users trainer = createUser("trainer");
        trainer.setRole(Users.RoleType.TRAINER);
        trainer.setIsPremium(true);
        trainer.setFormation("Certified Personal Trainer");

        userService.signUp(trainer);

        Users updated = userService.deactivatePremium(trainer.getId());

        assertFalse(updated.getIsPremium());
    }

    @Test
    public void testDeactivatePremium_UserIgnored() throws Exception {
        Users user = createUser("user");
        user.setRole(Users.RoleType.USER);
        user.setIsPremium(false);

        userService.signUp(user);

        Users updated = userService.deactivatePremium(user.getId());

        assertFalse(updated.getIsPremium());
    }

    // ========= BLOCK USER =========

    @Test
    public void testBlockUser_success() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);

        userService.blockUser(alice.getId(), bob.getId());

        assertTrue(userService.isBlocked(alice.getId(), bob.getId()));
    }

    @Test(expected = AlreadyBlockedException.class)
    public void testBlockUser_alreadyBlocked() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);

        userService.blockUser(alice.getId(), bob.getId());
        // Intento de bloquear de nuevo debe lanzar excepción
        userService.blockUser(alice.getId(), bob.getId());
    }

    @Test
    public void testUnblockUser_success() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);

        userService.blockUser(alice.getId(), bob.getId());
        assertTrue(userService.isBlocked(alice.getId(), bob.getId()));

        userService.unblockUser(alice.getId(), bob.getId());
        assertFalse(userService.isBlocked(alice.getId(), bob.getId()));
    }

    @Test(expected = NotBlockedException.class)
    public void testUnblockUser_notBlocked() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);

        // Intento de desbloquear sin estar bloqueado debe lanzar excepción
        userService.unblockUser(alice.getId(), bob.getId());
    }

    @Test
    public void testIsBlocked_trueAndFalse() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        Users charlie = createUser("charlie");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        charlie.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);
        userDao.save(charlie);

        userService.blockUser(alice.getId(), bob.getId());

        assertTrue(userService.isBlocked(alice.getId(), bob.getId()));
        assertFalse(userService.isBlocked(alice.getId(), charlie.getId()));
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testBlockUser_invalidUser() throws Exception {
        Users bob = createUser("bob");
        bob.setRole(Users.RoleType.USER);
        userDao.save(bob);

        // Usuario que no existe
        userService.blockUser(999L, bob.getId());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testBlockUser_invalidBlockedUser() throws Exception {
        Users alice = createUser("alice");
        alice.setRole(Users.RoleType.USER);
        userDao.save(alice);

        // Usuario bloqueado que no existe
        userService.blockUser(alice.getId(), 999L);
    }

    @Test
    @Transactional
    public void testGetBlockedUsers_success() throws Exception {
        Users alice = createUser("alice");
        Users bob = createUser("bob");
        alice.setRole(Users.RoleType.USER);
        bob.setRole(Users.RoleType.USER);
        userDao.save(alice);
        userDao.save(bob);

        // Alice bloquea a Bob
        alice.getBlockedUsers().add(bob);
        userDao.save(alice);

        List<Users> blocked = userService.getBlockedUsers(alice.getId());
        assertNotNull(blocked);
        assertEquals(1, blocked.size());
        assertEquals("bob", blocked.get(0).getUserName());
    }

    @Test(expected = InstanceNotFoundException.class)
    @Transactional
    public void testGetBlockedUsers_invalidUser() throws Exception {
        // Usuario que no existe
        userService.getBlockedUsers(999L);
    }

    @Test
    @Transactional
    public void testGetBlockedUsers_noBlockedUsers() throws Exception {
        Users alice = createUser("alice");
        alice.setRole(Users.RoleType.USER);
        userDao.save(alice);

        // Alice no ha bloqueado a nadie
        List<Users> blocked = userService.getBlockedUsers(alice.getId());
        assertNotNull(blocked);
        assertTrue(blocked.isEmpty());
    }

    // ========= ADMIN BAN USER =========

    @Test
    public void testAdminBanUser_success() throws Exception {
        // Create admin user
        Users admin = new Users("admin", "p", "A", "D", "admin@test.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        userDao.save(admin);

        // Create regular user
        Users bob = createUser("bob");
        bob.setRole(Users.RoleType.USER);
        userDao.save(bob);

        // Admin bans bob
        userService.adminBanUser(admin.getId(), bob.getId());

        // Verify bob is banned
        Users bannedBob = userDao.findById(bob.getId()).orElseThrow();
        assertTrue(bannedBob.getBannedByAdmin());
    }

    @Test
    public void testAdminUnbanUser_success() throws Exception {
        // Create admin user
        Users admin = new Users("admin", "p", "A", "D", "admin@test.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        userDao.save(admin);

        // Create banned user
        Users bob = createUser("bob");
        bob.setRole(Users.RoleType.USER);
        bob.setBannedByAdmin(true);
        userDao.save(bob);

        // Admin unbans bob
        userService.adminUnbanUser(admin.getId(), bob.getId());

        // Verify bob is unbanned
        Users unbannedBob = userDao.findById(bob.getId()).orElseThrow();
        assertFalse(unbannedBob.getBannedByAdmin());
    }

    @Test(expected = IncorrectLoginException.class)
    public void testLogin_bannedUser() throws Exception {
        // Create banned user
        Users banned = createUser("bannedUser");
        banned.setBannedByAdmin(true);
        userService.signUp(banned);

        // Attempt to login should fail
        userService.login("bannedUser", "password");
    }

    @Test
    public void testSearchUser_excludesBannedForNonAdmin() throws Exception {
        // Create requester (non-admin)
        Users requester = createUser("requester");
        userService.signUp(requester);

        // Create regular user
        Users alice = createUser("alice");
        userService.signUp(alice);

        // Create banned user
        Users bannedAlice = createUser("bannedAlice");
        bannedAlice.setRole(Users.RoleType.USER);
        bannedAlice.setBannedByAdmin(true);
        userDao.save(bannedAlice);

        // Non-admin search should exclude banned users
        List<Users> found = userService.searchUser(requester.getId(), "alice");
        List<String> names = found.stream().map(Users::getUserName).toList();

        assertTrue(names.contains("alice"));
        assertFalse(names.contains("bannedAlice"));
    }

    @Test
    public void testSearchUser_adminCanSeeBannedUsers() throws Exception {
        // Create admin requester
        Users admin = new Users("admin", "p", "A", "D", "admin@test.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        userDao.save(admin);

        // Create regular user
        Users alice = createUser("alice");
        userService.signUp(alice);

        // Create banned user
        Users bannedAlice = createUser("bannedAlice");
        bannedAlice.setRole(Users.RoleType.USER);
        bannedAlice.setBannedByAdmin(true);
        userDao.save(bannedAlice);

        // Admin search should include banned users
        List<Users> found = userService.searchUser(admin.getId(), "alice");
        List<String> names = found.stream().map(Users::getUserName).toList();

        assertTrue(names.contains("alice"));
        assertTrue(names.contains("bannedAlice"));
    }

    @Test
    public void testGetBannedUsers_success() throws Exception {
        // Create admin user
        Users admin = new Users("admin", "p", "A", "D", "admin@test.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        userDao.save(admin);

        // Create banned users
        Users banned1 = createUser("banned1");
        banned1.setRole(Users.RoleType.USER);
        banned1.setBannedByAdmin(true);
        userDao.save(banned1);

        Users banned2 = createUser("banned2");
        banned2.setRole(Users.RoleType.USER);
        banned2.setBannedByAdmin(true);
        userDao.save(banned2);

        // Create non-banned user
        Users notBanned = createUser("notBanned");
        notBanned.setRole(Users.RoleType.USER);
        userDao.save(notBanned);

        // Get banned users
        List<Users> bannedUsers = userService.getBannedUsers(admin.getId());

        assertEquals(2, bannedUsers.size());
        List<String> names = bannedUsers.stream().map(Users::getUserName).toList();
        assertTrue(names.contains("banned1"));
        assertTrue(names.contains("banned2"));
        assertFalse(names.contains("notBanned"));
    }


}

