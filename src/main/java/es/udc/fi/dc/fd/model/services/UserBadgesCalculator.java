package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.ExerciseExecutionSet;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Helper para calcular insignias de usuario en base a sus ejecuciones de rutinas.
 *
 * La lógica se mantiene contenida aquí para poder probarla de forma unitaria
 * y reutilizarla desde el servicio sin acoplarla a la capa web.
 */
final class UserBadgesCalculator {

    private UserBadgesCalculator() {
        // Utility class
    }

    /**
     * Calcula las insignias desbloqueadas por un usuario en función de sus
     * ejecuciones.
     *
     * Reglas actuales (pueden extenderse en el futuro):
     *  - first_workout: al menos 1 entrenamiento.
     *  - consistency_streak_3: racha actual >= 3 días.
     *  - consistency_streak_7: racha actual >= 7 días.
     *  - consistency_streak_14: racha actual >= 14 días.
     *  - strength_weight_40: peso máximo >= 40kg.
     *  - strength_weight_80: peso máximo >= 80kg.
     *  - strength_weight_120: peso máximo >= 120kg.
     */
    static List<String> calculateBadges(List<RoutineExecution> executions) {
        if (executions == null || executions.isEmpty()) {
            return Collections.emptyList();
        }

        int totalWorkouts = executions.size();
        int currentStreak = computeCurrentStreak(executions);
        double maxWeight = computeMaxWeight(executions);

        List<String> badges = new ArrayList<>();

        if (totalWorkouts >= 1) {
            badges.add("first_workout");
        }
        if (currentStreak >= 3) {
            badges.add("consistency_streak_3");
        }
        if (currentStreak >= 7) {
            badges.add("consistency_streak_7");
        }
        if (currentStreak >= 14) {
            badges.add("consistency_streak_14");
        }
        if (maxWeight >= 40.0) {
            badges.add("strength_weight_40");
        }
        if (maxWeight >= 80.0) {
            badges.add("strength_weight_80");
        }
        if (maxWeight >= 120.0) {
            badges.add("strength_weight_120");
        }

        return badges;
    }

    private static int computeCurrentStreak(List<RoutineExecution> executions) {
        List<LocalDate> dates = extractSortedDates(executions);
        if (dates.isEmpty()) {
            return 0;
        }
        return calculateCurrentStreakFromDates(dates);
    }

    private static List<LocalDate> extractSortedDates(List<RoutineExecution> executions) {
        return executions.stream()
                .map(RoutineExecution::getPerformedAt)
                .filter(Objects::nonNull)
                .map(java.time.LocalDateTime::toLocalDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    private static int calculateCurrentStreakFromDates(List<LocalDate> dates) {
        int currentStreak = 1;
        for (int i = dates.size() - 2; i >= 0; i--) {
            LocalDate next = dates.get(i + 1);
            LocalDate current = dates.get(i);
            if (current.plusDays(1).equals(next)) {
                currentStreak++;
            } else {
                break;
            }
        }
        return currentStreak;
    }

    static double computeMaxWeight(List<RoutineExecution> executions) {
        if (executions == null || executions.isEmpty()) {
            return 0.0;
        }

        double max = 0.0;
        for (RoutineExecution exec : executions) {
            max = Math.max(max, getMaxWeightFromExecution(exec));
        }
        return max;
    }

    private static double getMaxWeightFromExecution(RoutineExecution exec) {
        if (exec == null || exec.getExerciseExecutions() == null) {
            return 0.0;
        }
        double max = 0.0;
        for (ExerciseExecution e : exec.getExerciseExecutions()) {
            max = Math.max(max, getMaxWeightFromExercise(e));
        }
        return max;
    }

    private static double getMaxWeightFromExercise(ExerciseExecution e) {
        if (e == null) {
            return 0.0;
        }
        double max = e.getWeightUsed() != null ? e.getWeightUsed() : 0.0;
        max = Math.max(max, getMaxWeightFromSets(e.getSetsDetails()));
        return max;
    }

    private static double getMaxWeightFromSets(List<ExerciseExecutionSet> sets) {
        if (sets == null) {
            return 0.0;
        }
        double max = 0.0;
        for (ExerciseExecutionSet set : sets) {
            if (set != null && set.getWeight() != null) {
                max = Math.max(max, set.getWeight());
            }
        }
        return max;
    }
}

