package es.udc.fi.dc.fd.model.entities;
import es.udc.fi.dc.fd.model.common.converter.MuscleGroupConverter;
import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;

import java.util.Set;

import jakarta.persistence.*;


@Entity
public class Exercise {

    private Long id;

    private String name;

    private String material;

    private ExerciseStatus status;

    private Set<ExerciseMuscle> muscles;

    private Set<RoutineExercise> routines;

    private String image;

    private String description;

    @Column(length = 50)
    private String imageMimeType;

    private ExerciseType type = ExerciseType.REPS;


    public Exercise() {
    }

    /**
     * Instantiates a new exercise.
     *
     * @param name        the name
     * @param material    the material

     */
    public Exercise(String name, String material, ExerciseStatus status,  Set<ExerciseMuscle> muscles,  String image, String description) {
        this.name = name;
        this.material = material;
        this.status = status;
        this.muscles = muscles;
        this.image = image;
        this.description = description;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    public Set<RoutineExercise> getRoutines() {
        return routines;
    }

    public void setRoutines(Set<RoutineExercise> routines) {
        this.routines = routines;
    }

    @Enumerated(EnumType.STRING)
    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }

    @Convert(converter = MuscleGroupConverter.class)
    @Column(name = "muscles")
    public Set<ExerciseMuscle> getMuscles() {
        return muscles;
    }

    public void setMuscles(Set<ExerciseMuscle> muscles) {
        this.muscles = muscles;
    }

    @Column(name = "image", columnDefinition = "TEXT")
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    @Column(name = "description", columnDefinition = "TEXT")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageMimeType() {
        return imageMimeType;
    }

    public void setImageMimeType(String imageMimeType) {
        this.imageMimeType = imageMimeType;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    public ExerciseType getType() {
        return type;
    }

    public void setType(ExerciseType type) {
        this.type = type;
    }
}
