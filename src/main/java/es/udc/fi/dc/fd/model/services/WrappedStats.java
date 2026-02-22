package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO containing all wrapped statistics for a user's year.
 */
public class WrappedStats {

    private List<ExerciseStats> topExercises = new ArrayList<>();
    private List<RoutineStats> topRoutines = new ArrayList<>();
    private List<TrainerStats> topTrainers = new ArrayList<>();
    private BestFriend bestFriend;
    private Double totalKgLifted = 0.0;
    private String kgComparison;
    private Double totalHoursTrained = 0.0;

    public WrappedStats() {
        // Default constructor required for JSON serialization
    }

    // Getters and Setters

    public List<ExerciseStats> getTopExercises() {
        return topExercises;
    }

    public void setTopExercises(List<ExerciseStats> topExercises) {
        this.topExercises = topExercises;
    }

    public List<RoutineStats> getTopRoutines() {
        return topRoutines;
    }

    public void setTopRoutines(List<RoutineStats> topRoutines) {
        this.topRoutines = topRoutines;
    }

    public List<TrainerStats> getTopTrainers() {
        return topTrainers;
    }

    public void setTopTrainers(List<TrainerStats> topTrainers) {
        this.topTrainers = topTrainers;
    }

    public BestFriend getBestFriend() {
        return bestFriend;
    }

    public void setBestFriend(BestFriend bestFriend) {
        this.bestFriend = bestFriend;
    }

    public Double getTotalKgLifted() {
        return totalKgLifted;
    }

    public void setTotalKgLifted(Double totalKgLifted) {
        this.totalKgLifted = totalKgLifted;
    }

    public String getKgComparison() {
        return kgComparison;
    }

    public void setKgComparison(String kgComparison) {
        this.kgComparison = kgComparison;
    }

    public Double getTotalHoursTrained() {
        return totalHoursTrained;
    }

    public void setTotalHoursTrained(Double totalHoursTrained) {
        this.totalHoursTrained = totalHoursTrained;
    }

    // Inner classes for nested statistics

    public static class ExerciseStats {
        private Long id;
        private String name;
        private int count;

        public ExerciseStats() {}

        public ExerciseStats(Long id, String name, int count) {
            this.id = id;
            this.name = name;
            this.count = count;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public static class RoutineStats {
        private Long id;
        private String name;
        private int count;

        public RoutineStats() {}

        public RoutineStats(Long id, String name, int count) {
            this.id = id;
            this.name = name;
            this.count = count;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public static class TrainerStats {
        private Long id;
        private String userName;
        private String firstName;
        private String lastName;
        private int routineCount;

        public TrainerStats() {}

        public TrainerStats(Long id, String userName, String firstName, String lastName, int routineCount) {
            this.id = id;
            this.userName = userName;
            this.firstName = firstName;
            this.lastName = lastName;
            this.routineCount = routineCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public int getRoutineCount() { return routineCount; }
        public void setRoutineCount(int routineCount) { this.routineCount = routineCount; }
    }

    public static class BestFriend {
        private Long id;
        private String userName;
        private String firstName;
        private String lastName;
        private int interactionCount;

        public BestFriend() {}

        public BestFriend(Long id, String userName, String firstName, String lastName, int interactionCount) {
            this.id = id;
            this.userName = userName;
            this.firstName = firstName;
            this.lastName = lastName;
            this.interactionCount = interactionCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public int getInteractionCount() { return interactionCount; }
        public void setInteractionCount(int interactionCount) { this.interactionCount = interactionCount; }
    }
}
