package es.udc.fi.dc.fd.model.services;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserDao userDao;

    private Users user1;
    private Users user2;

    @BeforeEach
    void setUp() {
        notificationDao.deleteAll();
        userDao.deleteAll();

        user1 = new Users("user1", "pass", "U1", "lastName", "u1@test.com", null);
        user1.setRole(Users.RoleType.USER);
        userDao.save(user1);

        user2 = new Users("user2", "pass", "U2", "lastName", "u2@test.com", null);
        user2.setRole(Users.RoleType.USER);
        userDao.save(user2);
    }

    @Test
    void testGetUserNotifications_OrderByCreatedDesc() {
        Notification n1 = new Notification(user1, "T1", "M1");
        notificationDao.save(n1);
        notificationDao.flush();

        Notification n2 = new Notification(user1, "T2", "M2");
        notificationDao.save(n2);
        notificationDao.flush();
    
        List<Notification> list = notificationService.getUserNotifications(user1.getId());
        assertEquals(2, list.size());

        assertTrue(list.get(0).getCreatedAt().isAfter(list.get(1).getCreatedAt()) 
                || list.get(0).getCreatedAt().isEqual(list.get(1).getCreatedAt()));

        assertTrue(list.stream().anyMatch(n -> "T1".equals(n.getTitle())));
        assertTrue(list.stream().anyMatch(n -> "T2".equals(n.getTitle())));
    }

    @Test
    void testCountUnreadNotifications() {
        Notification n1 = new Notification(user1, "A", "X");
        Notification n2 = new Notification(user1, "B", "Y");
        n2.setRead(true);
        notificationDao.saveAll(List.of(n1, n2));

        long unread = notificationService.countUnreadNotifications(user1.getId());
        assertEquals(1L, unread);
    }

    @Test
    void testMarkAllAsRead() {
        Notification n1 = new Notification(user1, "A", "X");
        Notification n2 = new Notification(user1, "B", "Y");
        Notification n3 = new Notification(user1, "C", "Z");
        n3.setRead(true);
        notificationDao.saveAll(List.of(n1, n2, n3));

        long before = notificationService.countUnreadNotifications(user1.getId());
        assertEquals(2L, before);

        int updated = notificationService.markAllAsRead(user1.getId());
        assertEquals(2, updated);

        long after = notificationService.countUnreadNotifications(user1.getId());
        assertEquals(0L, after);

        List<Notification> list = notificationService.getUserNotifications(user1.getId());
        assertTrue(list.stream().allMatch(Notification::isRead));
    }

    @Test
    void testDeleteAllByUser() {
        Notification a = new Notification(user1, "A", "X");
        Notification b = new Notification(user1, "B", "Y");
        Notification c = new Notification(user2, "C", "Z");
        notificationDao.saveAll(List.of(a, b, c));

        int deleted = notificationService.deleteAllByUser(user1.getId());
        assertEquals(2, deleted);

        assertEquals(1, notificationService.getUserNotifications(user2.getId()).size());
        assertEquals(0, notificationService.getUserNotifications(user1.getId()).size());
    }

    // ------------------------------
    // Tests para notifyBadgeEarned
    // ------------------------------

    @Test
    void testNotifyBadgeEarned_SavesNotification() {
        String badgeCode = "SUPER_BADGE";

        notificationService.notifyBadgeEarned(user1, badgeCode);

        List<Notification> list = notificationDao.findAll();
        assertEquals(1, list.size(), "Debe haberse creado una notificación");

        Notification n = list.get(0);
        assertEquals(user1, n.getUser());
        assertNotNull(n.getTitle());
        assertNotNull(n.getMessage());
        assertTrue(n.getMessage().contains("SUPER BADGE"), "El mensaje debe incluir el badgeCode");
    }

    @Test
    void testNotifyBadgeEarned_UnderscoreReplaced() {
        String badgeCode = "MEGA_ACHIEVEMENT";

        notificationService.notifyBadgeEarned(user1, badgeCode);

        List<Notification> list = notificationDao.findAll();
        assertEquals(1, list.size());

        Notification n = list.get(0);
        assertTrue(n.getMessage().contains("MEGA ACHIEVEMENT"), "Los '_' deben reemplazarse por espacios");
    }
}
