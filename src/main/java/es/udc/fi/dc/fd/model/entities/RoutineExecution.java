package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * The Class RoutineExecution.
 */
@Entity
@Table(name = "RoutineExecution")
public class RoutineExecution {

    private Long id;
    private Users user;
    private Routine routine;
    private LocalDateTime performedAt = LocalDateTime.now();
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalDurationSec;
    private List<ExerciseExecution> exerciseExecutions;
    private Set<Users> likedByUsers = new HashSet<>();
    private List<RoutineExecutionComment> comments;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId")
    public Users getUser() { return user; }

    public void setUser(Users user) { this.user = user; }

    @ManyToOne(optional = false)
    @JoinColumn(name = "routineId")
    public Routine getRoutine() { return routine; }

    public void setRoutine(Routine routine) { this.routine = routine; }

    public LocalDateTime getPerformedAt() { return performedAt; }

    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }

    public LocalDateTime getStartedAt() { return startedAt; }

    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getFinishedAt() { return finishedAt; }

    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }

    public Integer getTotalDurationSec() { return totalDurationSec; }

    public void setTotalDurationSec(Integer totalDurationSec) { this.totalDurationSec = totalDurationSec; }

    @OneToMany(mappedBy = "routineExecution", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<ExerciseExecution> getExerciseExecutions() { return exerciseExecutions; }

    public void setExerciseExecutions(List<ExerciseExecution> exerciseExecutions) { this.exerciseExecutions = exerciseExecutions; }

    @ManyToMany
    @JoinTable(
            name = "RoutineExecutionLikes",
            joinColumns = @JoinColumn(name = "routineExecutionId"),
            inverseJoinColumns = @JoinColumn(name = "userId")
    )
    public Set<Users> getLikedByUsers() { return likedByUsers; }

    public void setLikedByUsers(Set<Users> likedByUsers) { this.likedByUsers = likedByUsers; }

    public void addLikeByUser(Users user) { this.likedByUsers.add(user); }

    public void removeLikeByUser(Users user) { this.likedByUsers.remove(user); }

    @OneToMany(mappedBy = "routineExecution", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<RoutineExecutionComment> getComments() { return comments; }

    public void setComments(List<RoutineExecutionComment> comments) { this.comments = comments; }
}
