package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.Arrays;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.entities.CategoryDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.ExerciseExecutionSet;
import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadySavedException;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@SpringBootTest
@Transactional
class RoutineServiceTest {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private CategoryDao categoryDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private UserDao usersDao;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @PersistenceContext
    private EntityManager entityManager;

    private Users trainer;
    private Users user;
    private Category category;
    private Exercise approvedExercise;
    private Exercise pendingExercise;

    @BeforeEach
    void setUp() {
        routineExerciseDao.deleteAll();
        routineDao.deleteAll();
        exerciseDao.deleteAll();
        categoryDao.deleteAll();
        usersDao.deleteAll();
        entityManager.flush();

        trainer = new Users("trainer", "pass", "Trainer", "Pro", "trainer@test.com", "seed-trainer");
        trainer.setRole(Users.RoleType.TRAINER);
        trainer.setIsPremium(true);
        usersDao.save(trainer);

        user = new Users("user", "pass", "Pepe", "Gómez", "user@test.com", "seed-user");
        user.setRole(Users.RoleType.USER);
        usersDao.save(user);

        category = new Category();
        category.setName("Fuerza_" + System.nanoTime());
        categoryDao.save(category);

        approvedExercise = new Exercise("Curl", "Mancuernas", ExerciseStatus.APPROVED, null, "img.png", "desc");
        exerciseDao.save(approvedExercise);

        pendingExercise = new Exercise("Press", "Barra", ExerciseStatus.PENDING, null, "img2.png", "desc");
        exerciseDao.save(pendingExercise);
    }

    @Test
    void testCreateRoutine_WithApprovedExercise_Ok() throws Exception {
        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);
        re.setMaterial("Mancuernas");

        Routine routine = routineService.createRoutine(
            "Rutina de fuerza", "Media", "Test desc", "Mancuernas",
            trainer.getId(), category.getId(), List.of(re), true);

        assertNotNull(routine.getId());
        assertEquals("Rutina de fuerza", routine.getName());
        assertEquals(trainer.getId(), routine.getUser().getId());

