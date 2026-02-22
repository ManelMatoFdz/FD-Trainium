package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import es.udc.fi.dc.fd.rest.dtos.ExerciseUpdateDto;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
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
import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.ExerciseExecutionDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseException;
import es.udc.fi.dc.fd.model.services.exceptions.ExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.data.domain.Slice;

@SpringBootTest
@Transactional
class ExerciseServiceTest {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private UserDao usersDao;

    @Autowired
    private CategoryDao categoryDao;

    private Users adminUser;
    private Users trainerUser;
    private Users standardUser;
    private Category category;

    @BeforeEach
    void setup() {
        routineExerciseDao.deleteAll();
        routineDao.deleteAll();
        exerciseDao.deleteAll();
        categoryDao.deleteAll();
        usersDao.deleteAll();

        adminUser = new Users("admin", "pass", "Admin", "User", "admin@test.com", null);
        adminUser.setRole(Users.RoleType.ADMIN);
        usersDao.save(adminUser);

        trainerUser = new Users("trainer", "pass", "Trainer", "User", "trainer@test.com", null);
        trainerUser.setRole(Users.RoleType.TRAINER);
        usersDao.save(trainerUser);

        standardUser = new Users("user", "pass", "Standard", "User", "user@test.com", null);
        standardUser.setRole(Users.RoleType.USER);
        usersDao.save(standardUser);

        // Crear categoría para las rutinas de prueba
        category = new Category("Test Category");
        categoryDao.save(category);
    }

