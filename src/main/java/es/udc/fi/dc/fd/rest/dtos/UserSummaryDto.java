package es.udc.fi.dc.fd.rest.dtos;

public class UserSummaryDto {

    private Long id;
    private String userName;
    private String avatarUrl;
    private String avatarSeed;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String userName, String avatarUrl, String avatarSeed) {
        this.id = id;
        this.userName = userName;
        this.avatarUrl = avatarUrl;
        this.avatarSeed = avatarSeed;
    }

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getAvatarSeed() { return avatarSeed; }
    public void setAvatarSeed(String avatarSeed) { this.avatarSeed = avatarSeed; }
}
