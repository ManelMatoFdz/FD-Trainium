package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for showing routine execution details.
 */
public class RoutineExecutionDto {

    private Long id;
    private Long routineId;
    private String routineName;
    private LocalDateTime performedAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalDurationSec;
    private List<ExerciseExecutionDto> exercises;
    private Long likesCount;
    private Boolean likedByCurrentUser;
    private Long userId;
    private Double totalVolume;

    public RoutineExecutionDto() {}

    public RoutineExecutionDto(Long id, Long routineId, String routineName, LocalDateTime performedAt,
                               LocalDateTime startedAt, LocalDateTime finishedAt, Integer totalDurationSec,
                               List<ExerciseExecutionDto> exercises, Long likesCount, Boolean likedByCurrentUser) {
        this.id = id;
        this.routineId = routineId;
        this.routineName = routineName;
        this.performedAt = performedAt;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.totalDurationSec = totalDurationSec;
        this.exercises = exercises;
        this.likesCount = likesCount;
        this.likedByCurrentUser = likedByCurrentUser;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public String getRoutineName() {
        return routineName;
    }

    public void setRoutineName(String routineName) {
        this.routineName = routineName;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    public Integer getTotalDurationSec() { return totalDurationSec; }
    public void setTotalDurationSec(Integer totalDurationSec) { this.totalDurationSec = totalDurationSec; }

    public List<ExerciseExecutionDto> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseExecutionDto> exercises) {
        this.exercises = exercises;
    }

    public Long getLikesCount() { return likesCount; }
    public void setLikesCount(Long likesCount) { this.likesCount = likesCount; }

    public Boolean getLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(Boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getTotalVolume() { return totalVolume; }
    public void setTotalVolume(Double totalVolume) { this.totalVolume = totalVolume; }
}
