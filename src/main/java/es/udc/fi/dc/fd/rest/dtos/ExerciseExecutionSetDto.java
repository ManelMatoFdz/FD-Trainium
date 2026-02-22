package es.udc.fi.dc.fd.rest.dtos;

public class ExerciseExecutionSetDto {
    private Integer index;
    private Integer reps;
    private Integer seconds;
    private Double weight;

    public ExerciseExecutionSetDto() {}

    public ExerciseExecutionSetDto(Integer index, Integer reps, Integer seconds, Double weight) {
        this.index = index;
        this.reps = reps;
        this.seconds = seconds;
        this.weight = weight;
    }

    public Integer getIndex() { return index; }
    public void setIndex(Integer index) { this.index = index; }
    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }
    public Integer getSeconds() { return seconds; }
    public void setSeconds(Integer seconds) { this.seconds = seconds; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}

