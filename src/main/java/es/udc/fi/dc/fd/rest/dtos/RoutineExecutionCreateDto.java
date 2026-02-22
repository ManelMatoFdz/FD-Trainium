package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for creating a routine execution.
 */
public class RoutineExecutionCreateDto {

    @NotNull
    private Long routineId;

    private List<ExerciseExecutionDto> exercises;

    // Optional timing
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalDurationSec;

    public RoutineExecutionCreateDto() {}

    public RoutineExecutionCreateDto(Long routineId, List<ExerciseExecutionDto> exercises) {
        this.routineId = routineId;
        this.exercises = exercises;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public List<ExerciseExecutionDto> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseExecutionDto> exercises) {
        this.exercises = exercises;
    }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    public Integer getTotalDurationSec() { return totalDurationSec; }
    public void setTotalDurationSec(Integer totalDurationSec) { this.totalDurationSec = totalDurationSec; }
}
