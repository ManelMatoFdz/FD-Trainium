package es.udc.fi.dc.fd.rest.dtos;

import java.util.Set;
import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;

public class ExerciseUpdateDto {

    private String name;
    private String material;
    private ExerciseStatus status;
    private Set<ExerciseMuscle> exerciseMuscles;
    private String image;
    private String description;
    private ExerciseType type;

    public ExerciseUpdateDto() {}

    public ExerciseUpdateDto(String name, String material, ExerciseStatus status,
                             Set<ExerciseMuscle> exerciseMuscles, String image, String description, ExerciseType type) {
        this.name = name;
        this.material = material;
        this.status = status;
        this.exerciseMuscles = exerciseMuscles;
        this.image = image;
        this.description = description;
        this.type = type;
    }

    // Getters y setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public ExerciseStatus getStatus() { return status; }
    public void setStatus(ExerciseStatus status) { this.status = status; }

    public Set<ExerciseMuscle> getExerciseMuscles() { return exerciseMuscles; }
    public void setExerciseMuscles(Set<ExerciseMuscle> exerciseMuscles) { this.exerciseMuscles = exerciseMuscles; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ExerciseType getType() { return type; }
    public void setType(ExerciseType type) { this.type = type; }
}