    @Test
    void findExercises_withMuscleFilter_paginatesOnFilteredResults() {
        // Arrange: create 10 approved exercises that do NOT match the muscle filter,
        // and 2 approved exercises that DO match, but would appear later in the unfiltered order.
        for (int i = 0; i < 10; i++) {
            Exercise e = new Exercise(
                    String.format("A%02d", i),
                    null,
                    ExerciseStatus.APPROVED,
                    Set.of(ExerciseMuscle.CHEST),
                    null,
                    null
            );
            exerciseDao.save(e);
        }

        exerciseDao.save(new Exercise(
                "Z01",
                null,
                ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS),
                null,
                null
        ));
        exerciseDao.save(new Exercise(
                "Z02",
                null,
                ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS),
                null,
                null
        ));

        // Act
        Slice<Exercise> slice = exerciseDao.find(null, null, Set.of(ExerciseMuscle.BICEPS), 0, 10);

        // Assert: page 0 should contain the matching exercises, not an empty/partial page.
        assertEquals(2, slice.getContent().size());
        assertFalse(slice.hasNext());
        assertEquals("Z01", slice.getContent().get(0).getName());
        assertEquals("Z02", slice.getContent().get(1).getName());
    }

    @Test
    void testCreateExercise_AdminApproved() throws Exception {
        Exercise ex = exerciseService.createExercise(
                adminUser.getId(), "Curl", "Mancuernas",
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc", ExerciseType.REPS);

        assertNotNull(ex.getId());
        assertEquals(ExerciseStatus.APPROVED, ex.getStatus());
    }

    @Test
    void testCreateExercise_TrainerPending() throws Exception {
        trainerUser.setIsPremium(true);
        usersDao.save(trainerUser);
        Exercise ex = exerciseService.createExercise(
                trainerUser.getId(), "Press", "Barra",
                Set.of(ExerciseMuscle.CHEST), "img.png", "desc", ExerciseType.REPS);

        assertNotNull(ex.getId());
        assertEquals(ExerciseStatus.PENDING, ex.getStatus());
    }

    @Test
    void testCreateExercise_UserForbidden() {
        assertThrows(PermissionException.class, () -> exerciseService.createExercise(
                standardUser.getId(), "Curl", "Mancuernas",
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc", ExerciseType.REPS));
    }

    @Test
    void testCreateExercise_CardioTypeStored() throws Exception {
        trainerUser.setIsPremium(true);
        usersDao.save(trainerUser);

        Exercise ex = exerciseService.createExercise(
                trainerUser.getId(), "Carrera continua", "Zapatillas",
                Set.of(ExerciseMuscle.LEGS), "img.png", "desc", ExerciseType.CARDIO);

        assertNotNull(ex.getId());
        assertEquals(ExerciseType.CARDIO, ex.getType());
    }

    @Test
    void testGetExercise_Ok() throws Exception {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        Exercise result = exerciseService.getExercise(adminUser.getId(), ex.getId());
        assertEquals(ex.getName(), result.getName());
    }

    @Test
    void testGetExercise_NotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.getExercise(adminUser.getId(), 999L));
    }

    @Test
    void testUpdateExercise_AdminOk() throws Exception {
        Exercise ex = exerciseDao.save(new Exercise("Old", "Mat", ExerciseStatus.PENDING,
                Set.of(ExerciseMuscle.LEGS), "old.png", "desc"));

        // Crear DTO con los datos nuevos
        ExerciseUpdateDto dto = new ExerciseUpdateDto();
        dto.setName("New");
        dto.setMaterial("NewMat");
        dto.setStatus(ExerciseStatus.APPROVED);
        dto.setExerciseMuscles(Set.of(ExerciseMuscle.LEGS));
        dto.setImage("new.png");
        dto.setDescription("new desc");

        Exercise updated = exerciseService.updateExercise(adminUser.getId(), ex.getId(), dto);

        assertEquals("New", updated.getName());
        assertEquals(ExerciseStatus.APPROVED, updated.getStatus());
    }

    @Test
    void testUpdateExercise_UserForbidden() {
        Exercise ex = exerciseDao.save(new Exercise("Old", "Mat", ExerciseStatus.PENDING,
                Set.of(ExerciseMuscle.LEGS), "old.png", "desc"));

        ExerciseUpdateDto dto = new ExerciseUpdateDto();
        dto.setName("New");
        dto.setMaterial("Mat");
        dto.setStatus(ExerciseStatus.APPROVED);
        dto.setExerciseMuscles(Set.of(ExerciseMuscle.LEGS));
        dto.setImage("new.png");
        dto.setDescription("desc");

        assertThrows(PermissionException.class, () ->
                exerciseService.updateExercise(standardUser.getId(), ex.getId(), dto));
    }

    @Test
    void testDeleteExercise_AdminOk() throws Exception {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        exerciseService.deleteExercise(adminUser.getId(), ex.getId());
        assertFalse(exerciseDao.findById(ex.getId()).isPresent());
    }

        @Test
        void testDeleteExercise_InRoutine() {
        // Crear y guardar un ejercicio
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        // Crear una rutina mínima
        Routine routine = new Routine();
        routine.setName("Rutina Test");
        routine.setLevel("Básico");
        routine.setUser(adminUser);
        routine.setCategory(category);  // Asignar la categoría
        routine.setMaterials("Mancuernas");
        routineDao.save(routine);

        // Asociar el ejercicio a la rutina
        RoutineExercise re = new RoutineExercise();
        re.setExercise(ex);
        re.setRoutine(routine);
        routineExerciseDao.save(re);

        // Ahora debe lanzar la excepción porque el ejercicio está en una rutina
        assertThrows(ExerciseInRoutineException.class, () ->
                exerciseService.deleteExercise(adminUser.getId(), ex.getId()));
        }


    @Test
    void testDeleteExercise_UserForbidden() {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        assertThrows(PermissionException.class, () ->
                exerciseService.deleteExercise(standardUser.getId(), ex.getId()));
    }

    @Test
    void testFindExercises_AdminOk() throws Exception {
        exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        Block<Exercise> block = exerciseService.findExercises(adminUser.getId(), null, null, null, 0, 10);
        assertTrue(block.getItems().size() >= 1);
    }

    @Test
    void testFindExercises_UserOk() throws Exception {
        exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        Block<Exercise> block = exerciseService.findExercises(standardUser.getId(), null, null, null, 0, 10);
        assertFalse(block.getItems().isEmpty());
    }

    @Test
    void testFindExercises_TrainerOk() throws Exception {
        exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        Block<Exercise> block = exerciseService.findExercises(trainerUser.getId(), null, null, null, 0, 10);
        assertFalse(block.getItems().isEmpty());
    }

    @Test
    void testFindExercisesPending_AdminOk() throws Exception {
        exerciseDao.save(new Exercise("Pendiente", "Mat", ExerciseStatus.PENDING,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        Block<Exercise> block = exerciseService.findExercisesPending(adminUser.getId(), null, null, null, 0, 10);
        assertFalse(block.getItems().isEmpty());
    }

    @Test
    void testFindExercisesPending_NonAdminForbidden() {
        assertThrows(PermissionException.class, () ->
                exerciseService.findExercisesPending(trainerUser.getId(), null, null, null, 0, 10));
    }

    @Test
    void testCreateExercise_DuplicateNameThrows() throws Exception {
        exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        assertThrows(DuplicateExerciseException.class, () ->
                exerciseService.createExercise(
                        adminUser.getId(), "Curl", "Mancuernas",
                        Set.of(ExerciseMuscle.BICEPS), "img2.png", "desc2", ExerciseType.REPS));
    }

    @Test
    void testUpdateExercise_NotFound() {
        ExerciseUpdateDto dto = new ExerciseUpdateDto();
        dto.setName("New");
        dto.setMaterial("Mat");
        dto.setStatus(ExerciseStatus.APPROVED);
        dto.setExerciseMuscles(Set.of(ExerciseMuscle.BICEPS));
        dto.setImage("img.png");
        dto.setDescription("desc");

        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.updateExercise(adminUser.getId(), 999L, dto));
    }

    @Test
    void testDeleteExercise_NotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.deleteExercise(adminUser.getId(), 999L));
    }

    @Test
    void testUpdateExerciseImage_AdminSetsImageAndKeepsStatus() throws Exception {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.PENDING,
                Set.of(ExerciseMuscle.BICEPS), null, "desc"));

        Exercise updated = exerciseService.updateExerciseImage(
                adminUser.getId(), ex.getId(), "AAAABBBB", "image/png");

        assertNotNull(updated.getImage());
        assertTrue(updated.getImage().startsWith("data:image/png;base64,"));
        assertEquals(ExerciseStatus.PENDING, updated.getStatus());
    }

    @Test
    void testUpdateExerciseImage_TrainerClearsImageWhenEmpty() throws Exception {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "data:image/png;base64,XXXX", "desc"));

        Exercise updated = exerciseService.updateExerciseImage(
                trainerUser.getId(), ex.getId(), "", "image/png");

        assertEquals(ExerciseStatus.APPROVED, updated.getStatus());
        assertEquals(null, updated.getImage());
        assertEquals(null, updated.getImageMimeType());
    }

    @Test
    void testUpdateExerciseImage_UserForbidden() {
        Exercise ex = exerciseDao.save(new Exercise("Curl", "Mat", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc"));

        assertThrows(PermissionException.class, () ->
                exerciseService.updateExerciseImage(
                        standardUser.getId(), ex.getId(), "AAAABBBB", "image/png"));
    }

    @Test
    void testUpdateExerciseImage_ExerciseNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.updateExerciseImage(
                        adminUser.getId(), 999L, "AAAABBBB", "image/png"));
    }

    //Tests usuario premium
    @Test
    void testCreateExercise_TrainerWithoutPremium_ThrowsPremiumRequiredException() {
        trainerUser.setIsPremium(false);
        usersDao.save(trainerUser);

        assertThrows(PremiumRequiredException.class, () ->
                exerciseService.createExercise(
                        trainerUser.getId(), "Press", "Barra",
                        Set.of(ExerciseMuscle.CHEST), "img.png", "desc", ExerciseType.REPS));
    }

    @Test
    void testCreateExercise_TrainerWithPremium_Ok() throws Exception {
        trainerUser.setIsPremium(true);
        usersDao.save(trainerUser);

        Exercise ex = exerciseService.createExercise(
                trainerUser.getId(), "Press", "Barra",
                Set.of(ExerciseMuscle.CHEST), "img.png", "desc", ExerciseType.REPS);

        assertNotNull(ex.getId());
        assertEquals(ExerciseStatus.PENDING, ex.getStatus());
    }

    @Test
    void testCreateExercise_AdminIgnoresPremium_Ok() throws Exception {
        adminUser.setIsPremium(false);
        usersDao.save(adminUser);

        Exercise ex = exerciseService.createExercise(
                adminUser.getId(), "Admin Exercise", "Mat",
                Set.of(ExerciseMuscle.BICEPS), "img.png", "desc", ExerciseType.REPS);

        assertNotNull(ex.getId());
        assertEquals(ExerciseStatus.APPROVED, ex.getStatus());
    }

    @Test
    void testGetFollowersExerciseStats_ReturnsRankingByWeight() throws Exception {
        Exercise exercise = new Exercise();
        exercise.setName("Peso muerto stats");
        exercise.setStatus(ExerciseStatus.APPROVED);
        exercise.setMuscles(Set.of(ExerciseMuscle.BACK));
        exerciseDao.save(exercise);

        Users followee1 = new Users("alice", "pass", "A", "One", "a1@test.com", null);
        followee1.setRole(Users.RoleType.USER);
        usersDao.save(followee1);

        Users followee2 = new Users("bob", "pass", "B", "Two", "b2@test.com", null);
        followee2.setRole(Users.RoleType.USER);
        usersDao.save(followee2);

        standardUser.follow(followee1);
        standardUser.follow(followee2);
        usersDao.save(standardUser);
        usersDao.save(followee1);
        usersDao.save(followee2);

        persistExecutionWithWeight(followee1, exercise, 150.0, LocalDateTime.of(2024, 1, 10, 10, 0));
        persistExecutionWithWeight(followee1, exercise, 140.0, LocalDateTime.of(2024, 1, 9, 10, 0)); // inferior, no cambia el max
        persistExecutionWithWeight(followee2, exercise, 120.0, LocalDateTime.of(2024, 1, 8, 10, 0));
        persistExecutionWithWeight(standardUser, exercise, 130.0, LocalDateTime.of(2024, 1, 11, 10, 0)); // propio usuario

        List<ExerciseFollowerStatDto> stats = exerciseService.getFollowersExerciseStats(standardUser.getId(), exercise.getId());

        assertEquals(3, stats.size());
        // Ordenado por peso desc: followee1 (150), user (130), followee2 (120)
        assertEquals(followee1.getId(), stats.get(0).getUserId());
        assertEquals(150.0, stats.get(0).getWeightUsed());
        assertEquals(standardUser.getId(), stats.get(1).getUserId());
        assertEquals(130.0, stats.get(1).getWeightUsed());
        assertEquals(followee2.getId(), stats.get(2).getUserId());
        assertEquals(120.0, stats.get(2).getWeightUsed());
    }

    @Test
    void testGetFollowersExerciseStats_IgnoresFolloweesWithoutWeight() throws Exception {
        Exercise exercise = new Exercise();
        exercise.setName("Sentadilla stats");
        exercise.setStatus(ExerciseStatus.APPROVED);
        exercise.setMuscles(Set.of(ExerciseMuscle.LEGS));
        exerciseDao.save(exercise);

        Users followee1 = new Users("charlie", "pass", "C", "Three", "c3@test.com", null);
        followee1.setRole(Users.RoleType.USER);
        usersDao.save(followee1);

        Users followee2 = new Users("dave", "pass", "D", "Four", "d4@test.com", null);
        followee2.setRole(Users.RoleType.USER);
        usersDao.save(followee2);

        standardUser.follow(followee1);
        standardUser.follow(followee2);
        usersDao.save(standardUser);
        usersDao.save(followee1);
        usersDao.save(followee2);

        persistExecutionWithWeight(followee1, exercise, null, LocalDateTime.of(2024, 2, 1, 12, 0)); // sin peso -> se ignora
        persistExecutionWithWeight(followee2, exercise, 80.0, LocalDateTime.of(2024, 2, 2, 12, 0));

        List<ExerciseFollowerStatDto> stats = exerciseService.getFollowersExerciseStats(standardUser.getId(), exercise.getId());

        assertEquals(1, stats.size());
        assertEquals(followee2.getId(), stats.get(0).getUserId());
        assertEquals(80.0, stats.get(0).getWeightUsed());
    }

    @Test
    void testGetFollowersExerciseStats_IncludesRequesterEvenWithoutFollowees() throws Exception {
        Exercise exercise = new Exercise();
        exercise.setName("Press inclinado");
        exercise.setStatus(ExerciseStatus.APPROVED);
        exercise.setMuscles(Set.of(ExerciseMuscle.CHEST));
        exerciseDao.save(exercise);

        // Sin followees, solo ejecuciones propias
        persistExecutionWithWeight(standardUser, exercise, 90.0, LocalDateTime.of(2024, 3, 1, 9, 0));

        List<ExerciseFollowerStatDto> stats = exerciseService.getFollowersExerciseStats(standardUser.getId(), exercise.getId());

        assertEquals(1, stats.size());
        assertEquals(standardUser.getId(), stats.get(0).getUserId());
        assertEquals(90.0, stats.get(0).getWeightUsed());
    }

    @Test
    void testGetFollowersExerciseStats_ExerciseNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.getFollowersExerciseStats(standardUser.getId(), 9999L));
    }

    @Test
    void testFindExecutedExercises_ReturnsDistinct() throws Exception {
        Exercise ex1 = exerciseDao.save(new Exercise("Peso muerto test", "Barra", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.BACK), "img1.png", "desc1"));
        Exercise ex2 = exerciseDao.save(new Exercise("Press banca", "Barra", ExerciseStatus.APPROVED,
                Set.of(ExerciseMuscle.CHEST), "img2.png", "desc2"));

        persistExecutionWithWeight(standardUser, ex1, 100.0, LocalDateTime.of(2024, 1, 1, 10, 0));
        persistExecutionWithWeight(standardUser, ex1, 110.0, LocalDateTime.of(2024, 1, 2, 10, 0)); // mismo ejercicio, no duplica
        persistExecutionWithWeight(standardUser, ex2, 80.0, LocalDateTime.of(2024, 1, 3, 10, 0));

        List<Exercise> executed = exerciseService.findUserPerformedExercises(standardUser.getId());

        assertEquals(2, executed.size());
        assertTrue(executed.stream().anyMatch(e -> e.getId().equals(ex1.getId())));
        assertTrue(executed.stream().anyMatch(e -> e.getId().equals(ex2.getId())));
    }

    @Test
    void testFindExecutedExercises_EmptyWhenNoExecutions() throws Exception {
        List<Exercise> executed = exerciseService.findUserPerformedExercises(standardUser.getId());
        assertTrue(executed.isEmpty());
    }

    @Test
    void testFindExecutedExercises_UserNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                exerciseService.findUserPerformedExercises(999L));
    }

    private void persistExecutionWithWeight(Users user, Exercise exercise, Double weight, LocalDateTime performedAt) {
        Routine routine = new Routine();
        routine.setName("R-" + user.getUserName());
        routine.setUser(user);
        routine.setLevel("MEDIUM");
        routine.setCategory(category);
        routineDao.save(routine);

        RoutineExecution re = new RoutineExecution();
        re.setUser(user);
        re.setRoutine(routine);
        re.setPerformedAt(performedAt);
        routineExecutionDao.save(re);

        ExerciseExecution ee = new ExerciseExecution();
        ee.setRoutineExecution(re);
        ee.setExercise(exercise);
        ee.setWeightUsed(weight);
        exerciseExecutionDao.save(ee);
    }
}
