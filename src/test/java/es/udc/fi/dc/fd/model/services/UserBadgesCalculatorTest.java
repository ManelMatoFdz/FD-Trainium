package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UserBadgesCalculatorTest {

    @Test
    public void testCalculateBadgesEmptyExecutions() {
        List<String> badges = UserBadgesCalculator.calculateBadges(Collections.emptyList());
        assertTrue(badges.isEmpty());
    }

    @Test
    public void testFirstWorkoutBadge() {
        RoutineExecution exec = new RoutineExecution();
        exec.setPerformedAt(LocalDateTime.now());

        List<String> badges = UserBadgesCalculator.calculateBadges(List.of(exec));

        assertTrue(badges.contains("first_workout"));
    }

    @Test
    public void testConsistencyBadgesFromStreak() {
        RoutineExecution d1 = new RoutineExecution();
        RoutineExecution d2 = new RoutineExecution();
        RoutineExecution d3 = new RoutineExecution();
        RoutineExecution d4 = new RoutineExecution();
        RoutineExecution d5 = new RoutineExecution();
        RoutineExecution d6 = new RoutineExecution();
        RoutineExecution d7 = new RoutineExecution();

        LocalDateTime base = LocalDateTime.of(2024, 1, 1, 10, 0);
        d1.setPerformedAt(base);
        d2.setPerformedAt(base.plusDays(1));
        d3.setPerformedAt(base.plusDays(2));
        d4.setPerformedAt(base.plusDays(3));
        d5.setPerformedAt(base.plusDays(4));
        d6.setPerformedAt(base.plusDays(5));
        d7.setPerformedAt(base.plusDays(6));

        List<String> badges = UserBadgesCalculator.calculateBadges(
                List.of(d1, d2, d3, d4, d5, d6, d7)
        );

        assertTrue(badges.contains("first_workout"));
        assertTrue(badges.contains("consistency_streak_3"));
        assertTrue(badges.contains("consistency_streak_7"));
    }

    @Test
    public void testStrengthBadgesFromWeightUsed() {
        RoutineExecution exec = new RoutineExecution();

        ExerciseExecution e1 = new ExerciseExecution();
        e1.setWeightUsed(45.0); // >= 40

        ExerciseExecution e2 = new ExerciseExecution();
        e2.setWeightUsed(85.0); // >= 80

        ExerciseExecution e3 = new ExerciseExecution();
        e3.setWeightUsed(130.0); // >= 120

        exec.setExerciseExecutions(List.of(e1, e2, e3));
        exec.setPerformedAt(LocalDateTime.now());

        List<String> badges = UserBadgesCalculator.calculateBadges(List.of(exec));

        assertTrue(badges.contains("first_workout"));
        assertTrue(badges.contains("strength_weight_40"));
        assertTrue(badges.contains("strength_weight_80"));
        assertTrue(badges.contains("strength_weight_120"));
    }

    @Test
    public void testComputeMaxWeightIgnoresNulls() {
        RoutineExecution exec = new RoutineExecution();
        exec.setExerciseExecutions(null);

        double max = UserBadgesCalculator.computeMaxWeight(List.of(exec));
        assertEquals(0.0, max, 0.0001);
    }
}

