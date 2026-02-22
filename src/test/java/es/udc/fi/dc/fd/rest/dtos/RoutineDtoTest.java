package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.*;

public class RoutineDtoTest {

    @Test
    public void testNoArgConstructor() {
        RoutineDto dto = new RoutineDto();
        assertNotNull(dto);
        assertNull(dto.getId());
        assertNull(dto.getName());
        assertNull(dto.getLevel());
        assertNull(dto.getDescription());
        assertNull(dto.getMaterials());
        assertNull(dto.getExercises());
        assertNull(dto.getCategoryName());
        assertNull(dto.getCategory());
        assertNull(dto.getUserId());
        assertNull(dto.getUserName());
        assertNull(dto.isOpenPublic());
    }

    @Test
    public void testParameterizedConstructor() {
        String name = "Full Body Workout";
        String level = "Intermediate";
        String description = "Complete workout";
        String materials = "Dumbbells, Bench";
        List<Long> exercises = Arrays.asList(1L, 2L, 3L);
        String categoryName = "Strength";
        Long categoryId = 10L;
        Long userId = 100L;
        String userName = "John Doe";
        Boolean openPublic = true;

        RoutineDto dto = new RoutineDto(name, level, description, materials, exercises, 
                                        categoryName, categoryId, userId, userName, openPublic);

        assertEquals(name, dto.getName());
        assertEquals(level, dto.getLevel());
        assertEquals(description, dto.getDescription());
        assertEquals(materials, dto.getMaterials());
        assertEquals(exercises, dto.getExercises());
        assertEquals(categoryName, dto.getCategoryName());
        assertEquals(categoryId, dto.getCategory());
        assertEquals(userId, dto.getUserId());
        assertEquals(userName, dto.getUserName());
        assertEquals(openPublic, dto.isOpenPublic());
    }

    @Test
    public void testConstructorTrimming() {
        RoutineDto dto = new RoutineDto("  Routine Name  ", "  Advanced  ", "  Desc  ", 
                                        "  Materials  ", Collections.emptyList(), 
                                        "  Category  ", 1L, 2L, "  User  ", false);

        assertEquals("Routine Name", dto.getName());
        assertEquals("Advanced", dto.getLevel());
        assertEquals("Desc", dto.getDescription());
        assertEquals("Materials", dto.getMaterials());
        assertEquals("Category", dto.getCategoryName());
        assertEquals("User", dto.getUserName());
    }

    @Test
    public void testConstructorWithNullStrings() {
        RoutineDto dto = new RoutineDto(null, null, null, null, null, null, null, null, null, true);

        assertNull(dto.getName());
        assertNull(dto.getLevel());
        assertNull(dto.getDescription());
        assertNull(dto.getMaterials());
        assertNull(dto.getCategoryName());
        assertNull(dto.getUserName());
        assertTrue(dto.isOpenPublic());
    }

    @Test
    public void testSetId() {
        RoutineDto dto = new RoutineDto();
        dto.setId(99L);

        assertEquals(Long.valueOf(99L), dto.getId());
    }

    @Test
    public void testSetName() {
        RoutineDto dto = new RoutineDto();
        dto.setName("  Upper Body  ");

        assertEquals("Upper Body", dto.getName());
    }

    @Test
    public void testSetLevel() {
        RoutineDto dto = new RoutineDto();
        dto.setLevel("  Beginner  ");

        assertEquals("Beginner", dto.getLevel());
    }

    @Test
    public void testSetDescription() {
        RoutineDto dto = new RoutineDto();
        dto.setDescription("  New description  ");

        assertEquals("New description", dto.getDescription());
    }

    @Test
    public void testSetDescriptionToNull() {
        RoutineDto dto = new RoutineDto();
        dto.setDescription(null);

        assertNull(dto.getDescription());
    }

    @Test
    public void testSetMaterials() {
        RoutineDto dto = new RoutineDto();
        dto.setMaterials("  Barbell, Plates  ");

        assertEquals("Barbell, Plates", dto.getMaterials());
    }

    @Test
    public void testSetMaterialsToNull() {
        RoutineDto dto = new RoutineDto();
        dto.setMaterials(null);

        assertNull(dto.getMaterials());
    }

    @Test
    public void testSetExercises() {
        RoutineDto dto = new RoutineDto();
        List<Long> exercises = Arrays.asList(5L, 10L, 15L);
        dto.setExercises(exercises);

        assertEquals(exercises, dto.getExercises());
        assertEquals(3, dto.getExercises().size());
    }

    @Test
    public void testSetCategoryName() {
        RoutineDto dto = new RoutineDto();
        dto.setCategoryName("  Cardio  ");

        assertEquals("Cardio", dto.getCategoryName());
    }

    @Test
    public void testSetCategoryNameToNull() {
        RoutineDto dto = new RoutineDto();
        dto.setCategoryName(null);

        assertNull(dto.getCategoryName());
    }

    @Test
    public void testSetCategory() {
        RoutineDto dto = new RoutineDto();
        dto.setCategory(42L);

        assertEquals(Long.valueOf(42L), dto.getCategory());
    }

    @Test
    public void testSetUserId() {
        RoutineDto dto = new RoutineDto();
        dto.setUserId(123L);

        assertEquals(Long.valueOf(123L), dto.getUserId());
    }

    @Test
    public void testSetUserName() {
        RoutineDto dto = new RoutineDto();
        dto.setUserName("  Jane Smith  ");

        assertEquals("Jane Smith", dto.getUserName());
    }

    @Test
    public void testSetUserNameToNull() {
        RoutineDto dto = new RoutineDto();
        dto.setUserName(null);

        assertNull(dto.getUserName());
    }

    @Test
    public void testSetOpenPublic() {
        RoutineDto dto = new RoutineDto();
        dto.setOpenPublic(false);

        assertFalse(dto.isOpenPublic());
        
        dto.setOpenPublic(true);
        assertTrue(dto.isOpenPublic());
    }

    @Test
    public void testEmptyExercisesList() {
        RoutineDto dto = new RoutineDto();
        dto.setExercises(Collections.emptyList());

        assertNotNull(dto.getExercises());
        assertTrue(dto.getExercises().isEmpty());
    }

    @Test
    public void testAllGettersAndSetters() {
        RoutineDto dto = new RoutineDto();
        dto.setId(1L);
        dto.setName("Test Routine");
        dto.setLevel("Expert");
        dto.setDescription("Test Description");
        dto.setMaterials("Test Materials");
        dto.setExercises(Arrays.asList(1L, 2L));
        dto.setCategoryName("Test Category");
        dto.setCategory(5L);
        dto.setUserId(10L);
        dto.setUserName("Test User");
        dto.setOpenPublic(true);

        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals("Test Routine", dto.getName());
        assertEquals("Expert", dto.getLevel());
        assertEquals("Test Description", dto.getDescription());
        assertEquals("Test Materials", dto.getMaterials());
        assertEquals(2, dto.getExercises().size());
        assertEquals("Test Category", dto.getCategoryName());
        assertEquals(Long.valueOf(5L), dto.getCategory());
        assertEquals(Long.valueOf(10L), dto.getUserId());
        assertEquals("Test User", dto.getUserName());
        assertTrue(dto.isOpenPublic());
    }
}
