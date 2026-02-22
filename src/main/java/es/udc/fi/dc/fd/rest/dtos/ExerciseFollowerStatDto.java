package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

/**
 * DTO para exponer el ranking de seguidores por ejercicio.
 */
public class ExerciseFollowerStatDto {
    private Long userId;
    private String userName;
    private String avatarSeed;
    private Double weightUsed;
    private LocalDateTime lastPerformedAt;

    public ExerciseFollowerStatDto(Long userId, String userName, String avatarSeed,
                                   Double weightUsed, LocalDateTime lastPerformedAt) {
        this.userId = userId;
        this.userName = userName;
        this.avatarSeed = avatarSeed;
        this.weightUsed = weightUsed;
        this.lastPerformedAt = lastPerformedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getAvatarSeed() {
        return avatarSeed;
    }

    public Double getWeightUsed() {
        return weightUsed;
    }

    public LocalDateTime getLastPerformedAt() {
        return lastPerformedAt;
    }
}
