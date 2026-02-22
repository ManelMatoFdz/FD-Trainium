package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "RoutineExecutionComments")
public class RoutineExecutionComment {

    private Long id;
    private RoutineExecution routineExecution;
    private Users user;
    private String text;
    private LocalDateTime createdAt = LocalDateTime.now();

    public RoutineExecutionComment() {
    }

    public RoutineExecutionComment(RoutineExecution routineExecution, Users user, String text) {
        this.routineExecution = routineExecution;
        this.user = user;
        this.text = text;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routineExecutionId")
    public RoutineExecution getRoutineExecution() {
        return routineExecution;
    }

    public void setRoutineExecution(RoutineExecution routineExecution) {
        this.routineExecution = routineExecution;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "userId")
    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    @Column(nullable = false, length = 1000)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Column(nullable = false)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
