package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "RoutineExercise")
public class RoutineExercise {

    private Long id;
    private Routine routine;
    private Exercise exercise;
    private Integer repetitions;
    private Integer sets;
    private Double distanceMeters;
    private Integer durationSeconds;
    private String material;

    public RoutineExercise() {}

    public RoutineExercise(Routine routine, Exercise exercise, Integer repetitions, Integer sets,  String material) {
        this.routine = routine;
        this.exercise = exercise;
        this.repetitions = repetitions;
        this.sets = sets;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "repetitions")
    public Integer getRepetitions() {
        return repetitions;
    }

    public void setRepetitions(Integer repetitions) {
        this.repetitions = repetitions;
    }

    @Column(name = "sets")
    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    @Column(name = "distanceMeters")
    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(Double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    @Column(name = "durationSeconds")
    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routineId")
    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exerciseId")
    public Exercise getExercise() {
        return exercise;
    }

    @Transient
    public Long getExerciseId() {
        return exercise.getId();
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    @Column(name = "material")
    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }
}