        List<RoutineExercise> saved = routineExerciseDao.findByRoutine_Id(routine.getId());
        assertEquals(1, saved.size());
        assertEquals(approvedExercise.getId(), saved.get(0).getExercise().getId());
    }

    @Test
    void testCreateRoutine_WithPendingExercise_Fails() {
        RoutineExercise re = new RoutineExercise();
        re.setExercise(pendingExercise);
        re.setRepetitions(8);
        re.setSets(3);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.createRoutine(
                    "Rutina error", "Alta", "Desc", "Barra",
                    trainer.getId(), category.getId(), List.of(re), true));
    }

    @Test
    void testCreateRoutine_UserSinPermisos() {
        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        assertThrows(PermissionException.class, () ->
                routineService.createRoutine(
                        "Rutina usuario", "Media", "Desc", "Mat",
                        user.getId(), category.getId(), List.of(re), true));
    }

    @Test
    void testCreateRoutine_CategoriaInexistente() {
        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.createRoutine(
                        "Rutina cat error", "Media", "Desc", "Mat",
                        trainer.getId(), -1L, List.of(re), true));
    }

    @Test
    void testCreateRoutine_SinEjercicios_Ok() throws Exception {
        Routine routine = routineService.createRoutine(
                "Rutina sin ejercicios", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), List.of(), true);

        assertNotNull(routine.getId());
        assertTrue(routine.getExercises().isEmpty());
    }

    @Test
    void testCreateRoutine_EjercicioDuplicadoEnRutina() {
        RoutineExercise re1 = new RoutineExercise();
        re1.setExercise(approvedExercise);
        re1.setRepetitions(10);
        re1.setSets(3);

        RoutineExercise re2 = new RoutineExercise();
        re2.setExercise(approvedExercise);
        re2.setRepetitions(12);
        re2.setSets(4);

        assertThrows(DuplicateExerciseInRoutineException.class, () ->
                routineService.createRoutine(
                        "Rutina duplicada", "Media", "Desc", "Mat",
                        trainer.getId(), category.getId(), List.of(re1, re2), true));
    }

    @Test
    void testCreateRoutine_EjercicioInexistente() {
        Exercise ghost = new Exercise("Ghost", "Mat", ExerciseStatus.APPROVED, null, "img.png", "desc");
        ghost.setId(999999L);

        RoutineExercise re = new RoutineExercise();
        re.setExercise(ghost);
        re.setRepetitions(10);
        re.setSets(3);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.createRoutine(
                        "Rutina ghost", "Media", "Desc", "Mat",
                        trainer.getId(), category.getId(), List.of(re), true));
    }

    @Test
    void testFindRoutineById_EntrenadorPropietario() throws Exception {
        Routine routine = new Routine("R", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Routine found = routineService.findRoutineById(trainer.getId(), routine.getId());

        assertEquals(routine.getId(), found.getId());
    }

    @Test
    void testFindRoutineById_UsuarioNoPuedeVerPrivada() throws Exception {
        Routine routine = new Routine("Privada", "Media", "Desc", "Mat", trainer, category, false);
        routineDao.save(routine);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findRoutineById(user.getId(), routine.getId()));
    }

    @Test
    void testFindRoutineExercisesByRoutineId_Ok() throws Exception {
        Routine routine = new Routine("Con ejercicios", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        RoutineExercise re = new RoutineExercise();
        re.setRoutine(routine);
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);
        routineExerciseDao.save(re);

        List<RoutineExercise> res = routineService.findRoutineExercisesByRoutineId(routine.getId());

        assertEquals(1, res.size());
        assertEquals(approvedExercise.getId(), res.get(0).getExercise().getId());
    }

    @Test
    void testFindRoutineExercisesByRoutineId_RutinaInexistente() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findRoutineExercisesByRoutineId(-1L));
    }

    @Test
    void testFindAllRoutines_Exito() throws Exception {
        Users trainerLocal = createUser("entrenador", Users.RoleType.TRAINER);
        userService.signUp(trainerLocal);

        Category categoryLocal = createCategory("categoria");
        categoryDao.save(categoryLocal);

        Routine r1 = createAndPersistRoutine(trainerLocal, categoryLocal);
        Routine r2 = createAndPersistRoutine(trainerLocal, categoryLocal);

        Users userLocal = createUser("usuario", Users.RoleType.USER);
        userService.signUp(userLocal);

        Block<Routine> all = routineService.findAllRoutines(userLocal.getId(), 0, 10);

        assertEquals(2, all.getItems().size());
        assertTrue(all.getItems().stream().anyMatch(r -> r.getId().equals(r1.getId())));
        assertTrue(all.getItems().stream().anyMatch(r -> r.getId().equals(r2.getId())));
    }

    @Test
    void testFindAllRoutines_AdminVeTodas() throws Exception {
        Users admin = createUser("admin", Users.RoleType.ADMIN);
        usersDao.save(admin);

        Routine r1 = new Routine("R1", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(r1);
        Routine r2 = new Routine("R2", "Media", "Desc", "Mat", trainer, category, false);
        routineDao.save(r2);

        Block<Routine> all = routineService.findAllRoutines(admin.getId(), 0, 10);

        assertEquals(2, all.getItems().size());
    }

    @Test
    void testFindAllRoutines_UsuarioInexistente() {
        assertThrows(InstanceNotFoundException.class, () -> routineService.findAllRoutines(-1L, 0, 10));
    }

    @Test
    void testSearchRoutines_SinFiltrosDevuelvePublicas() {
        Routine publicRoutine = new Routine("Publica", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(publicRoutine);
        Routine privateRoutine = new Routine("Privada", "Media", "Desc", "Mat", trainer, category, false);
        routineDao.save(privateRoutine);

        Block<Routine> block = routineService.searchRoutines(null, null, null, null, 0, 10);

        assertEquals(1, block.getItems().size());
        assertEquals(publicRoutine.getId(), block.getItems().get(0).getId());
    }

    @Test
    void testSearchRoutines_FiltrosCategoriaNivelYKeywords() {
        Category cat1 = createAndSaveCategory("cat1");
        Category cat2 = createAndSaveCategory("cat2");

        Routine r1 = new Routine("Fuerza Brazos", "Media", "Desc", "Mat", trainer, cat1, true);
        routineDao.save(r1);
        Routine r2 = new Routine("Fuerza Piernas", "Alta", "Desc", "Mat", trainer, cat1, true);
        routineDao.save(r2);
        Routine r3 = new Routine("Otra", "Media", "Desc", "Mat", trainer, cat2, true);
        routineDao.save(r3);

        Block<Routine> block = routineService.searchRoutines(
                cat1.getId(), "Fuerza Brazos", "Media", null, 0, 10);

        assertEquals(1, block.getItems().size());
        assertEquals(r1.getId(), block.getItems().get(0).getId());
    }

    @Test
    void testSearchRoutines_FiltroMusculos() throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException {
        Exercise exBiceps = new Exercise("Curl Biceps", "Mancuernas", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc");
        exerciseDao.save(exBiceps);

        RoutineExercise re = new RoutineExercise();
        re.setExercise(exBiceps);
        re.setRepetitions(10);
        re.setSets(3);

        Routine routine = routineService.createRoutine(
                "Rutina Biceps", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), List.of(re), true);

        Block<Routine> block = routineService.searchRoutines(
                null, null, null, Set.of(ExerciseMuscle.BICEPS), 0, 10);

        assertEquals(1, block.getItems().size());
        assertEquals(routine.getId(), block.getItems().get(0).getId());
    }

    @Test
    void testUpdateRoutine_Ok() throws Exception {
        Routine routine = new Routine("RBase", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Routine updated = routineService.updateRoutine(
                routine.getId(), "RUpdated", "Alta", "New desc", "Cuerda",
                trainer.getId(), category.getId(), List.of(), false);

        assertEquals("RUpdated", updated.getName());
        assertEquals("Alta", updated.getLevel());
        assertFalse(updated.isOpenPublic());
    }

    @Test
    void testUpdateRoutine_ConEjercicios() throws Exception {
        Routine routine = new Routine("RBase", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        Routine updated = routineService.updateRoutine(
                routine.getId(), "RUpdated", "Alta", "New desc", "Cuerda",
                trainer.getId(), category.getId(), List.of(re), true);

        List<RoutineExercise> res = routineExerciseDao.findByRoutine_Id(updated.getId());
        assertEquals(1, res.size());
        assertEquals(approvedExercise.getId(), res.get(0).getExercise().getId());
    }

    @Test
    void testUpdateRoutine_CategoriaInexistente() {
        Routine routine = new Routine("RBase", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.updateRoutine(
                        routine.getId(), "RUpdated", "Alta", "New desc", "Cuerda",
                        trainer.getId(), -1L, List.of(), true));
    }

    @Test
    void testUpdateRoutine_RutinaInexistente() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.updateRoutine(
                        -1L, "RUpdated", "Alta", "New desc", "Cuerda",
                        trainer.getId(), category.getId(), List.of(), true));
    }

    @Test
    void testUpdateRoutine_PermissionDenied() {
        Routine routine = new Routine("RPrivada", "Media", "Desc", "Mat", trainer, category, false);
        routineDao.save(routine);

        assertThrows(PermissionException.class, () ->
                routineService.updateRoutine(
                        routine.getId(), "New", "Alta", "Desc", "Mat",
                        user.getId(), category.getId(), List.of(), true));
    }

    @Test
    void testDeleteRoutine_Ok() throws Exception {
        Routine routine = new Routine("Del", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        routineService.deleteRoutine(routine.getId(), trainer.getId());
        assertFalse(routineDao.existsById(routine.getId()));
    }

    @Test
    void testDeleteRoutine_AdminPuedeBorrarDeOtro() throws Exception {
        Users admin = createUser("admin", Users.RoleType.ADMIN);
        usersDao.save(admin);

        Routine routine = new Routine("DelAdmin", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        routineService.deleteRoutine(routine.getId(), admin.getId());

        assertFalse(routineDao.existsById(routine.getId()));
    }

    @Test
    void testDeleteRoutine_PermissionDenied() throws Exception {
        Routine routine = new Routine("Del", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        assertThrows(PermissionException.class, () ->
                routineService.deleteRoutine(routine.getId(), user.getId()));
    }

    @Test
    void testMyRoutines_Exito() throws Exception {
        Users trainerLocal = createUser("entrenador", Users.RoleType.TRAINER);
        userService.signUp(trainerLocal);

        Category categoryLocal = createCategory("categoria");
        categoryDao.save(categoryLocal);

        Routine r1 = createAndPersistRoutine(trainerLocal, categoryLocal);
        Routine r2 = createAndPersistRoutine(trainerLocal, categoryLocal);

        Block<Routine> routines = routineService.myRoutines(trainerLocal.getId(), 0, 10);

        assertEquals(2, routines.getItems().size());
        assertTrue(routines.getItems().stream().anyMatch(r -> r.getId().equals(r1.getId())));
        assertTrue(routines.getItems().stream().anyMatch(r -> r.getId().equals(r2.getId())));
    }

    @Test
    void testMyRoutines_TrainerOk_UserFails() throws Exception {
        Routine r = new Routine("R", "Baja", "Desc", "Mat", trainer, category, true);
        routineDao.save(r);

        Block<Routine> trainerRoutines = routineService.myRoutines(trainer.getId(), 0, 10);
        assertEquals(1, trainerRoutines.getItems().size());

        assertThrows(PermissionException.class, () -> routineService.myRoutines(user.getId(), 0, 10));
    }

    @Test
    void testSaveRoutineAndFindSaved() throws Exception {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Routine savedRoutine = routineService.saveRoutine(user.getId(), routine.getId());
        assertEquals(routine.getId(), savedRoutine.getId());

        Block<Routine> savedBlock = routineService.findRoutinesByUserId(user.getId(), 0, 10);
        assertEquals(1, savedBlock.getItems().size());
        assertEquals(routine.getId(), savedBlock.getItems().get(0).getId());
    }

    @Test
    void testSaveRoutine_AlreadySaved() throws Exception {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        routineService.saveRoutine(user.getId(), routine.getId());
        assertThrows(AlreadySavedException.class, () -> routineService.saveRoutine(user.getId(), routine.getId()));
    }

    @Test
    void testSaveRoutine_UserInexistente() {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.saveRoutine(-1L, routine.getId()));
    }

    @Test
    void testSaveRoutine_RutinaInexistente() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.saveRoutine(user.getId(), -1L));
    }

    @Test
    void testUnsaveRoutine_Ok() throws Exception {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        routineService.saveRoutine(user.getId(), routine.getId());
        routineService.unsaveRoutine(user.getId(), routine.getId());

        Block<Routine> saved = routineService.findRoutinesByUserId(user.getId(), 0, 10);
        assertTrue(saved.getItems().isEmpty());
    }

    @Test
    void testUnsaveRoutine_NoGuardadaLanzaAlreadySaved() {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        assertThrows(AlreadySavedException.class, () ->
                routineService.unsaveRoutine(user.getId(), routine.getId()));
    }

    @Test
    void testUnsaveRoutine_UserInexistente() {
        Routine routine = new Routine("Guardar", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.unsaveRoutine(-1L, routine.getId()));
    }

    @Test
    void testFindRoutinesByUserIdVacio() throws Exception {
        Users userLocal = createUser("usuario", Users.RoleType.USER);
        userService.signUp(userLocal);

        Block<Routine> saved = routineService.findRoutinesByUserId(userLocal.getId(), 0, 10);
        assertTrue(saved.getItems().isEmpty());
    }

    @Test
    void testFindRoutinesByUserIdUsuarioInexistente() {
        assertThrows(InstanceNotFoundException.class, () -> routineService.findRoutinesByUserId(-1L, 0, 10));
    }

    @Test
    void testFindUsersWhoSavedRoutine_Ok() throws Exception {
        Routine routine = new Routine("Guardada", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Users u1 = createUser("u1", Users.RoleType.USER);
        userService.signUp(u1);
        Users u2 = createUser("u2", Users.RoleType.USER);
        userService.signUp(u2);

        routineService.saveRoutine(u1.getId(), routine.getId());
        routineService.saveRoutine(u2.getId(), routine.getId());

        Block<Users> block = routineService.findUsersWhoSavedRoutine(trainer.getId(), routine.getId(), 0, 10);

        assertEquals(2, block.getItems().size());
        assertTrue(block.getItems().stream().anyMatch(u -> u.getId().equals(u1.getId())));
        assertTrue(block.getItems().stream().anyMatch(u -> u.getId().equals(u2.getId())));
    }

    @Test
    void testFindUsersWhoSavedRoutine_PermissionDenied() throws Exception {
        Routine routine = new Routine("Guardada", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Users otherTrainer = createUser("otherTrainer", Users.RoleType.TRAINER);
        userService.signUp(otherTrainer);

        assertThrows(PermissionException.class, () ->
                routineService.findUsersWhoSavedRoutine(otherTrainer.getId(), routine.getId(), 0, 10));
    }

    @Test
    void testFindUsersWhoSavedRoutine_RutinaInexistente() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findUsersWhoSavedRoutine(trainer.getId(), -1L, 0, 10));
    }

    @Test
    void testGetCreator_Ok() throws Exception {
        Routine routine = new Routine("R", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        Users creator = routineService.getCreator(routine.getId());

        assertEquals(trainer.getId(), creator.getId());
    }

    @Test
    void testGetCreator_RutinaInexistente() {
        assertThrows(InstanceNotFoundException.class, () -> routineService.getCreator(-1L));
    }

    @Test
    void testCreateAndUpdateRoutine_NotificacionesASeguidores() throws Exception {
        Users follower = createUser("follower", Users.RoleType.USER);
        userService.signUp(follower);

        follower.follow(trainer);
        usersDao.save(follower);
        usersDao.save(trainer);

        int initialNotifications = notificationDao.findByUser_IdOrderByCreatedAtDesc(follower.getId()).size();

        Routine routine = routineService.createRoutine(
                "Rutina notify", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), List.of(), true);

        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        routineService.updateRoutine(
                routine.getId(), "Rutina notify updated", "Alta", "Desc2", "Mat2",
                trainer.getId(), category.getId(), List.of(re), true);

        int afterNotifications = notificationDao.findByUser_IdOrderByCreatedAtDesc(follower.getId()).size();

        assertTrue(afterNotifications >= initialNotifications + 2);
    }

    // ------------------------
    // Métodos auxiliares
    // ------------------------

    private Users createUser(String username, Users.RoleType role) {
        Users u = new Users(username, "pass", "Nombre", "Apellido", username + "@test.com", "seed-" + username);
        u.setRole(role);
        return u;
    }

    private Category createCategory(String name) {
        Category c = new Category();
        c.setName(name + "_" + System.nanoTime());
        return c;
    }

    private Category createAndSaveCategory(String name) {
        Category c = createCategory(name);
        return categoryDao.save(c);
    }

    private Routine createAndPersistRoutine(Users trainer, Category category) {
        Routine r = new Routine("Rutina_" + System.nanoTime(), "Media", "Desc", "Mat", trainer, category, true);
        return routineDao.save(r);
    }

    //Tests usuario premium

    @Test
    void testCreateRoutine_TrainerWithoutPremium_ExceedsLimit_ThrowsPremiumRequiredException() {
        trainer.setIsPremium(false);
        usersDao.save(trainer);

        for (int i = 0; i < 3; i++) {
            Routine routine = new Routine("Routine " + i, "Media", "Desc", "Mat", trainer, category, true);
            routineDao.save(routine);
        }

        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        assertThrows(PremiumRequiredException.class, () ->
                routineService.createRoutine(
                        "Cuarta rutina", "Media", "Desc", "Mat",
                        trainer.getId(), category.getId(), List.of(re), true));
    }

    @Test
    void testCreateRoutine_TrainerWithoutPremium_WithinLimit_Ok() throws Exception {
        trainer.setIsPremium(false);
        usersDao.save(trainer);

        for (int i = 0; i < 2; i++) {
            Routine routine = new Routine("Routine " + i, "Media", "Desc", "Mat", trainer, category, true);
            routineDao.save(routine);
        }

        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        Routine routine = routineService.createRoutine(
                "Tercera rutina", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), List.of(re), true);

        assertNotNull(routine.getId());
    }

    @Test
    void testCreateRoutine_TrainerWithoutPremium_ExceedsExercisePerRoutineLimit_ThrowsPremiumRequiredException() {
        trainer.setIsPremium(false);
        usersDao.save(trainer);

        List<RoutineExercise> exercises = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Exercise exercise = new Exercise("Exercise " + i, "Mat", ExerciseStatus.APPROVED, null, "img.png", "desc");
            exerciseDao.save(exercise);

            RoutineExercise re = new RoutineExercise();
            re.setExercise(exercise);
            re.setRepetitions(10);
            re.setSets(3);
            exercises.add(re);
        }

        assertThrows(PremiumRequiredException.class, () ->
                routineService.createRoutine(
                        "Rutina con muchos ejercicios", "Media", "Desc", "Mat",
                        trainer.getId(), category.getId(), exercises, true));
    }

    @Test
    void testCreateRoutine_TrainerWithPremium_NoLimitsRoutine_Ok() throws Exception {
        trainer.setIsPremium(true);
        usersDao.save(trainer);

        for (int i = 0; i < 3; i++) {
            Routine routine = new Routine("Routine " + i, "Media", "Desc", "Mat", trainer, category, true);
            routineDao.save(routine);
        }

        RoutineExercise re = new RoutineExercise();
        re.setExercise(approvedExercise);
        re.setRepetitions(10);
        re.setSets(3);

        Routine routine = routineService.createRoutine(
                "Cuarta rutina", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), List.of(re), true);

        assertNotNull(routine.getId());
    }

    @Test
    void testCreateRoutine_TrainerWithPremium_NoLimitsExercise_Ok() throws Exception {
        trainer.setIsPremium(true);
        usersDao.save(trainer);

        List<RoutineExercise> exercises = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Exercise exercise = new Exercise("Exercise " + i, "Mat", ExerciseStatus.APPROVED, null, "img.png", "desc");
            exerciseDao.save(exercise);

            RoutineExercise re = new RoutineExercise();
            re.setExercise(exercise);
            re.setRepetitions(10);
            re.setSets(3);
            exercises.add(re);
        }

        Routine routine = routineService.createRoutine(
                "Rutina premium", "Media", "Desc", "Mat",
                trainer.getId(), category.getId(), exercises, true);

        assertNotNull(routine.getId());
        assertEquals(6, routine.getExercises().size());
    }

    @Test
    void testUpdateRoutine_TrainerWithoutPremium_ExceedsExercisePerRoutineLimit_ThrowsPremiumRequiredException() throws Exception {
        trainer.setIsPremium(false);
        usersDao.save(trainer);

        Routine routine = new Routine("Rutina base", "Media", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        List<RoutineExercise> newExercises = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Exercise exercise = new Exercise("Exercise " + i, "Mat", ExerciseStatus.APPROVED, null, "img.png", "desc");
            exerciseDao.save(exercise);

            RoutineExercise re = new RoutineExercise();
            re.setExercise(exercise);
            re.setRepetitions(10);
            re.setSets(3);
            newExercises.add(re);
        }

        assertThrows(PremiumRequiredException.class, () ->
                routineService.updateRoutine(
                        routine.getId(), "Rutina actualizada", "Alta", "New desc", "Mat",
                        trainer.getId(), category.getId(), newExercises, true));
    }

    @Test
    void testGetFollowersRoutineStats_SortsByVolumeDesc() throws InstanceNotFoundException {
        // 1. Setup Users
        Users user1 = new Users("user1", "pass", "User1", "One", "u1@test.com", "seed1");
        user1.setRole(Users.RoleType.USER);
        usersDao.save(user1);
        Users user2 = new Users("user2", "pass", "User2", "Two", "u2@test.com", "seed2");
        user2.setRole(Users.RoleType.USER);
        usersDao.save(user2);
        Users user3 = new Users("user3", "pass", "User3", "Three", "u3@test.com", "seed3");
        user3.setRole(Users.RoleType.USER);
        usersDao.save(user3);

        // 2. Setup Following
        user1.getFollowing().add(user2);
        user1.getFollowing().add(user3);
        usersDao.save(user1);

        // 3. Setup Routine
        Routine routine = new Routine("Test Routine", "Easy", "Desc", "Mat", trainer, category, true);
        routineDao.save(routine);

        // 4. Create Executions with different volumes
        // User 1: 10 * 10 = 100
        createExecution(user1, routine, 10.0, 10);
        // User 2: 20 * 10 = 200 (Highest)
        createExecution(user2, routine, 20.0, 10);
        // User 3: 5 * 10 = 50 (Lowest)
        createExecution(user3, routine, 5.0, 10);

        // 5. Call Service
        List<RoutineFollowerStatDto> stats = routineService.getFollowersRoutineStats(user1.getId(), routine.getId());

        // 6. Assertions
        assertEquals(3, stats.size());
        
        // Check Order: User2 (200), User1 (100), User3 (50)
        assertEquals(user2.getId(), stats.get(0).getUserId());
        assertEquals(200.0, stats.get(0).getTotalVolume(), 0.01);
        
        assertEquals(user1.getId(), stats.get(1).getUserId());
        assertEquals(100.0, stats.get(1).getTotalVolume(), 0.01);
        
        assertEquals(user3.getId(), stats.get(2).getUserId());
        assertEquals(50.0, stats.get(2).getTotalVolume(), 0.01);
    }

    private void createExecution(Users u, Routine r, double weight, int reps) {
        RoutineExecution re = new RoutineExecution();
        re.setUser(u);
        re.setRoutine(r);
        re.setPerformedAt(LocalDateTime.now());
        
        ExerciseExecution ee = new ExerciseExecution();
        ee.setRoutineExecution(re);
        ee.setExercise(approvedExercise);
        
        ExerciseExecutionSet set = new ExerciseExecutionSet();
        set.setExerciseExecution(ee);
        set.setWeight(weight);
        set.setReps(reps);
        
        ee.setSetsDetails(Arrays.asList(set));
        re.setExerciseExecutions(Arrays.asList(ee));
        
        routineExecutionDao.save(re);
    }
}
