package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class CommentDto {
    private Long id;
    private Long userId;
    private String userName;
    private String text;
    private LocalDateTime createdAt;

    public CommentDto() {}

    public CommentDto(Long id, Long userId, String userName, String text, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.text = text;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
