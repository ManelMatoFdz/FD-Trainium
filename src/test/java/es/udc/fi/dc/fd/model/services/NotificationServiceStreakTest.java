package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@org.springframework.test.context.ActiveProfiles("test")
@Import(NotificationServiceStreakTest.TestClockConfig.class)
@Transactional
class NotificationServiceStreakTest {

    @TestConfiguration
    static
    class TestClockConfig {

        @Bean
        public Clock clock() {
            return Clock.fixed(
                    LocalDateTime.of(2025, 1, 1, 16, 1)
                            .atZone(ZoneId.systemDefault())
                            .toInstant(),
                    ZoneId.systemDefault()
            );
        }
    }

    @Autowired
    private Clock clock;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private CategoryDao categoryDao;

    private Users user;
    private Routine routine;

    @BeforeEach
    void setUp() {
        // Limpiar tablas
        notificationDao.deleteAll();
        routineExecutionDao.deleteAll();
        routineDao.deleteAll();
        categoryDao.deleteAll();
        userDao.deleteAll();

        // Crear usuario
        user = new Users("user1", "pass", "U1", "lastName", "u1@test.com", null);
        user.setRole(Users.RoleType.USER);
        userDao.save(user);

        // Crear categoría
        Category category = new Category();
        category.setName("Fuerza_" + System.nanoTime()); // único
        categoryDao.save(category);

        // Crear rutina
        routine = new Routine();
        routine.setName("Piernas");
        routine.setCategory(category);
        routine.setUser(user);
        routine.setCreatedAt(LocalDateTime.now(clock));
        routine.setDescription("Rutina de ejemplo");
        routine.setLevel("intermedio");
        routine.setMaterials("mancuernas");
        routine.setOpenPublic(false);
        routineDao.save(routine);
    }

    @Test
    void testNoNotificationIfNoExecutions() throws Exception {
        notificationService.checkDailyStreakWarning(user.getId());
        List<Notification> notes = notificationDao.findAll();
        assertTrue(notes.isEmpty(), "No debería generarse notificación si no hay ejecuciones");
    }

    @Test
    void testNoNotificationIfLastExecutionNotYesterday() throws Exception {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine);
        exec.setPerformedAt(LocalDateTime.now(clock).minusDays(2)); // hace 2 días
        routineExecutionDao.save(exec);

        notificationService.checkDailyStreakWarning(user.getId());
        List<Notification> list = notificationDao.findAll();
        assertTrue(list.isEmpty(), "No debería generarse notificación si la última ejecución no fue ayer");
    }

    @Test
    void testNoNotificationIfAlreadyPerformedToday() throws Exception {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine);
        exec.setPerformedAt(LocalDateTime.now(clock)); // hoy
        routineExecutionDao.save(exec);

        notificationService.checkDailyStreakWarning(user.getId());
        List<Notification> list = notificationDao.findAll();
        assertTrue(list.isEmpty(), "No debería generarse notificación si ya hay ejecución hoy");
    }

    @Test
    void testNotificationGeneratedForYesterdayExecution() throws Exception {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine);
        exec.setPerformedAt(LocalDateTime.now(clock).minusDays(1)); // ayer
        routineExecutionDao.save(exec);

        notificationService.checkDailyStreakWarning(user.getId());
        List<Notification> list = notificationDao.findAll();
        assertEquals(1, list.size(), "Debería generarse notificación por racha de 1 día");

        Notification n = list.get(0);
        assertNotNull(n.getTitle());
        assertNotNull(n.getMessage());
    }

    @Test
    void testNotificationIncludesCorrectStreak() throws Exception {
        // Crear ejecuciones consecutivas: hace 3 días, hace 2 días, ayer
        RoutineExecution exec1 = new RoutineExecution();
        exec1.setUser(user);
        exec1.setRoutine(routine);
        exec1.setPerformedAt(LocalDateTime.now(clock).minusDays(3));
        routineExecutionDao.save(exec1);

        RoutineExecution exec2 = new RoutineExecution();
        exec2.setUser(user);
        exec2.setRoutine(routine);
        exec2.setPerformedAt(LocalDateTime.now(clock).minusDays(2));
        routineExecutionDao.save(exec2);

        RoutineExecution exec3 = new RoutineExecution();
        exec3.setUser(user);
        exec3.setRoutine(routine);
        exec3.setPerformedAt(LocalDateTime.now(clock).minusDays(1)); // ayer
        routineExecutionDao.save(exec3);

        notificationService.checkDailyStreakWarning(user.getId());
        List<Notification> list = notificationDao.findAll();
        assertEquals(1, list.size(), "Debería generarse notificación por racha de 3 días");

        Notification n = list.get(0);
        assertNotNull(n.getTitle());
        assertNotNull(n.getMessage());
        assertTrue(n.getMessage().contains("3"), "El mensaje debería reflejar la racha de 3 días");
    }
}