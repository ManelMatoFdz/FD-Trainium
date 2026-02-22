package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ExerciseExecutionSet")
public class ExerciseExecutionSet {

    private Long id;
    private ExerciseExecution exerciseExecution;
    private int setIndex;
    private Integer reps;     // when type = REPS
    private Integer seconds;  // when type = TIME
    private Double weight;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    @ManyToOne(optional = false)
    @JoinColumn(name = "exerciseExecutionId")
    public ExerciseExecution getExerciseExecution() { return exerciseExecution; }

    public void setExerciseExecution(ExerciseExecution exerciseExecution) { this.exerciseExecution = exerciseExecution; }

    public int getSetIndex() { return setIndex; }

    public void setSetIndex(int setIndex) { this.setIndex = setIndex; }

    public Integer getReps() { return reps; }

    public void setReps(Integer reps) { this.reps = reps; }

    public Integer getSeconds() { return seconds; }

    public void setSeconds(Integer seconds) { this.seconds = seconds; }

    public Double getWeight() { return weight; }

    public void setWeight(Double weight) { this.weight = weight; }
}

