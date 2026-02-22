package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * DTO representing an exercise execution.
 */
public class ExerciseExecutionDto {

    @NotNull
    private Long exerciseId;
    private String exerciseName;
    private Integer performedSets;
    private Integer performedReps;
    private Double weightUsed;
    private String notes;
    // Optional extended fields
    private String type; // REPS | TIME
    private java.util.List<ExerciseExecutionSetDto> setsDetails;
    private java.util.List<String> muscles;
    private Double distanceMeters; // CARDIO
    private Integer durationSeconds; // CARDIO (total seconds)

    public ExerciseExecutionDto() {}

    public ExerciseExecutionDto(Long exerciseId, String exerciseName, Integer performedSets, Integer performedReps, Double weightUsed, String notes) {
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.performedSets = performedSets;
        this.performedReps = performedReps;
        this.weightUsed = weightUsed;
        this.notes = notes;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public Integer getPerformedSets() {
        return performedSets;
    }

    public void setPerformedSets(Integer performedSets) {
        this.performedSets = performedSets;
    }

    public Integer getPerformedReps() {
        return performedReps;
    }

    public void setPerformedReps(Integer performedReps) {
        this.performedReps = performedReps;
    }

    public Double getWeightUsed() {
        return weightUsed;
    }

    public void setWeightUsed(Double weightUsed) {
        this.weightUsed = weightUsed;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public java.util.List<ExerciseExecutionSetDto> getSetsDetails() { return setsDetails; }

    public void setSetsDetails(java.util.List<ExerciseExecutionSetDto> setsDetails) { this.setsDetails = setsDetails; }

    public java.util.List<String> getMuscles() { return muscles; }

    public void setMuscles(java.util.List<String> muscles) { this.muscles = muscles; }

    public Double getDistanceMeters() { return distanceMeters; }

    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Integer getDurationSeconds() { return durationSeconds; }

    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
}
