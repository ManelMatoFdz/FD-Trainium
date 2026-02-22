package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * The Class ExerciseExecution.
 */
@Entity
@Table(name = "ExerciseExecution")
public class ExerciseExecution {

    private Long id;
    private RoutineExecution routineExecution;
    private Exercise exercise;
    private Integer performedSets;
    private Integer performedReps;
    private Double weightUsed;
    private String notes;
    private ExerciseType type; // optional snapshot of type used
    private Double distanceMeters; // when type = CARDIO
    private Integer durationSeconds; // when type = CARDIO
    private List<ExerciseExecutionSet> setsDetails;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    @ManyToOne(optional = false)
    @JoinColumn(name = "routineExecutionId")
    public RoutineExecution getRoutineExecution() { return routineExecution; }

    public void setRoutineExecution(RoutineExecution routineExecution) { this.routineExecution = routineExecution; }

    @ManyToOne(optional = false)
    @JoinColumn(name = "exerciseId")
    public Exercise getExercise() { return exercise; }

    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public Integer getPerformedSets() { return performedSets; }

    public void setPerformedSets(Integer performedSets) { this.performedSets = performedSets; }

    public Integer getPerformedReps() { return performedReps; }

    public void setPerformedReps(Integer performedReps) { this.performedReps = performedReps; }

    public Double getWeightUsed() { return weightUsed; }

    public void setWeightUsed(Double weightUsed) { this.weightUsed = weightUsed; }

    public String getNotes() { return notes; }

    public void setNotes(String notes) { this.notes = notes; }

    @Enumerated(EnumType.STRING)
    public ExerciseType getType() { return type; }

    public void setType(ExerciseType type) { this.type = type; }

    public Double getDistanceMeters() { return distanceMeters; }

    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Integer getDurationSeconds() { return durationSeconds; }

    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    @OneToMany(mappedBy = "exerciseExecution", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<ExerciseExecutionSet> getSetsDetails() { return setsDetails; }

    public void setSetsDetails(List<ExerciseExecutionSet> setsDetails) { this.setsDetails = setsDetails; }
}
