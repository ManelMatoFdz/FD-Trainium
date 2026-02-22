package es.udc.fi.dc.fd.dto;

import java.time.LocalDateTime;

/**
 * DTO compartido para representar un item del feed de actividad.
 * Se coloca en un paquete independiente para evitar acoplamientos entre
 * la capa de servicio y la capa REST.
 */
public class FeedItemDto {

    private Long id;
    private Long routineId;
    private String routineName;
    private Long authorId;
    private String authorUserName;
    private String authorAvatarSeed;
    private LocalDateTime performedAt;
    private String type;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer totalDurationSec;
    private String routineLevel;
    private String categoryName;
    private Boolean likedByCurrentUser;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoutineId() { return routineId; }
    public void setRoutineId(Long routineId) { this.routineId = routineId; }
    public String getRoutineName() { return routineName; }
    public void setRoutineName(String routineName) { this.routineName = routineName; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorUserName() { return authorUserName; }
    public void setAuthorUserName(String authorUserName) { this.authorUserName = authorUserName; }
    public String getAuthorAvatarSeed() { return authorAvatarSeed; }
    public void setAuthorAvatarSeed(String authorAvatarSeed) { this.authorAvatarSeed = authorAvatarSeed; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }
    public Integer getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }
    public Integer getTotalDurationSec() { return totalDurationSec; }
    public void setTotalDurationSec(Integer totalDurationSec) { this.totalDurationSec = totalDurationSec; }
    public String getRoutineLevel() { return routineLevel; }
    public void setRoutineLevel(String routineLevel) { this.routineLevel = routineLevel; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Boolean getLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(Boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }

}
