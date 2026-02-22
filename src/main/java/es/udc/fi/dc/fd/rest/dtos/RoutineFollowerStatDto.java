package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

/**
 * DTO para exponer el ranking de seguidores por rutina.
 */
public class RoutineFollowerStatDto {
    private Long userId;
    private String userName;
    private String avatarSeed;
    private Double totalVolume;
    private LocalDateTime lastPerformedAt;

    public RoutineFollowerStatDto(Long userId, String userName, String avatarSeed,
                                  Double totalVolume, LocalDateTime lastPerformedAt) {
        this.userId = userId;
        this.userName = userName;
        this.avatarSeed = avatarSeed;
        this.totalVolume = totalVolume;
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

    public Double getTotalVolume() {
        return totalVolume;
    }

    public LocalDateTime getLastPerformedAt() {
        return lastPerformedAt;
    }
}
