package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public class RoutineExerciseDetailDto {

    private Long id;
    private String name;
    private Integer repetitions;
    private Integer sets;
    private Double distanceMeters;
    private Integer durationSeconds;
    private String material;
    private String type; // REPS | TIME | CARDIO
    private List<String> muscles;
    private String image;
    private String description;
    private ExerciseStatus status;

    public RoutineExerciseDetailDto() {}

    private RoutineExerciseDetailDto(Builder b) {
        this.id = b.id;
        this.name = b.name;
        this.repetitions = b.repetitions;
        this.sets = b.sets;
        this.distanceMeters = b.distanceMeters;
        this.durationSeconds = b.durationSeconds;
        this.material = b.material;
        this.type = b.type;
        this.muscles = b.muscles;
        this.image = b.image;
        this.description = b.description;
        this.status = b.status;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private Integer repetitions;
        private Integer sets;
        private Double distanceMeters;
        private Integer durationSeconds;
        private String material;
        private String type;
        private List<String> muscles;
        private String image;
        private String description;
        private ExerciseStatus status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder repetitions(Integer repetitions) { this.repetitions = repetitions; return this; }
        public Builder sets(Integer sets) { this.sets = sets; return this; }
        public Builder distanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; return this; }
        public Builder durationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; return this; }
        public Builder material(String material) { this.material = material; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder muscles(List<String> muscles) { this.muscles = muscles; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(ExerciseStatus status) { this.status = status; return this; }

        public RoutineExerciseDetailDto build() { return new RoutineExerciseDetailDto(this); }
    }

    @NotNull(message = "El ID del ejercicio no puede ser nulo.")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRepetitions() {
        return repetitions;
    }

    public void setRepetitions(Integer repetitions) {
        this.repetitions = repetitions;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public Double getDistanceMeters() { return distanceMeters; }

    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Integer getDurationSeconds() { return durationSeconds; }

    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getMaterial() { return material; }

    public void setMaterial(String material) { this.material = material; }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public List<String> getMuscles() {
        return muscles;
    }

    public void setMuscles(List<String> muscles) {
        this.muscles = muscles;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }

    @AssertTrue(message = "Las series y repeticiones son obligatorias salvo en ejercicios de tipo CARDIO.")
    public boolean isRepetitionsAndSetsValid() {
        if (type != null && type.equalsIgnoreCase("CARDIO")) {
            boolean distanceOk = distanceMeters == null || distanceMeters > 0;
            boolean durationOk = durationSeconds == null || durationSeconds >= 0;
            return distanceOk && durationOk;
        }
        return repetitions != null && repetitions > 0 && sets != null && sets > 0;
    }
}
