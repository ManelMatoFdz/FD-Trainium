package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PermissionCheckerTest {

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private UserDao userDao;

    private Users user;

    @BeforeEach
    void setUp() {
        userDao.deleteAll();
        user = new Users("user", "password", "firstName", "lastName", "user@user.com", null);
        user.setRole(Users.RoleType.USER);
        userDao.save(user);
    }

    @Test
    void testCheckUserExists_Ok() {
        assertDoesNotThrow(() -> permissionChecker.checkUserExists(user.getId()));
    }

    @Test
    void testCheckUserExists_NotFound() {
        assertThrows(InstanceNotFoundException.class, () -> permissionChecker.checkUserExists(9999L));
    }

    @Test
    void testCheckUser_Ok_ReturnsUser() throws Exception {
        Users found = permissionChecker.checkUser(user.getId());
        assertNotNull(found);
        assertEquals(user.getId(), found.getId());
        assertEquals(user.getUserName(), found.getUserName());
    }

    @Test
    void testCheckUser_NotFound() {
        assertThrows(InstanceNotFoundException.class, () -> permissionChecker.checkUser(8888L));
    }
}
