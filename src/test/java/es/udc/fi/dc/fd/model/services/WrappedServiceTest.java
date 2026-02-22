package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class WrappedServiceTest {

    @Autowired
    private WrappedService wrappedService;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private ExerciseExecutionSetDao exerciseExecutionSetDao;

    @Autowired
    private RoutineExecutionCommentDao routineExecutionCommentDao;

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

    private Users user;
    private Users otherUser;
    private Users trainer1;
    private Users trainer2;
    private Routine routine1;
    private Routine routine2;
    private Routine routine3;
    private Exercise exercise1;
    private Exercise exercise2;
    private Exercise exercise3;
    private Category category;

    private static final int TEST_YEAR = 2024;

    @BeforeEach
    void setUp() {
        notificationDao.deleteAll();
        routineExecutionCommentDao.deleteAll();
        exerciseExecutionSetDao.deleteAll();
        exerciseExecutionDao.deleteAll();
        routineExecutionDao.deleteAll();
        routineDao.deleteAll();
        exerciseDao.deleteAll();
        categoryDao.deleteAll();
        usersDao.deleteAll();

        // Create users with unique names
        user = new Users("testwrappeduser", "pass", "Test", "User", "testwrapped@test.com", null);
        user.setRole(Users.RoleType.USER);
        usersDao.save(user);

        otherUser = new Users("testwrappedfriend", "pass", "Friend", "User", "testwrappedfriend@test.com", null);
        otherUser.setRole(Users.RoleType.USER);
        usersDao.save(otherUser);

        trainer1 = new Users("testwrappedtrainer1", "pass", "Trainer", "One", "testwrappedtrainer1@test.com", null);
        trainer1.setRole(Users.RoleType.USER);
        usersDao.save(trainer1);

        trainer2 = new Users("testwrappedtrainer2", "pass", "Trainer", "Two", "testwrappedtrainer2@test.com", null);
        trainer2.setRole(Users.RoleType.USER);
        usersDao.save(trainer2);

        // Create category with unique name
        category = new Category("TestWrappedCategory");
        categoryDao.save(category);

        // Create exercises with unique names
        exercise1 = new Exercise("TestWrappedSentadillas", "Barra", null, null, null, "Ejercicio de piernas");
        exerciseDao.save(exercise1);

        exercise2 = new Exercise("TestWrappedPressBanca", "Barra y banco", null, null, null, "Ejercicio de pecho");
        exerciseDao.save(exercise2);

        exercise3 = new Exercise("TestWrappedPesoMuerto", "Barra", null, null, null, "Ejercicio de espalda");
        exerciseDao.save(exercise3);

        // Create routines with unique names by different trainers
        routine1 = new Routine("TestWrappedRutinaFuerza", "Intermedio", "Rutina de fuerza", "Barra", trainer1, category, true);
        routineDao.save(routine1);

        routine2 = new Routine("TestWrappedRutinaCardio", "Basico", "Rutina de cardio", "Ninguno", trainer1, category, true);
        routineDao.save(routine2);

        routine3 = new Routine("TestWrappedRutinaFullBody", "Avanzado", "Rutina completa", "Varios", trainer2, category, true);
        routineDao.save(routine3);
    }

    // ========== Top Exercises Tests ==========

    @Test
    void testGetWrappedStats_TopExercises_ReturnsOrderedByCount() throws InstanceNotFoundException {
        // Setup: Create executions with different exercise counts
        // Exercise1: 5 times, Exercise2: 3 times, Exercise3: 1 time
        createRoutineExecutionWithExercise(user, routine1, exercise1, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise1, 55.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise1, 60.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise1, 65.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise1, 70.0, 10, TEST_YEAR);
        
        createRoutineExecutionWithExercise(user, routine2, exercise2, 40.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine2, exercise2, 45.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine2, exercise2, 50.0, 10, TEST_YEAR);
        
        createRoutineExecutionWithExercise(user, routine3, exercise3, 80.0, 10, TEST_YEAR);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getTopExercises());
        assertEquals(3, stats.getTopExercises().size());
        assertEquals("TestWrappedSentadillas", stats.getTopExercises().get(0).getName());
        assertEquals(5, stats.getTopExercises().get(0).getCount());
        assertEquals("TestWrappedPressBanca", stats.getTopExercises().get(1).getName());
        assertEquals(3, stats.getTopExercises().get(1).getCount());
    }

    @Test
    void testGetWrappedStats_TopExercises_ReturnsMax5() throws InstanceNotFoundException {
        // Create 6 different exercises, only top 5 should be returned
        Exercise ex4 = new Exercise("TestWrappedCurlBiceps", "Mancuernas", null, null, null, "desc");
        Exercise ex5 = new Exercise("TestWrappedExtensionTriceps", "Polea", null, null, null, "desc");
        Exercise ex6 = new Exercise("TestWrappedElevacionesLaterales", "Mancuernas", null, null, null, "desc");
        exerciseDao.save(ex4);
        exerciseDao.save(ex5);
        exerciseDao.save(ex6);

        createRoutineExecutionWithExercise(user, routine1, exercise1, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise2, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, exercise3, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, ex4, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, ex5, 50.0, 10, TEST_YEAR);
        createRoutineExecutionWithExercise(user, routine1, ex6, 50.0, 10, TEST_YEAR);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(5, stats.getTopExercises().size());
    }

    // ========== Top Routines Tests ==========

    @Test
    void testGetWrappedStats_TopRoutines_ReturnsOrderedByCount() throws InstanceNotFoundException {
        // Routine1: 4 times, Routine2: 2 times, Routine3: 1 time
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        
        createRoutineExecution(user, routine2, TEST_YEAR, 1800);
        createRoutineExecution(user, routine2, TEST_YEAR, 1800);
        
        createRoutineExecution(user, routine3, TEST_YEAR, 2700);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getTopRoutines());
        assertEquals(3, stats.getTopRoutines().size());
        assertEquals("TestWrappedRutinaFuerza", stats.getTopRoutines().get(0).getName());
        assertEquals(4, stats.getTopRoutines().get(0).getCount());
        assertEquals("TestWrappedRutinaCardio", stats.getTopRoutines().get(1).getName());
        assertEquals(2, stats.getTopRoutines().get(1).getCount());
    }

    // ========== Top Trainers Tests ==========

    @Test
    void testGetWrappedStats_TopTrainers_ReturnsOrderedByRoutineExecutions() throws InstanceNotFoundException {
        // Trainer1's routines executed 5 times, Trainer2's routines executed 2 times
        createRoutineExecution(user, routine1, TEST_YEAR, 3600); // trainer1
        createRoutineExecution(user, routine1, TEST_YEAR, 3600); // trainer1
        createRoutineExecution(user, routine2, TEST_YEAR, 3600); // trainer1
        createRoutineExecution(user, routine2, TEST_YEAR, 3600); // trainer1
        createRoutineExecution(user, routine2, TEST_YEAR, 3600); // trainer1
        
        createRoutineExecution(user, routine3, TEST_YEAR, 3600); // trainer2
        createRoutineExecution(user, routine3, TEST_YEAR, 3600); // trainer2

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getTopTrainers());
        assertTrue(stats.getTopTrainers().size() >= 1);
        assertEquals("testwrappedtrainer1", stats.getTopTrainers().get(0).getUserName());
        assertEquals(5, stats.getTopTrainers().get(0).getRoutineCount());
    }

    @Test
    void testGetWrappedStats_TopTrainers_ReturnsMax3() throws InstanceNotFoundException {
        Users trainer3 = new Users("testwrappedtrainer3", "pass", "T3", "Three", "testwrappedtrainer3@test.com", null);
        trainer3.setRole(Users.RoleType.USER);
        usersDao.save(trainer3);

        Users trainer4 = new Users("testwrappedtrainer4", "pass", "T4", "Four", "testwrappedtrainer4@test.com", null);
        trainer4.setRole(Users.RoleType.USER);
        usersDao.save(trainer4);

        Routine r4 = new Routine("TestWrappedR4", "Basico", "desc", "mat", trainer3, category, true);
        Routine r5 = new Routine("TestWrappedR5", "Basico", "desc", "mat", trainer4, category, true);
        routineDao.save(r4);
        routineDao.save(r5);

        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        createRoutineExecution(user, routine3, TEST_YEAR, 3600);
        createRoutineExecution(user, r4, TEST_YEAR, 3600);
        createRoutineExecution(user, r5, TEST_YEAR, 3600);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(3, stats.getTopTrainers().size());
    }

    // ========== Best Friend Tests (Bidirectional) ==========

    @Test
    void testGetWrappedStats_BestFriend_CountsLikesGivenAndReceived() throws InstanceNotFoundException {
        // User gives likes to otherUser's executions
        RoutineExecution otherExec1 = createRoutineExecution(otherUser, routine1, TEST_YEAR, 3600);
        RoutineExecution otherExec2 = createRoutineExecution(otherUser, routine2, TEST_YEAR, 3600);
        otherExec1.addLikeByUser(user);
        otherExec2.addLikeByUser(user);
        routineExecutionDao.save(otherExec1);
        routineExecutionDao.save(otherExec2);

        // OtherUser gives likes to user's executions
        RoutineExecution userExec1 = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        userExec1.addLikeByUser(otherUser);
        routineExecutionDao.save(userExec1);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getBestFriend());
        assertEquals("testwrappedfriend", stats.getBestFriend().getUserName());
        assertEquals(3, stats.getBestFriend().getInteractionCount()); // 2 likes given + 1 like received
    }

    @Test
    void testGetWrappedStats_BestFriend_CountsCommentsGivenAndReceived() throws InstanceNotFoundException {
        // User comments on otherUser's executions
        RoutineExecution otherExec = createRoutineExecution(otherUser, routine1, TEST_YEAR, 3600);
        RoutineExecutionComment comment1 = new RoutineExecutionComment(otherExec, user, "Buen trabajo!");
        comment1.setCreatedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 12, 0)); // Set to TEST_YEAR
        routineExecutionCommentDao.save(comment1);

        // OtherUser comments on user's executions
        RoutineExecution userExec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        RoutineExecutionComment comment2 = new RoutineExecutionComment(userExec, otherUser, "Genial!");
        comment2.setCreatedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 13, 0)); // Set to TEST_YEAR
        RoutineExecutionComment comment3 = new RoutineExecutionComment(userExec, otherUser, "Sigue así!");
        comment3.setCreatedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 14, 0)); // Set to TEST_YEAR
        routineExecutionCommentDao.save(comment2);
        routineExecutionCommentDao.save(comment3);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getBestFriend());
        assertEquals("testwrappedfriend", stats.getBestFriend().getUserName());
        assertEquals(3, stats.getBestFriend().getInteractionCount()); // 1 comment given + 2 comments received
    }

    @Test
    void testGetWrappedStats_BestFriend_CombinedInteractions() throws InstanceNotFoundException {
        // User likes and comments on otherUser's execution
        RoutineExecution otherExec = createRoutineExecution(otherUser, routine1, TEST_YEAR, 3600);
        otherExec.addLikeByUser(user);
        routineExecutionDao.save(otherExec);
        RoutineExecutionComment comment1 = new RoutineExecutionComment(otherExec, user, "Like it!");
        comment1.setCreatedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 12, 0)); // Set to TEST_YEAR
        routineExecutionCommentDao.save(comment1);

        // OtherUser likes and comments on user's execution
        RoutineExecution userExec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        userExec.addLikeByUser(otherUser);
        routineExecutionDao.save(userExec);
        RoutineExecutionComment comment2 = new RoutineExecutionComment(userExec, otherUser, "Great!");
        comment2.setCreatedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 13, 0)); // Set to TEST_YEAR
        routineExecutionCommentDao.save(comment2);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats.getBestFriend());
        assertEquals("testwrappedfriend", stats.getBestFriend().getUserName());
        // 1 like given + 1 comment given + 1 like received + 1 comment received = 4
        assertEquals(4, stats.getBestFriend().getInteractionCount());
    }

    @Test
    void testGetWrappedStats_BestFriend_NoInteractions_ReturnsNull() throws InstanceNotFoundException {
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNull(stats.getBestFriend());
    }

    // ========== Total Kg Lifted Tests ==========

    @Test
    void testGetWrappedStats_TotalKgLifted_SumsCorrectly() throws InstanceNotFoundException {
        // Weight = weight per rep * reps
        // Set1: 50kg * 10 reps = 500kg
        // Set2: 60kg * 8 reps = 480kg
        // Total = 980kg
        RoutineExecution exec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        ExerciseExecution exExec = createExerciseExecution(exec, exercise1);
        createExerciseExecutionSet(exExec, 1, 10, 50.0);
        createExerciseExecutionSet(exExec, 2, 8, 60.0);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(980.0, stats.getTotalKgLifted(), 0.01);
    }

    @Test
    void testGetWrappedStats_KgComparison_ReturnsCar() throws InstanceNotFoundException {
        // Less than 1500kg = "un coche"
        RoutineExecution exec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        ExerciseExecution exExec = createExerciseExecution(exec, exercise1);
        createExerciseExecutionSet(exExec, 1, 10, 100.0); // 1000kg

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertTrue(stats.getKgComparison().contains("coche") || stats.getKgComparison().contains("car"));
    }

    @Test
    void testGetWrappedStats_KgComparison_ReturnsElephant() throws InstanceNotFoundException {
        // Around 6000kg = "un elefante"
        RoutineExecution exec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        ExerciseExecution exExec = createExerciseExecution(exec, exercise1);
        createExerciseExecutionSet(exExec, 1, 100, 60.0); // 6000kg

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertTrue(stats.getKgComparison().contains("elefante") || stats.getKgComparison().contains("elephant"));
    }

    @Test
    void testGetWrappedStats_KgComparison_ReturnsTruck() throws InstanceNotFoundException {
        // More than 20000kg = "un camión"
        RoutineExecution exec = createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        ExerciseExecution exExec = createExerciseExecution(exec, exercise1);
        createExerciseExecutionSet(exExec, 1, 500, 50.0); // 25000kg

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertTrue(stats.getKgComparison().contains("camión") || stats.getKgComparison().contains("truck"));
    }

    // ========== Total Hours Trained Tests ==========

    @Test
    void testGetWrappedStats_TotalHours_CalculatesFromDuration() throws InstanceNotFoundException {
        // 3600 sec = 1 hour, 1800 sec = 0.5 hours, 2700 sec = 0.75 hours
        // Total = 2.25 hours
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        createRoutineExecution(user, routine2, TEST_YEAR, 1800);
        createRoutineExecution(user, routine3, TEST_YEAR, 2700);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(2.25, stats.getTotalHoursTrained(), 0.01);
    }

    @Test
    void testGetWrappedStats_TotalHours_HandlesNullDuration() throws InstanceNotFoundException {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine1);
        exec.setPerformedAt(LocalDateTime.of(TEST_YEAR, 6, 15, 10, 0));
        exec.setTotalDurationSec(null); // null duration
        routineExecutionDao.save(exec);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(0.0, stats.getTotalHoursTrained(), 0.01);
    }

    // ========== Edge Cases ==========

    @Test
    void testGetWrappedStats_NoData_ReturnsEmptyStats() throws InstanceNotFoundException {
        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertNotNull(stats);
        assertTrue(stats.getTopExercises().isEmpty());
        assertTrue(stats.getTopRoutines().isEmpty());
        assertTrue(stats.getTopTrainers().isEmpty());
        assertNull(stats.getBestFriend());
        assertEquals(0.0, stats.getTotalKgLifted(), 0.01);
        assertEquals(0.0, stats.getTotalHoursTrained(), 0.01);
    }

    @Test
    void testGetWrappedStats_OnlyCountsSpecifiedYear() throws InstanceNotFoundException {
        // Create execution in 2024 (test year)
        createRoutineExecution(user, routine1, TEST_YEAR, 3600);
        
        // Create execution in 2023 (should NOT be counted)
        RoutineExecution oldExec = new RoutineExecution();
        oldExec.setUser(user);
        oldExec.setRoutine(routine2);
        oldExec.setPerformedAt(LocalDateTime.of(2023, 6, 15, 10, 0));
        oldExec.setTotalDurationSec(7200);
        routineExecutionDao.save(oldExec);

        WrappedStats stats = wrappedService.getWrappedStats(user.getId(), TEST_YEAR);

        assertEquals(1, stats.getTotalHoursTrained(), 0.01); // Only 3600 sec = 1 hour from 2024
    }

    @Test
    void testGetWrappedStats_UserNotFound_ThrowsException() {
        assertThrows(InstanceNotFoundException.class, () ->
                wrappedService.getWrappedStats(-1L, TEST_YEAR));
    }

    // ========== Helper Methods ==========

    private RoutineExecution createRoutineExecution(Users user, Routine routine, int year, int durationSec) {
        RoutineExecution exec = new RoutineExecution();
        exec.setUser(user);
        exec.setRoutine(routine);
        exec.setPerformedAt(LocalDateTime.of(year, 6, 15, 10, 0));
        exec.setTotalDurationSec(durationSec);
        return routineExecutionDao.save(exec);
    }

    private void createRoutineExecutionWithExercise(Users user, Routine routine, Exercise exercise, 
                                                     double weight, int reps, int year) {
        RoutineExecution exec = createRoutineExecution(user, routine, year, 3600);
        ExerciseExecution exExec = createExerciseExecution(exec, exercise);
        createExerciseExecutionSet(exExec, 1, reps, weight);
    }

    private ExerciseExecution createExerciseExecution(RoutineExecution routineExec, Exercise exercise) {
        ExerciseExecution exExec = new ExerciseExecution();
        exExec.setRoutineExecution(routineExec);
        exExec.setExercise(exercise);
        exExec.setPerformedSets(1);
        exExec.setPerformedReps(10);
        return exerciseExecutionDao.save(exExec);
    }

    private void createExerciseExecutionSet(ExerciseExecution exExec, int setIndex, int reps, double weight) {
        ExerciseExecutionSet set = new ExerciseExecutionSet();
        set.setExerciseExecution(exExec);
        set.setSetIndex(setIndex);
        set.setReps(reps);
        set.setWeight(weight);
        exerciseExecutionSetDao.save(set);
    }
}
