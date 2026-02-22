package es.udc.fi.dc.fd.rest.dtos;
import java.util.List;

import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * The Class ExerciseDto.
 */
public class ExerciseDto {

    /** The id. */
    private Long id;

    /** The name. */
    private String name;

    /** The material. */
    private String material;

    private List<String> muscles;

    /** The status. */
    private ExerciseStatus status;

    private String image;

    private String description;

    private String type;

    private String imageMimeType;

    /**
     * Instantiates a new exercise dto.
     */
    public ExerciseDto() {
    }

    private ExerciseDto(Builder builder) {
        this.id = builder.id;
        this.name = builder.name != null ? builder.name.trim() : null;
        this.material = builder.material != null ? builder.material.trim() : null;
        this.status = builder.status;
        this.muscles = builder.muscles;
        this.image = builder.image != null ? builder.image.trim() : null;
        this.description = builder.description != null ? builder.description.trim() : null;
        this.type = builder.type != null ? builder.type.name() : null;
        this.imageMimeType = builder.imageMimeType;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String material;
        private ExerciseStatus status;
        private List<String> muscles;
        private String image;
        private String description;
        private ExerciseType type;
        private String imageMimeType;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder material(String material) { this.material = material; return this; }
        public Builder status(ExerciseStatus status) { this.status = status; return this; }
        public Builder muscles(List<String> muscles) { this.muscles = muscles; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(ExerciseType type) { this.type = type; return this; }
        public Builder imageMimeType(String imageMimeType) { this.imageMimeType = imageMimeType; return this; }

        public ExerciseDto build() { return new ExerciseDto(this); }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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


    public List<String> getMuscles() { return muscles; }
    public void setMuscles(List<String> muscles) { this.muscles = muscles; }

    public String getImage() { return image; }

    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public String getImageMimeType() { return imageMimeType; }

    public void setImageMimeType(String imageMimeType) { this.imageMimeType = imageMimeType; }

}
