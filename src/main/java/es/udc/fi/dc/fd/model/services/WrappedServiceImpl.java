package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of WrappedService for generating yearly user statistics.
 */
@Service
@Transactional(readOnly = true)
public class WrappedServiceImpl implements WrappedService {

    private static final double CAR_WEIGHT_KG = 1500.0;
    private static final double ELEPHANT_WEIGHT_KG = 6000.0;
    private static final double TRUCK_WEIGHT_KG = 20000.0;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private ExerciseExecutionSetDao exerciseExecutionSetDao;

    @Autowired
    private RoutineExecutionCommentDao routineExecutionCommentDao;

    @Override
    public WrappedStats getWrappedStats(Long userId, int year) throws InstanceNotFoundException {
        if (!userDao.existsById(userId)) {
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        LocalDateTime yearStart = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime yearEnd = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        WrappedStats stats = new WrappedStats();

        // Get all routine executions for the user in the specified year
        List<RoutineExecution> userExecutions = routineExecutionDao
                .findByUserIdAndPerformedAtBetweenOrderByPerformedAtDesc(userId, yearStart, yearEnd);

        // Calculate top exercises
        stats.setTopExercises(calculateTopExercises(userExecutions));

        // Calculate top routines
        stats.setTopRoutines(calculateTopRoutines(userExecutions));

        // Calculate top trainers
        stats.setTopTrainers(calculateTopTrainers(userExecutions));

        // Calculate best friend (bidirectional interactions)
        stats.setBestFriend(calculateBestFriend(userId, yearStart, yearEnd));

        // Calculate total kg lifted
        double totalKg = calculateTotalKgLifted(userExecutions);
        stats.setTotalKgLifted(totalKg);
        stats.setKgComparison(generateKgComparison(totalKg));

        // Calculate total hours trained
        stats.setTotalHoursTrained(calculateTotalHours(userExecutions));

        return stats;
    }

    private List<WrappedStats.ExerciseStats> calculateTopExercises(List<RoutineExecution> executions) {
        Map<Long, Integer> exerciseCounts = new HashMap<>();
        Map<Long, String> exerciseNames = new HashMap<>();

        for (RoutineExecution exec : executions) {
            List<ExerciseExecution> exerciseExecutions = exerciseExecutionDao
                    .findByRoutineExecution_Id(exec.getId());
            
            for (ExerciseExecution exExec : exerciseExecutions) {
                Exercise exercise = exExec.getExercise();
                exerciseCounts.merge(exercise.getId(), 1, Integer::sum);
                exerciseNames.put(exercise.getId(), exercise.getName());
            }
        }

        return exerciseCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new WrappedStats.ExerciseStats(
                        entry.getKey(),
                        exerciseNames.get(entry.getKey()),
                        entry.getValue()))
                .collect(Collectors.toList());
    }

