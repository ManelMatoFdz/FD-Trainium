package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

/**
 * DTO para representar un item del feed de actividad.
 * 
 * Puede ser una ejecución de rutina (EXECUTION) o una rutina creada (ROUTINE).
 */
public class FeedItemDto {

    /** ID único del item (id de ejecución o id de rutina según tipo) */
    private Long id;

    /** ID de la rutina asociada */
    private Long routineId;

    /** Nombre de la rutina */
    private String routineName;

    /** ID del autor (quien ejecutó o creó) */
    private Long authorId;

    /** Username del autor */
    private String authorUserName;

    /** Avatar del autor (URL o seed) */
    private String authorAvatarSeed;

    /** Fecha de la actividad (performedAt para ejecuciones, createdAt para rutinas) */
    private LocalDateTime performedAt;

    /** Tipo de actividad: "EXECUTION" o "ROUTINE" */
    private String type;

    /** Número de likes */
    private Integer likesCount;

    /** Número de comentarios */
    private Integer commentsCount;

    /** Duración total en segundos (solo para ejecuciones) */
    private Integer totalDurationSec;

    /** Nivel de la rutina (BEGINNER, INTERMEDIATE, ADVANCED) */
    private String routineLevel;

    /** Categoría de la rutina */
    private String categoryName;

    /** Si el usuario actual ha dado like a este item */
    private Boolean likedByCurrentUser;

    // ========== Getters y Setters ==========

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

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorUserName() {
        return authorUserName;
    }

    public void setAuthorUserName(String authorUserName) {
        this.authorUserName = authorUserName;
    }

    public String getAuthorAvatarSeed() {
        return authorAvatarSeed;
    }

    public void setAuthorAvatarSeed(String authorAvatarSeed) {
        this.authorAvatarSeed = authorAvatarSeed;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }

    public Integer getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }

    public Integer getTotalDurationSec() {
        return totalDurationSec;
    }

    public void setTotalDurationSec(Integer totalDurationSec) {
        this.totalDurationSec = totalDurationSec;
    }

    public String getRoutineLevel() {
        return routineLevel;
    }

    public void setRoutineLevel(String routineLevel) {
        this.routineLevel = routineLevel;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Boolean getLikedByCurrentUser() {
        return likedByCurrentUser;
    }

    public void setLikedByCurrentUser(Boolean likedByCurrentUser) {
        this.likedByCurrentUser = likedByCurrentUser;
    }
}
