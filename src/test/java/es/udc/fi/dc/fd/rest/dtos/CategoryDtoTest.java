package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import static org.junit.Assert.*;

public class CategoryDtoTest {

    @Test
    public void testNoArgConstructor() {
        CategoryDto dto = new CategoryDto();
        assertNotNull(dto);
        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    public void testParameterizedConstructor() {
        Long id = 1L;
        String name = "Cardio";

        CategoryDto dto = new CategoryDto(id, name);

        assertEquals(id, dto.getId());
        assertEquals(name, dto.getName());
    }

    @Test
    public void testSetId() {
        CategoryDto dto = new CategoryDto();
        Long id = 42L;

        dto.setId(id);

        assertEquals(id, dto.getId());
    }

    @Test
    public void testSetName() {
        CategoryDto dto = new CategoryDto();
        String name = "Strength";

        dto.setName(name);

        assertEquals(name, dto.getName());
    }

    @Test
    public void testSetIdToNull() {
        CategoryDto dto = new CategoryDto(1L, "Test");
        dto.setId(null);

        assertNull(dto.getId());
    }

    @Test
    public void testSetNameToNull() {
        CategoryDto dto = new CategoryDto(1L, "Test");
        dto.setName(null);

        assertNull(dto.getName());
    }

    @Test
    public void testConstructorWithNullValues() {
        CategoryDto dto = new CategoryDto(null, null);

        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    public void testGettersAfterConstruction() {
        Long id = 99L;
        String name = "Flexibility";
        CategoryDto dto = new CategoryDto(id, name);

        assertEquals(id, dto.getId());
        assertEquals(name, dto.getName());
    }

    @Test
    public void testMultipleSetters() {
        CategoryDto dto = new CategoryDto();
        
        dto.setId(1L);
        assertEquals(Long.valueOf(1L), dto.getId());
        
        dto.setId(2L);
        assertEquals(Long.valueOf(2L), dto.getId());
        
        dto.setName("First");
        assertEquals("First", dto.getName());
        
        dto.setName("Second");
        assertEquals("Second", dto.getName());
    }
}
