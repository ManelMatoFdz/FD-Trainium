package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.entities.CategoryDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyFollowedException;
import es.udc.fi.dc.fd.dto.FeedItemDto;
import jakarta.transaction.Transactional;

/**
 * Tests TDD para el getFeed de UserService.
 * 
 * Escenarios a implementar:
 * 1. Usuario sin seguidos → feed vacío
 * 2. Usuario con seguidos sin actividad → feed vacío
 * 3. Usuario con seguidos con actividad → feed con items ordenados cronológicamente (más reciente primero)
 * 4. Paginación correcta (página 0, 1, etc.)
 * 5. El feed incluye tanto rutinas creadas como rutinas ejecutadas de los seguidos
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceFeedTest {

    @Autowired
    private UserService userService;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private RoutineExecutionService routineExecutionService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private CategoryDao categoryDao;

    // ========== Helpers ==========

    private Users createUser(String userName) {
        Users user = new Users(userName, "password", "First", "Last", userName + "@mail.com", null);
        user.setRole(Users.RoleType.USER);
        return user;
    }

    private Users createTrainer(String userName) {
        Users trainer = new Users(userName, "password", "First", "Last", userName + "@mail.com", "Formation");
        trainer.setRole(Users.RoleType.TRAINER);
        return trainer;
    }

    private Category getOrCreateCategory() {
        List<Category> cats = categoryDao.findAll();
        if (!cats.isEmpty()) {
            return cats.get(0);
        }
        Category cat = new Category();
        cat.setName("Test Category");
        return categoryDao.save(cat);
    }

    private Routine createRoutine(Users trainer, String name) {
        return createRoutine(trainer, name, true);
    }

    private Routine createRoutine(Users trainer, String name, boolean openPublic) {
        Category cat = getOrCreateCategory();
        Routine routine = new Routine(name, "BEGINNER", "Descripción", "Ninguno", trainer, cat, openPublic);
        return routineDao.save(routine);
    }

    /**
     * Crea una rutina privada (no aparece en feed) para usarla solo en ejecuciones.
     */
    private Routine createPrivateRoutine(Users trainer, String name) {
        return createRoutine(trainer, name, false);
    }

    private RoutineExecution createExecution(Users user, Routine routine, LocalDateTime performedAt) {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine);
        exec.setPerformedAt(performedAt);
        exec.setStartedAt(performedAt);
        exec.setFinishedAt(performedAt.plusMinutes(30));
        exec.setTotalDurationSec(1800);
        return routineExecutionDao.save(exec);
    }

    // ========== Tests ==========

    @Test
    public void testGetFeed_UserWithNoFollowing_ReturnsEmptyFeed() 
            throws DuplicateInstanceException, InstanceNotFoundException {
        // Given: un usuario que no sigue a nadie
        Users user = createUser("lonely");
        userService.signUp(user);

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(user.getId(), 0, 10);

        // Then: el feed está vacío
        assertNotNull(feed);
        assertTrue(feed.isEmpty());
        assertEquals(0, feed.getTotalElements());
    }

    @Test
    public void testGetFeed_FollowingUsersWithNoActivity_ReturnsEmptyFeed()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: un usuario que sigue a otro sin actividad
        Users follower = createUser("follower");
        Users followed = createUser("followed");
        userService.signUp(follower);
        userService.signUp(followed);
        userService.followTrainer(follower.getId(), followed.getId());

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el feed está vacío
        assertNotNull(feed);
        assertTrue(feed.isEmpty());
    }

    @Test
    public void testGetFeed_FollowingUserWithExecutions_ReturnsFeedItems()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a trainer que tiene ejecuciones de rutinas
        Users follower = createUser("follower2");
        Users trainer = createTrainer("trainer2");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        Routine routine = createPrivateRoutine(trainer, "Rutina Fuerza");
        LocalDateTime now = LocalDateTime.now();
        createExecution(trainer, routine, now.minusDays(1));
        createExecution(trainer, routine, now.minusDays(2));

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el feed contiene las ejecuciones
        assertNotNull(feed);
        assertFalse(feed.isEmpty());
        assertEquals(2, feed.getTotalElements());
    }

    @Test
    public void testGetFeed_OrderedByMostRecentFirst()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a trainer con varias ejecuciones en diferentes fechas
        Users follower = createUser("follower3");
        Users trainer = createTrainer("trainer3");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        Routine routine = createPrivateRoutine(trainer, "Rutina Test");
        LocalDateTime now = LocalDateTime.now();
        
        // Crear ejecuciones en orden desordenado
        RoutineExecution exec1 = createExecution(trainer, routine, now.minusDays(3)); // más antigua
        RoutineExecution exec2 = createExecution(trainer, routine, now.minusDays(1)); // más reciente
        RoutineExecution exec3 = createExecution(trainer, routine, now.minusDays(2)); // intermedia

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el feed está ordenado por fecha descendente (más reciente primero)
        assertNotNull(feed);
        assertEquals(3, feed.getTotalElements());
        List<FeedItemDto> items = feed.getContent();
        
        // La primera debe ser la más reciente (exec2)
        assertEquals(exec2.getId(), items.get(0).getId());
        // La segunda debe ser la intermedia (exec3)
        assertEquals(exec3.getId(), items.get(1).getId());
        // La tercera debe ser la más antigua (exec1)
        assertEquals(exec1.getId(), items.get(2).getId());
    }

    @Test
    public void testGetFeed_Pagination_Page0()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a trainer con más de 10 ejecuciones
        Users follower = createUser("follower4");
        Users trainer = createTrainer("trainer4");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        Routine routine = createPrivateRoutine(trainer, "Rutina Paginada");
        LocalDateTime now = LocalDateTime.now();
        
        // Crear 15 ejecuciones
        for (int i = 0; i < 15; i++) {
            createExecution(trainer, routine, now.minusDays(i));
        }

        // When: solicita la primera página (10 items)
        Page<FeedItemDto> page0 = userService.getFeed(follower.getId(), 0, 10);

        // Then: devuelve 10 items en la primera página
        assertNotNull(page0);
        assertEquals(10, page0.getContent().size());
        assertEquals(15, page0.getTotalElements());
        assertEquals(2, page0.getTotalPages());
        assertFalse(page0.isLast());
    }

    @Test
    public void testGetFeed_Pagination_Page1()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a trainer con más de 10 ejecuciones
        Users follower = createUser("follower5");
        Users trainer = createTrainer("trainer5");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        Routine routine = createPrivateRoutine(trainer, "Rutina Paginada2");
        LocalDateTime now = LocalDateTime.now();
        
        // Crear 15 ejecuciones
        for (int i = 0; i < 15; i++) {
            createExecution(trainer, routine, now.minusDays(i));
        }

        // When: solicita la segunda página
        Page<FeedItemDto> page1 = userService.getFeed(follower.getId(), 1, 10);

        // Then: devuelve los 5 items restantes
        assertNotNull(page1);
        assertEquals(5, page1.getContent().size());
        assertEquals(15, page1.getTotalElements());
        assertTrue(page1.isLast());
    }

    @Test
    public void testGetFeed_MultipleFollowedUsers()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a varios trainers
        Users follower = createUser("follower6");
        Users trainer1 = createTrainer("trainer6a");
        Users trainer2 = createTrainer("trainer6b");
        userService.signUp(follower);
        userService.signUp(trainer1);
        userService.signUp(trainer2);
        userService.followTrainer(follower.getId(), trainer1.getId());
        userService.followTrainer(follower.getId(), trainer2.getId());

        Routine routine1 = createPrivateRoutine(trainer1, "Rutina Trainer1");
        Routine routine2 = createPrivateRoutine(trainer2, "Rutina Trainer2");
        LocalDateTime now = LocalDateTime.now();
        
        createExecution(trainer1, routine1, now.minusDays(1));
        createExecution(trainer2, routine2, now.minusDays(2));
        createExecution(trainer1, routine1, now.minusDays(3));

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el feed contiene actividades de ambos trainers
        assertNotNull(feed);
        assertEquals(3, feed.getTotalElements());
        
        // Verificar que hay items de ambos trainers
        List<FeedItemDto> items = feed.getContent();
        boolean hasTrainer1 = items.stream().anyMatch(i -> i.getAuthorUserName().equals("trainer6a"));
        boolean hasTrainer2 = items.stream().anyMatch(i -> i.getAuthorUserName().equals("trainer6b"));
        assertTrue(hasTrainer1);
        assertTrue(hasTrainer2);
    }

    @Test
    public void testGetFeed_DoesNotIncludeOwnActivity()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario con actividad propia
        Users user = createUser("selfuser");
        Users trainer = createTrainer("othertrainer");
        userService.signUp(user);
        userService.signUp(trainer);
        userService.followTrainer(user.getId(), trainer.getId());

        Routine userRoutine = createPrivateRoutine(user, "Mi Rutina");
        Routine trainerRoutine = createPrivateRoutine(trainer, "Rutina Trainer");
        LocalDateTime now = LocalDateTime.now();
        
        createExecution(user, userRoutine, now.minusDays(1)); // actividad propia
        createExecution(trainer, trainerRoutine, now.minusDays(2)); // actividad de seguido

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(user.getId(), 0, 10);

        // Then: el feed NO incluye la actividad propia, solo la de seguidos
        assertNotNull(feed);
        assertEquals(1, feed.getTotalElements());
        assertEquals("othertrainer", feed.getContent().get(0).getAuthorUserName());
    }

    @Test
    public void testGetFeed_FeedItemDtoContainsExpectedFields()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: usuario sigue a trainer con actividad
        Users follower = createUser("follower7");
        Users trainer = createTrainer("trainer7");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        Routine routine = createPrivateRoutine(trainer, "Rutina Completa");
        LocalDateTime performedAt = LocalDateTime.now().minusDays(1);
        RoutineExecution exec = createExecution(trainer, routine, performedAt);

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el FeedItemDto contiene todos los campos esperados
        assertNotNull(feed);
        assertEquals(1, feed.getTotalElements());
        
        FeedItemDto item = feed.getContent().get(0);
        assertEquals(exec.getId(), item.getId());
        assertEquals(routine.getId(), item.getRoutineId());
        assertEquals(routine.getName(), item.getRoutineName());
        assertEquals(trainer.getId(), item.getAuthorId());
        assertEquals(trainer.getUserName(), item.getAuthorUserName());
        assertNotNull(item.getPerformedAt());
        // El tipo debe ser EXECUTION para ejecuciones de rutina
        assertEquals("EXECUTION", item.getType());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testGetFeed_UserNotFound_ThrowsException() throws InstanceNotFoundException {
        // When: solicita feed de usuario inexistente
        userService.getFeed(999999L, 0, 10);
        // Then: lanza InstanceNotFoundException
    }

    @Test
    public void testGetFeed_IncludesCreatedRoutines()
            throws DuplicateInstanceException, InstanceNotFoundException, AlreadyFollowedException {
        // Given: trainer crea una rutina pública (no la ejecuta)
        Users follower = createUser("follower8");
        Users trainer = createTrainer("trainer8");
        userService.signUp(follower);
        userService.signUp(trainer);
        userService.followTrainer(follower.getId(), trainer.getId());

        // Trainer crea una rutina pública
        Routine routine = createRoutine(trainer, "Nueva Rutina Publicada");

        // When: solicita el feed
        Page<FeedItemDto> feed = userService.getFeed(follower.getId(), 0, 10);

        // Then: el feed incluye la rutina creada con tipo ROUTINE
        assertNotNull(feed);
        assertFalse(feed.isEmpty());
        assertEquals(1, feed.getContent().size());
        FeedItemDto item = feed.getContent().get(0);
        assertEquals("ROUTINE", item.getType());
        assertEquals(routine.getName(), item.getRoutineName());
        assertEquals(trainer.getId(), item.getAuthorId());
    }
}
