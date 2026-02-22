package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import static org.junit.Assert.*;

public class UpdateExerciseImageDtoTest {

    @Test
    public void testNoArgConstructor() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        assertNotNull(dto);
        assertNull(dto.getBase64Image());
        assertNull(dto.getImageMimeType());
    }

    @Test
    public void testGetBase64Image() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        String base64 = "iVBORw0KGgoAAAANSUhEUgAAAAUA";
        dto.setBase64Image(base64);

        assertEquals(base64, dto.getBase64Image());
    }

    @Test
    public void testSetBase64Image() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        String base64 = "base64EncodedStringHere";
        dto.setBase64Image(base64);

        assertEquals(base64, dto.getBase64Image());
    }

    @Test
    public void testGetImageMimeType() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        String mimeType = "image/png";
        dto.setImageMimeType(mimeType);

        assertEquals(mimeType, dto.getImageMimeType());
    }

    @Test
    public void testSetImageMimeType() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        String mimeType = "image/jpeg";
        dto.setImageMimeType(mimeType);

        assertEquals(mimeType, dto.getImageMimeType());
    }

    @Test
    public void testSetBase64ImageToNull() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        dto.setBase64Image("someValue");
        dto.setBase64Image(null);

        assertNull(dto.getBase64Image());
    }

    @Test
    public void testSetImageMimeTypeToNull() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        dto.setImageMimeType("image/png");
        dto.setImageMimeType(null);

        assertNull(dto.getImageMimeType());
    }

    @Test
    public void testBothFieldsSet() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        String base64 = "base64DataString";
        String mimeType = "image/webp";
        
        dto.setBase64Image(base64);
        dto.setImageMimeType(mimeType);

        assertEquals(base64, dto.getBase64Image());
        assertEquals(mimeType, dto.getImageMimeType());
    }

    @Test
    public void testLongBase64String() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        StringBuilder longBase64 = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            longBase64.append("A");
        }
        String base64 = longBase64.toString();
        
        dto.setBase64Image(base64);

        assertEquals(1000, dto.getBase64Image().length());
        assertEquals(base64, dto.getBase64Image());
    }

    @Test
    public void testDifferentMimeTypes() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        
        dto.setImageMimeType("image/png");
        assertEquals("image/png", dto.getImageMimeType());
        
        dto.setImageMimeType("image/jpeg");
        assertEquals("image/jpeg", dto.getImageMimeType());
        
        dto.setImageMimeType("image/gif");
        assertEquals("image/gif", dto.getImageMimeType());
    }

    @Test
    public void testEmptyStrings() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        dto.setBase64Image("");
        dto.setImageMimeType("");

        assertEquals("", dto.getBase64Image());
        assertEquals("", dto.getImageMimeType());
    }

    @Test
    public void testMultipleUpdates() {
        UpdateExerciseImageDto dto = new UpdateExerciseImageDto();
        
        dto.setBase64Image("first");
        assertEquals("first", dto.getBase64Image());
        
        dto.setBase64Image("second");
        assertEquals("second", dto.getBase64Image());
        
        dto.setImageMimeType("image/png");
        assertEquals("image/png", dto.getImageMimeType());
        
        dto.setImageMimeType("image/jpeg");
        assertEquals("image/jpeg", dto.getImageMimeType());
    }
}
