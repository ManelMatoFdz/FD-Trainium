package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class RoutineDetailDto {

    private Long id;
    private String name;
    private String level;
    private String description;
    private String materials;
    private Long category;
    private String categoryName;
    private List<RoutineExerciseDetailDto> exercises;
    private Long userId;
    private String userName;
    private String userRole;
    private Boolean openPublic;

    public RoutineDetailDto() {}

    public RoutineDetailDto(Long id, String name, String level, String description, 
                            String materials, String categoryName, List<RoutineExerciseDetailDto> exercises, Long userId, String userName, String userRole, Boolean openPublic) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.description = description;
        this.materials = materials;
        this.categoryName = categoryName;
        this.exercises = exercises;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.openPublic = openPublic;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @NotNull
    @Size(min = 1, max = 100)
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @NotNull
    @Size(min = 1, max = 50)
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMaterials() { return materials; }
    public void setMaterials(String materials) { this.materials = materials; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getCategory() {
        return category;
    }

    public void setCategory(Long category) {
        this.category = category;
    }

    @Valid
    public List<RoutineExerciseDetailDto> getExercises() { return exercises; }
    public void setExercises(List<RoutineExerciseDetailDto> exercises) { this.exercises = exercises; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() {return userName;}
    public void setUserName(String userName) {this.userName = userName;}

    public String getUserRole() {return userRole;}
    public void setUserRole(String userRole) {this.userRole = userRole;}

    public Boolean isOpenPublic() {return openPublic;}
    public void setOpenPublic(Boolean openPublic) {this.openPublic = openPublic;
    }
}
