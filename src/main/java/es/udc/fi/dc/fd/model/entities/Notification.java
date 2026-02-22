package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Notifications")
public class Notification {

    private Long id;

    private Users user;

    private String title;

    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(Users user, String title, String message) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }
    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "userId", nullable = false)
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    @Column(nullable = false, length = 100)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    @Lob
    @Column(nullable = false)
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    @Column(name = "is_read", nullable = false)
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    @CreationTimestamp
    @Column(name = "createdAt", nullable = false, updatable = false)
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}