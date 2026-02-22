package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyNotLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RoutineExecutionServiceTest {

    @Autowired
    private RoutineExecutionService routineExecutionService;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao usersDao;

    @Autowired
    private CategoryDao categoryDao;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private ExerciseExecutionSetDao exerciseExecutionSetDao;

    private Users user;
    private Users otherUser;
    private Users admin;
    private Routine routine;
    private Exercise exercise;
    private Category category;

    @BeforeEach
    void setUp() {
        notificationDao.deleteAll();
        exerciseExecutionDao.deleteAll();
        routineExecutionDao.deleteAll();
        routineDao.deleteAll();
        exerciseDao.deleteAll();
        categoryDao.deleteAll();
        usersDao.deleteAll();

        user = new Users("user1", "pass", "Pepe", "Gomez", "user@test.com", null);
        user.setRole(Users.RoleType.USER);
        usersDao.save(user);

        otherUser = new Users("other", "pass", "Ana", "Lopez", "other@test.com", null);
        otherUser.setRole(Users.RoleType.USER);
        usersDao.save(otherUser);

        admin = new Users("admin", "pass", "Admin", "Root", "admin@test.com", null);
        admin.setRole(Users.RoleType.ADMIN);
        usersDao.save(admin);

        category = new Category("Test Category");
        categoryDao.save(category);

        routine = new Routine();
        routine.setName("Rutina prueba");
        routine.setLevel("Basico");
        routine.setUser(user);
        routine.setCategory(category);
        routine.setMaterials("Mancuernas");
        routineDao.save(routine);

        exercise = new Exercise("Curl", "Mancuernas", null, null, null, "desc");
        exerciseDao.save(exercise);
    }

    @Test
    void testRegisterRoutineExecution_Ok() throws Exception {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setExercise(exercise);
        exExec.setPerformedReps(12);
        exExec.setPerformedSets(3);
        exExec.setWeightUsed(10.5);
        exExec.setNotes("Todo correcto");

        RoutineExecution execution = routineExecutionService.registerRoutineExecution(
                user.getId(), routine.getId(), List.of(exExec));

        assertNotNull(execution.getId());
        assertEquals(user.getId(), execution.getUser().getId());
        assertEquals(routine.getId(), execution.getRoutine().getId());

        List<ExerciseExecution> savedExercises = exerciseExecutionDao.findAll();
        assertEquals(1, savedExercises.size());
        assertEquals(execution.getId(), savedExercises.get(0).getRoutineExecution().getId());
    }

    @Test
    void testRegisterRoutineExecution_RoutineNotFound() {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setExercise(exercise);
        exExec.setPerformedReps(10);
        exExec.setPerformedSets(2);

        assertThrows(InstanceNotFoundException.class, () ->
                routineExecutionService.registerRoutineExecution(user.getId(), 999L, List.of(exExec)));
    }

    @Test
    void testFindRoutineExecutionsByUser_Ok() throws Exception {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setExercise(exercise);
        exExec.setPerformedReps(10);
        exExec.setPerformedSets(2);

        routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of(exExec));

        List<RoutineExecution> executions = routineExecutionService.findRoutineExecutionsByUser(user.getId());
        assertEquals(1, executions.size());
        assertEquals(routine.getName(), executions.get(0).getRoutine().getName());
    }

    @Test
    void testGetRoutineExecutionDetails_Ok() throws Exception {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setExercise(exercise);
        exExec.setPerformedReps(10);
        exExec.setPerformedSets(3);

        RoutineExecution created = routineExecutionService.registerRoutineExecution(
                user.getId(), routine.getId(), List.of(exExec));

        RoutineExecution fetched = routineExecutionService.getRoutineExecutionDetails(user.getId(), created.getId());

        assertEquals(created.getId(), fetched.getId());
        assertEquals(user.getId(), fetched.getUser().getId());
    }

    @Test
    void testGetRoutineExecutionDetails_NotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineExecutionService.getRoutineExecutionDetails(user.getId(), 999L));
    }

    @Test
    void testGetRoutineExecutionDetails_PermissionDenied() throws Exception {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setExercise(exercise);
        exExec.setPerformedReps(8);
        exExec.setPerformedSets(4);

        RoutineExecution created = routineExecutionService.registerRoutineExecution(
                user.getId(), routine.getId(), List.of(exExec));

        assertThrows(PermissionException.class, () ->
                routineExecutionService.getRoutineExecutionDetails(otherUser.getId(), created.getId()));
    }

    @Test
    void testLikeAndUnlikeFlow() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(
                user.getId(), routine.getId(), List.of());
        assertNotNull(execution.getId());

        Users liker = new Users("liker", "pass", "Liker", "L", "liker@test.com", null);
        liker.setRole(Users.RoleType.USER);
        usersDao.save(liker);

        RoutineExecution liked = routineExecutionService.likeRoutineExecution(liker.getId(), execution.getId());
        assertEquals(1, liked.getLikedByUsers().size());

        assertThrows(AlreadyLikedException.class, () ->
                routineExecutionService.likeRoutineExecution(liker.getId(), execution.getId()));

        long unread = notificationDao.countByUser_IdAndReadFalse(user.getId());
        assertEquals(2, unread);

        RoutineExecution afterUnlike = routineExecutionService.unlikeRoutineExecution(liker.getId(), execution.getId());
        assertEquals(0, afterUnlike.getLikedByUsers().size());

        assertThrows(AlreadyNotLikedException.class, () ->
                routineExecutionService.unlikeRoutineExecution(liker.getId(), execution.getId()));
    }

    @Test
    void testGetRoutineExecutionLikers_OwnerSeesUsernames() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());

        Users u1 = new Users("alice", "pass", "A", "One", "alice@test.com", null); u1.setRole(Users.RoleType.USER); usersDao.save(u1);
        Users u2 = new Users("bob", "pass", "B", "Two", "bob@test.com", null); u2.setRole(Users.RoleType.USER); usersDao.save(u2);
        routineExecutionService.likeRoutineExecution(u1.getId(), execution.getId());
        routineExecutionService.likeRoutineExecution(u2.getId(), execution.getId());

        List<String> likers = routineExecutionService.getRoutineExecutionLikers(user.getId(), execution.getId());
        assertEquals(2, likers.size());
        assertTrue(likers.contains("alice"));
        assertTrue(likers.contains("bob"));
    }

    @Test
    void testGetRoutineExecutionLikers_AdminSeesUsernames() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());

        Users liker = new Users("charlie", "pass", "C", "Three", "charlie@test.com", null);
        liker.setRole(Users.RoleType.USER);
        usersDao.save(liker);
        routineExecutionService.likeRoutineExecution(liker.getId(), execution.getId());

        List<String> likers = routineExecutionService.getRoutineExecutionLikers(admin.getId(), execution.getId());
        assertEquals(1, likers.size());
        assertEquals("charlie", likers.get(0));
    }

    @Test
    void testGetRoutineExecutionLikers_PermissionDenied() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());

        Users stranger = new Users("stranger", "pass", "S", "Tranger", "stranger@test.com", null);
        stranger.setRole(Users.RoleType.USER);
        usersDao.save(stranger);

        assertThrows(PermissionException.class, () ->
                routineExecutionService.getRoutineExecutionLikers(stranger.getId(), execution.getId()));
    }

    @Test
    void testGetRoutineExecutionLikers_EmptyList() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());
        List<String> likers = routineExecutionService.getRoutineExecutionLikers(user.getId(), execution.getId());
        assertNotNull(likers);
        assertTrue(likers.isEmpty());
    }

    // ===== Comments (tests will fail until implemented) =====

    @Test
    void addComment_ok() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());

        RoutineExecutionComment comment = routineExecutionService.addComment(otherUser.getId(), execution.getId(), "Buen trabajo");

        assertNotNull(comment.getId());
        assertEquals("Buen trabajo", comment.getText());
        assertEquals(otherUser.getId(), comment.getUser().getId());
        assertEquals(execution.getId(), comment.getRoutineExecution().getId());
    }

    @Test
    void addComment_executionNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineExecutionService.addComment(user.getId(), -1L, "Hola"));
    }

    @Test
    void findComments_returnsChronological() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());

        routineExecutionService.addComment(user.getId(), execution.getId(), "Primero");
        routineExecutionService.addComment(otherUser.getId(), execution.getId(), "Segundo");

        List<RoutineExecutionComment> comments = routineExecutionService.findComments(execution.getId());

        assertEquals(2, comments.size());
        assertEquals("Segundo", comments.get(0).getText()); // más reciente primero
        assertEquals("Primero", comments.get(1).getText());
    }

    @Test
    void deleteComment_authorCanDelete() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());
        RoutineExecutionComment comment = routineExecutionService.addComment(user.getId(), execution.getId(), "Borrar esto");

        routineExecutionService.deleteComment(user.getId(), comment.getId());

        List<RoutineExecutionComment> remaining = routineExecutionService.findComments(execution.getId());
        assertTrue(remaining.isEmpty());
    }

    @Test
    void deleteComment_nonOwnerForbidden() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());
        RoutineExecutionComment comment = routineExecutionService.addComment(user.getId(), execution.getId(), "Solo mío");

        assertThrows(PermissionException.class, () ->
                routineExecutionService.deleteComment(otherUser.getId(), comment.getId()));
    }

    @Test
    void updateComment_authorCanEdit() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());
        RoutineExecutionComment comment = routineExecutionService.addComment(user.getId(), execution.getId(), "Texto inicial");

        RoutineExecutionComment updated = routineExecutionService.updateComment(user.getId(), comment.getId(), "Texto editado");

        assertEquals("Texto editado", updated.getText());
    }

    @Test
    void updateComment_nonOwnerForbidden() throws Exception {
        RoutineExecution execution = routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of());
        RoutineExecutionComment comment = routineExecutionService.addComment(user.getId(), execution.getId(), "Texto inicial");

        assertThrows(PermissionException.class, () ->
                routineExecutionService.updateComment(otherUser.getId(), comment.getId(), "Texto editado"));
    }

    @Test
    void testRegisterRoutineExecution_NotifiesUsersWhenRankingDrops() throws Exception {
        // Creamos dos usuarios que seguirán al actual
        Users follower1 = new Users("f1", "pass", "Follower", "One", "f1@test.com", null);
        follower1.setRole(Users.RoleType.USER);
        usersDao.save(follower1);

        Users follower2 = new Users("f2", "pass", "Follower", "Two", "f2@test.com", null);
        follower2.setRole(Users.RoleType.USER);
        usersDao.save(follower2);

        // El usuario sigue a los demás
        user.getFollowing().add(follower1);
        user.getFollowing().add(follower2);
        usersDao.save(user);

        // Creamos ejecuciones previas para que follower1 y follower2 tengan ranking (con sets y peso)
        ExerciseExecution exExec1 = new ExerciseExecution();
        exExec1.setExercise(exercise);
        exExec1.setPerformedReps(5);
        exExec1.setPerformedSets(2);
        ExerciseExecutionSet set1 = new ExerciseExecutionSet();
        set1.setExerciseExecution(exExec1);
        set1.setSetIndex(1);
        set1.setReps(5);
        set1.setWeight(10.0);
        exExec1.setSetsDetails(List.of(set1));
        routineExecutionService.registerRoutineExecution(follower1.getId(), routine.getId(), List.of(exExec1));

        ExerciseExecution exExec2 = new ExerciseExecution();
        exExec2.setExercise(exercise);
        exExec2.setPerformedReps(5);
        exExec2.setPerformedSets(2);
        ExerciseExecutionSet set2 = new ExerciseExecutionSet();
        set2.setExerciseExecution(exExec2);
        set2.setSetIndex(1);
        set2.setReps(5);
        set2.setWeight(10.0);
        exExec2.setSetsDetails(List.of(set2));
        routineExecutionService.registerRoutineExecution(follower2.getId(), routine.getId(), List.of(exExec2));

        // Ahora el usuario realiza la rutina con más peso, adelantando a follower1 y follower2
        ExerciseExecution exExecUser = new ExerciseExecution();
        exExecUser.setExercise(exercise);
        exExecUser.setPerformedReps(10);
        exExecUser.setPerformedSets(3);
        ExerciseExecutionSet setUser = new ExerciseExecutionSet();
        setUser.setExerciseExecution(exExecUser);
        setUser.setSetIndex(1);
        setUser.setReps(10);
        setUser.setWeight(100.0); // Mucho más peso para adelantar
        exExecUser.setSetsDetails(List.of(setUser));
        routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of(exExecUser));

        // Comprobamos notificaciones
        List<Notification> follower1Notifications = notificationDao.findByUser_IdOrderByCreatedAtDesc(follower1.getId());
        List<Notification> follower2Notifications = notificationDao.findByUser_IdOrderByCreatedAtDesc(follower2.getId());

        assertFalse(follower1Notifications.isEmpty(), "Follower1 debería recibir notificación");
        assertFalse(follower2Notifications.isEmpty(), "Follower2 debería recibir notificación");

        // Verificamos que el mensaje contiene información de la rutina o del ejercicio (ambos generan notificaciones)
        boolean f1HasRoutine = follower1Notifications.stream().anyMatch(n -> n.getMessage().contains(routine.getName()));
        boolean f1HasExercise = follower1Notifications.stream().anyMatch(n -> n.getMessage().contains(exercise.getName()));
        assertTrue(f1HasRoutine || f1HasExercise, "Follower1 debe tener notificación de rutina o ejercicio");

        boolean f2HasRoutine = follower2Notifications.stream().anyMatch(n -> n.getMessage().contains(routine.getName()));
        boolean f2HasExercise = follower2Notifications.stream().anyMatch(n -> n.getMessage().contains(exercise.getName()));
        assertTrue(f2HasRoutine || f2HasExercise, "Follower2 debe tener notificación de rutina o ejercicio");
    }

    @Test
    void testRegisterRoutineExecution_NotifiesUsersOnExerciseRankingDrop() throws Exception {
        Exercise ex2 = new Exercise("Press", "Mancuernas", null, null, null, "desc");
        exerciseDao.save(ex2);

        // Dos usuarios previos para ranking
        Users u1 = new Users("u1", "pass", "U1", "X", "u1@test.com", null); u1.setRole(Users.RoleType.USER); usersDao.save(u1);
        Users u2 = new Users("u2", "pass", "U2", "Y", "u2@test.com", null); u2.setRole(Users.RoleType.USER); usersDao.save(u2);

        // El usuario sigue a u1 y u2 para que estén en su ranking
        user.getFollowing().add(u1);
        user.getFollowing().add(u2);
        usersDao.save(user);

        // Creamos ejecuciones previas con sets y peso incluidos
        ExerciseExecution exExec1 = new ExerciseExecution(); exExec1.setExercise(ex2); exExec1.setPerformedReps(5); exExec1.setPerformedSets(2);
        ExerciseExecutionSet set1 = new ExerciseExecutionSet();
        set1.setExerciseExecution(exExec1);
        set1.setSetIndex(1);
        set1.setReps(5);
        set1.setWeight(10.0);
        exExec1.setSetsDetails(List.of(set1));
        routineExecutionService.registerRoutineExecution(u1.getId(), routine.getId(), List.of(exExec1));

        ExerciseExecution exExec2 = new ExerciseExecution(); exExec2.setExercise(ex2); exExec2.setPerformedReps(5); exExec2.setPerformedSets(2);
        ExerciseExecutionSet set2 = new ExerciseExecutionSet();
        set2.setExerciseExecution(exExec2);
        set2.setSetIndex(1);
        set2.setReps(5);
        set2.setWeight(10.0);
        exExec2.setSetsDetails(List.of(set2));
        routineExecutionService.registerRoutineExecution(u2.getId(), routine.getId(), List.of(exExec2));

        // El usuario realiza ejercicio con mucho más peso y adelanta a los anteriores
        ExerciseExecution exExecUser = new ExerciseExecution(); exExecUser.setExercise(ex2); exExecUser.setPerformedReps(10); exExecUser.setPerformedSets(3);
        ExerciseExecutionSet setUser = new ExerciseExecutionSet();
        setUser.setExerciseExecution(exExecUser);
        setUser.setSetIndex(1);
        setUser.setReps(10);
        setUser.setWeight(100.0);
        exExecUser.setSetsDetails(List.of(setUser));
        routineExecutionService.registerRoutineExecution(user.getId(), routine.getId(), List.of(exExecUser));

        // Comprobamos notificaciones
        List<Notification> notifsU1 = notificationDao.findByUser_IdOrderByCreatedAtDesc(u1.getId());
        List<Notification> notifsU2 = notificationDao.findByUser_IdOrderByCreatedAtDesc(u2.getId());

        assertFalse(notifsU1.isEmpty());
        assertFalse(notifsU2.isEmpty());

        assertTrue(notifsU1.stream().anyMatch(n -> n.getMessage() != null && n.getMessage().contains(ex2.getName())));
        assertTrue(notifsU2.stream().anyMatch(n -> n.getMessage() != null && n.getMessage().contains(ex2.getName())));
    }


}
