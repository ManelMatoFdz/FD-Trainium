package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RoutineDto {


    private Long id;
    private String name;

    private String level;

    private String description;

    private String materials;

    private List<Long> exercises;

    private String categoryName;
    private Long category;
    private Long userId;
    private String userName;
    private Boolean openPublic;

    public RoutineDto() {
    }

    /**
     * Instantiates a new routine dto.
     *
     * @param name        the name
     * @param level       the level
     * @param description the description
     * @param materials   the materials
     * @param exercises   the exercises
     */
    public RoutineDto( String name, String level, String description, String materials,
            List<Long> exercises, String categoryName, Long categoryId, Long userId, String userName, Boolean openPublic) {
        this.name = name != null ? name.trim() : null;
        this.level = level != null ? level.trim() : null;
        this.description = description != null ? description.trim() : null;
        this.materials = materials != null ? materials.trim() : null;
        this.exercises = exercises;
        this.categoryName = categoryName != null ? categoryName.trim() : null;
        this.category = categoryId;
        this.userId = userId;
        this.userName = userName!=null ? userName.trim() : null;
        this.openPublic = openPublic;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @NotNull
    @Size(min = 1, max = 100)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.trim();
    }

    @NotNull
    @Size(min = 1, max = 50)
    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level.trim();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description != null ? description.trim() : null;
    }

    public String getMaterials() {
        return materials;
    }

    public void setMaterials(String materials) {
        this.materials = materials != null ? materials.trim() : null;
    }

    @Valid
    public List<Long> getExercises() {
        return exercises;
    }

    public void setExercises(List<Long> exercises) {
        this.exercises = exercises;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName != null ? categoryName.trim() : null;
    }

    public Long getCategory() {
        return category;
    }

    public void setCategory(Long category) {
        this.category = category;
    }

    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName != null ? userName.trim() : null;
    }

    @NotNull
    public Boolean isOpenPublic() {
        return openPublic;
    }

    public void setOpenPublic(Boolean openPublic) {
        this.openPublic = openPublic;
    }
}
