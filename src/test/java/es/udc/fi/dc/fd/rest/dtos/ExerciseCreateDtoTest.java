package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.*;

public class ExerciseCreateDtoTest {

    @Test
    public void testNoArgConstructor() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        assertNotNull(dto);
        assertNull(dto.getName());
        assertNull(dto.getMaterial());
        assertNull(dto.getMuscles());
        assertNull(dto.getStatus());
        assertNull(dto.getImage());
        assertNull(dto.getDescription());
    }

    @Test
    public void testParameterizedConstructor() {
        String name = "Push Up";
        String material = "None";
        List<String> muscles = Arrays.asList("Chest", "Triceps");
        String image = "image.jpg";
        String description = "Basic push up exercise";

        ExerciseCreateDto dto = new ExerciseCreateDto(name, material, muscles, image, description);

        assertEquals(name, dto.getName());
        assertEquals(material, dto.getMaterial());
        assertEquals(muscles, dto.getMuscles());
        assertEquals(image, dto.getImage());
        assertEquals(description, dto.getDescription());
    }

    @Test
    public void testConstructorTrimming() {
        ExerciseCreateDto dto = new ExerciseCreateDto("  Bench Press  ", "  Barbell  ", 
                Arrays.asList("Chest"), "  image.png  ", "  Description  ");

        assertEquals("Bench Press", dto.getName());
        assertEquals("Barbell", dto.getMaterial());
        assertEquals("image.png", dto.getImage());
        assertEquals("Description", dto.getDescription());
    }

    @Test
    public void testConstructorWithNullValues() {
        ExerciseCreateDto dto = new ExerciseCreateDto(null, null, null, null, null);

        assertNull(dto.getName());
        assertNull(dto.getMaterial());
        assertNull(dto.getMuscles());
        assertEquals("", dto.getImage());
        assertEquals("", dto.getDescription());
    }

    @Test
    public void testSetName() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("  Squat  ");

        assertEquals("Squat", dto.getName());
    }

    @Test
    public void testSetMaterial() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setMaterial("  Dumbbells  ");

        assertEquals("Dumbbells", dto.getMaterial());
    }

    @Test
    public void testSetMaterialToNull() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setMaterial(null);

        assertNull(dto.getMaterial());
    }

    @Test
    public void testSetStatus() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setStatus(ExerciseStatus.APPROVED);

        assertEquals(ExerciseStatus.APPROVED, dto.getStatus());
    }

    @Test
    public void testSetMuscles() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        List<String> muscles = Arrays.asList("Quadriceps", "Hamstrings");
        dto.setMuscles(muscles);

        assertEquals(muscles, dto.getMuscles());
    }

    @Test
    public void testSetImage() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setImage("workout.png");

        assertEquals("workout.png", dto.getImage());
    }

    @Test
    public void testSetDescription() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setDescription("Advanced exercise");

        assertEquals("Advanced exercise", dto.getDescription());
    }

    @Test
    public void testSetEmptyMuscles() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setMuscles(Collections.emptyList());

        assertNotNull(dto.getMuscles());
        assertTrue(dto.getMuscles().isEmpty());
    }

    @Test
    public void testAllGettersAfterSetters() {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Deadlift");
        dto.setMaterial("Barbell");
        dto.setStatus(ExerciseStatus.PENDING);
        dto.setMuscles(Arrays.asList("Back", "Legs"));
        dto.setImage("deadlift.jpg");
        dto.setDescription("Compound movement");

        assertEquals("Deadlift", dto.getName());
        assertEquals("Barbell", dto.getMaterial());
        assertEquals(ExerciseStatus.PENDING, dto.getStatus());
        assertEquals(2, dto.getMuscles().size());
        assertEquals("deadlift.jpg", dto.getImage());
        assertEquals("Compound movement", dto.getDescription());
    }
}
