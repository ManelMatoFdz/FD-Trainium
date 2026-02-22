package es.udc.fi.dc.fd.rest.dtos;


import java.util.List;

import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;



/**
 * The Class ExerciseDto.
 */
public class ExerciseCreateDto {


    /**
     * The name.
     */
    private String name;

    /**
     * The material.
     */
    private String material;

    private List<String> muscles;

    private ExerciseStatus status;

    private String image;

    private String description;

    private ExerciseType type;

    /**
     * Instantiates a new exercise dto.
     */
    public ExerciseCreateDto() {
    }

    /**
     * Instantiates a new exercise dto.
     *
     * @param name     the name
     * @param material the material
     */
    public ExerciseCreateDto(String name, String material, List<String> muscles,
                             String image, String description) {
        this.name = name != null ? name.trim() : null;
        this.material = material != null ? material.trim() : null;
        this.muscles = muscles;
        this.image = image != null ? image.trim() : "";
        this.description = description != null ? description.trim() : "";
    }


    @NotNull
    @Size(min = 1, max = 100)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.trim();
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material != null ? material.trim() : null;
    }

    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }

    public List<String> getMuscles() {
        return muscles;
    }

    public void setMuscles(List<String> muscles) {
        this.muscles = muscles;
    }

    public String getImage() { return image; }

    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public ExerciseType getType() { return type; }

    public void setType(ExerciseType type) { this.type = type; }
}