    private List<WrappedStats.RoutineStats> calculateTopRoutines(List<RoutineExecution> executions) {
        Map<Long, Integer> routineCounts = new HashMap<>();
        Map<Long, String> routineNames = new HashMap<>();

        for (RoutineExecution exec : executions) {
            Routine routine = exec.getRoutine();
            routineCounts.merge(routine.getId(), 1, Integer::sum);
            routineNames.put(routine.getId(), routine.getName());
        }

        return routineCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new WrappedStats.RoutineStats(
                        entry.getKey(),
                        routineNames.get(entry.getKey()),
                        entry.getValue()))
                .collect(Collectors.toList());
    }

    private List<WrappedStats.TrainerStats> calculateTopTrainers(List<RoutineExecution> executions) {
        Map<Long, Integer> trainerCounts = new HashMap<>();
        Map<Long, Users> trainers = new HashMap<>();

        for (RoutineExecution exec : executions) {
            Users trainer = exec.getRoutine().getUser();
            if (trainer != null) {
                trainerCounts.merge(trainer.getId(), 1, Integer::sum);
                trainers.put(trainer.getId(), trainer);
            }
        }

        return trainerCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(3)
                .map(entry -> {
                    Users trainer = trainers.get(entry.getKey());
                    return new WrappedStats.TrainerStats(
                            entry.getKey(),
                            trainer.getUserName(),
                            trainer.getFirstName(),
                            trainer.getLastName(),
                            entry.getValue());
                })
                .collect(Collectors.toList());
    }

    private WrappedStats.BestFriend calculateBestFriend(Long userId, LocalDateTime yearStart, LocalDateTime yearEnd) {
        Map<Long, Integer> interactionCounts = new HashMap<>();
        Map<Long, Users> userMap = new HashMap<>();

        List<RoutineExecution> allExecutions = routineExecutionDao.findByPerformedAtBetween(yearStart, yearEnd);
        countLikeInteractions(userId, allExecutions, interactionCounts, userMap);

        List<RoutineExecutionComment> allComments = routineExecutionCommentDao.findByCreatedAtBetween(yearStart, yearEnd);
        countCommentInteractions(userId, allComments, interactionCounts, userMap);

        return findTopInteraction(interactionCounts, userMap);
    }

    private void countLikeInteractions(Long userId, List<RoutineExecution> executions,
                                       Map<Long, Integer> counts, Map<Long, Users> userMap) {
        for (RoutineExecution exec : executions) {
            Users owner = exec.getUser();
            if (!owner.getId().equals(userId)) {
                boolean userLiked = exec.getLikedByUsers().stream().anyMatch(u -> u.getId().equals(userId));
                if (userLiked) {
                    counts.merge(owner.getId(), 1, Integer::sum);
                    userMap.put(owner.getId(), owner);
                }
            } else {
                for (Users liker : exec.getLikedByUsers()) {
                    if (!liker.getId().equals(userId)) {
                        counts.merge(liker.getId(), 1, Integer::sum);
                        userMap.put(liker.getId(), liker);
                    }
                }
            }
        }
    }

    private void countCommentInteractions(Long userId, List<RoutineExecutionComment> comments,
                                          Map<Long, Integer> counts, Map<Long, Users> userMap) {
        for (RoutineExecutionComment comment : comments) {
            Users commenter = comment.getUser();
            Users execOwner = comment.getRoutineExecution().getUser();

            if (commenter.getId().equals(userId) && !execOwner.getId().equals(userId)) {
                counts.merge(execOwner.getId(), 1, Integer::sum);
                userMap.put(execOwner.getId(), execOwner);
            } else if (execOwner.getId().equals(userId) && !commenter.getId().equals(userId)) {
                counts.merge(commenter.getId(), 1, Integer::sum);
                userMap.put(commenter.getId(), commenter);
            }
        }
    }

    private WrappedStats.BestFriend findTopInteraction(Map<Long, Integer> counts, Map<Long, Users> userMap) {
        if (counts.isEmpty()) {
            return null;
        }
        Map.Entry<Long, Integer> topEntry = counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
        if (topEntry == null) {
            return null;
        }
        Users bestFriend = userMap.get(topEntry.getKey());
        return new WrappedStats.BestFriend(
                bestFriend.getId(), bestFriend.getUserName(),
                bestFriend.getFirstName(), bestFriend.getLastName(),
                topEntry.getValue()
        );
    }

    private double calculateTotalKgLifted(List<RoutineExecution> executions) {
        double totalKg = 0.0;

        for (RoutineExecution exec : executions) {
            List<ExerciseExecution> exerciseExecutions = exerciseExecutionDao
                    .findByRoutineExecutionId(exec.getId());

            for (ExerciseExecution exExec : exerciseExecutions) {
                List<ExerciseExecutionSet> sets = exerciseExecutionSetDao
                        .findByExerciseExecutionId(exExec.getId());

                for (ExerciseExecutionSet set : sets) {
                    if (set.getWeight() != null && set.getReps() != null) {
                        totalKg += set.getWeight() * set.getReps();
                    }
                }
            }
        }

        return totalKg;
    }

    private String generateKgComparison(double totalKg) {
        if (totalKg >= TRUCK_WEIGHT_KG) {
            int trucks = (int) Math.round(totalKg / TRUCK_WEIGHT_KG);
            return trucks + " camión" + (trucks > 1 ? "es" : "");
        } else if (totalKg >= ELEPHANT_WEIGHT_KG) {
            int elephants = (int) Math.round(totalKg / ELEPHANT_WEIGHT_KG);
            return elephants + " elefante" + (elephants > 1 ? "s" : "");
        } else {
            int cars = (int) Math.max(1, Math.round(totalKg / CAR_WEIGHT_KG));
            return cars + " coche" + (cars > 1 ? "s" : "");
        }
    }

    private double calculateTotalHours(List<RoutineExecution> executions) {
        int totalSeconds = 0;

        for (RoutineExecution exec : executions) {
            if (exec.getTotalDurationSec() != null) {
                totalSeconds += exec.getTotalDurationSec();
            }
        }

        return totalSeconds / 3600.0;
    }
}
