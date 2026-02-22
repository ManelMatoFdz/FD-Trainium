package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import static org.junit.Assert.*;

public class ExerciseExecutionSetDtoTest {

    @Test
    public void testNoArgConstructor() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        assertNotNull(dto);
        assertNull(dto.getIndex());
        assertNull(dto.getReps());
        assertNull(dto.getSeconds());
        assertNull(dto.getWeight());
    }

    @Test
    public void testParameterizedConstructor() {
        Integer index = 1;
        Integer reps = 10;
        Integer seconds = 30;
        Double weight = 50.0;

        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(index, reps, seconds, weight);

        assertEquals(index, dto.getIndex());
        assertEquals(reps, dto.getReps());
        assertEquals(seconds, dto.getSeconds());
        assertEquals(weight, dto.getWeight());
    }

    @Test
    public void testSetIndex() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        dto.setIndex(2);

        assertEquals(Integer.valueOf(2), dto.getIndex());
    }

    @Test
    public void testSetReps() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        dto.setReps(12);

        assertEquals(Integer.valueOf(12), dto.getReps());
    }

    @Test
    public void testSetSeconds() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        dto.setSeconds(45);

        assertEquals(Integer.valueOf(45), dto.getSeconds());
    }

    @Test
    public void testSetWeight() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        dto.setWeight(75.5);

        assertEquals(Double.valueOf(75.5), dto.getWeight());
    }

    @Test
    public void testConstructorWithNullValues() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(null, null, null, null);

        assertNull(dto.getIndex());
        assertNull(dto.getReps());
        assertNull(dto.getSeconds());
        assertNull(dto.getWeight());
    }

    @Test
    public void testRepsBasedSet() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(1, 15, null, 60.0);

        assertEquals(Integer.valueOf(1), dto.getIndex());
        assertEquals(Integer.valueOf(15), dto.getReps());
        assertNull(dto.getSeconds());
        assertEquals(Double.valueOf(60.0), dto.getWeight());
    }

    @Test
    public void testTimeBasedSet() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(1, null, 60, 0.0);

        assertEquals(Integer.valueOf(1), dto.getIndex());
        assertNull(dto.getReps());
        assertEquals(Integer.valueOf(60), dto.getSeconds());
        assertEquals(Double.valueOf(0.0), dto.getWeight());
    }

    @Test
    public void testZeroValues() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(0, 0, 0, 0.0);

        assertEquals(Integer.valueOf(0), dto.getIndex());
        assertEquals(Integer.valueOf(0), dto.getReps());
        assertEquals(Integer.valueOf(0), dto.getSeconds());
        assertEquals(Double.valueOf(0.0), dto.getWeight());
    }

    @Test
    public void testAllSetters() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto();
        dto.setIndex(3);
        dto.setReps(8);
        dto.setSeconds(20);
        dto.setWeight(100.0);

        assertEquals(Integer.valueOf(3), dto.getIndex());
        assertEquals(Integer.valueOf(8), dto.getReps());
        assertEquals(Integer.valueOf(20), dto.getSeconds());
        assertEquals(Double.valueOf(100.0), dto.getWeight());
    }

    @Test
    public void testMultipleUpdates() {
        ExerciseExecutionSetDto dto = new ExerciseExecutionSetDto(1, 10, 30, 50.0);
        
        dto.setReps(12);
        assertEquals(Integer.valueOf(12), dto.getReps());
        
        dto.setWeight(55.0);
        assertEquals(Double.valueOf(55.0), dto.getWeight());
        
        assertEquals(Integer.valueOf(1), dto.getIndex());
        assertEquals(Integer.valueOf(30), dto.getSeconds());
    }
}
