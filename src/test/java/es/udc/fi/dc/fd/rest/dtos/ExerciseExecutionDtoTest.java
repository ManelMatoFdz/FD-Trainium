package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class ExerciseExecutionDtoTest {

    @Test
    public void testNoArgConstructor() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        assertNotNull(dto);
        assertNull(dto.getExerciseId());
        assertNull(dto.getExerciseName());
        assertNull(dto.getPerformedSets());
        assertNull(dto.getPerformedReps());
        assertNull(dto.getWeightUsed());
        assertNull(dto.getNotes());
        assertNull(dto.getType());
        assertNull(dto.getSetsDetails());
        assertNull(dto.getDistanceMeters());
        assertNull(dto.getDurationSeconds());
    }

    @Test
    public void testParameterizedConstructor() {
        Long exerciseId = 1L;
        String exerciseName = "Press banca";
        Integer performedSets = 3;
        Integer performedReps = 10;
        Double weightUsed = 50.5;
        String notes = "Good form";

        ExerciseExecutionDto dto = new ExerciseExecutionDto(exerciseId, exerciseName, performedSets, performedReps, weightUsed, notes);

        assertEquals(exerciseId, dto.getExerciseId());
        assertEquals(exerciseName, dto.getExerciseName());
        assertEquals(performedSets, dto.getPerformedSets());
        assertEquals(performedReps, dto.getPerformedReps());
        assertEquals(weightUsed, dto.getWeightUsed());
        assertEquals(notes, dto.getNotes());
    }

    @Test
    public void testSetExerciseId() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setExerciseId(42L);

        assertEquals(Long.valueOf(42L), dto.getExerciseId());
    }

    @Test
    public void testSetExerciseName() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setExerciseName("Press banca");

        assertEquals("Press banca", dto.getExerciseName());
    }

    @Test
    public void testSetPerformedSets() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setPerformedSets(5);

        assertEquals(Integer.valueOf(5), dto.getPerformedSets());
    }

    @Test
    public void testSetPerformedReps() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setPerformedReps(12);

        assertEquals(Integer.valueOf(12), dto.getPerformedReps());
    }

    @Test
    public void testSetWeightUsed() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setWeightUsed(75.0);

        assertEquals(Double.valueOf(75.0), dto.getWeightUsed());
    }

    @Test
    public void testSetNotes() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setNotes("Felt strong today");

        assertEquals("Felt strong today", dto.getNotes());
    }

    @Test
    public void testSetType() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setType("REPS");

        assertEquals("REPS", dto.getType());
    }

    @Test
    public void testSetTypeTime() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setType("TIME");

        assertEquals("TIME", dto.getType());
    }

    @Test
    public void testSetSetsDetails() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        ExerciseExecutionSetDto set1 = new ExerciseExecutionSetDto(1, 10, null, 50.0);
        ExerciseExecutionSetDto set2 = new ExerciseExecutionSetDto(2, 8, null, 55.0);
        List<ExerciseExecutionSetDto> setsDetails = Arrays.asList(set1, set2);

        dto.setSetsDetails(setsDetails);

        assertNotNull(dto.getSetsDetails());
        assertEquals(2, dto.getSetsDetails().size());
        assertEquals(Integer.valueOf(10), dto.getSetsDetails().get(0).getReps());
    }

    @Test
    public void testConstructorWithNullValues() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(null, null, null, null, null, null);

        assertNull(dto.getExerciseId());
        assertNull(dto.getExerciseName());
        assertNull(dto.getPerformedSets());
        assertNull(dto.getPerformedReps());
        assertNull(dto.getWeightUsed());
        assertNull(dto.getNotes());
    }

    @Test
    public void testSetNullNotes() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setNotes(null);

        assertNull(dto.getNotes());
    }

    @Test
    public void testSetDistanceAndDuration() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setDistanceMeters(2500.5);
        dto.setDurationSeconds(780);

        assertEquals(Double.valueOf(2500.5), dto.getDistanceMeters());
        assertEquals(Integer.valueOf(780), dto.getDurationSeconds());
    }

    @Test
    public void testSetZeroValues() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setPerformedSets(0);
        dto.setPerformedReps(0);
        dto.setWeightUsed(0.0);

        assertEquals(Integer.valueOf(0), dto.getPerformedSets());
        assertEquals(Integer.valueOf(0), dto.getPerformedReps());
        assertEquals(Double.valueOf(0.0), dto.getWeightUsed());
    }

    @Test
    public void testAllGettersAndSetters() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto();
        dto.setExerciseId(10L);
        dto.setExerciseName("Curl bíceps");
        dto.setPerformedSets(4);
        dto.setPerformedReps(15);
        dto.setWeightUsed(80.0);
        dto.setNotes("Perfect execution");
        dto.setType("REPS");
        
        ExerciseExecutionSetDto set = new ExerciseExecutionSetDto(1, 15, null, 80.0);
        dto.setSetsDetails(Arrays.asList(set));

        assertEquals(Long.valueOf(10L), dto.getExerciseId());
        assertEquals("Curl bíceps", dto.getExerciseName());
        assertEquals(Integer.valueOf(4), dto.getPerformedSets());
        assertEquals(Integer.valueOf(15), dto.getPerformedReps());
        assertEquals(Double.valueOf(80.0), dto.getWeightUsed());
        assertEquals("Perfect execution", dto.getNotes());
        assertEquals("REPS", dto.getType());
        assertEquals(1, dto.getSetsDetails().size());
        assertNull(dto.getDistanceMeters());
        assertNull(dto.getDurationSeconds());
    }
}
