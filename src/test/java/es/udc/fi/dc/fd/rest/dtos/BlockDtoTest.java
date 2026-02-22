package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class BlockDtoTest {

    @Test
    public void testNoArgConstructor() {
        BlockDto<String> block = new BlockDto<>();
        assertNotNull(block);
        assertNull(block.getItems());
        assertFalse(block.getExistMoreItems());
    }

    @Test
    public void testParameterizedConstructor() {
        List<String> items = Arrays.asList("item1", "item2", "item3");
        boolean existMoreItems = true;

        BlockDto<String> block = new BlockDto<>(items, existMoreItems);

        assertEquals(items, block.getItems());
        assertTrue(block.getExistMoreItems());
    }

    @Test
    public void testSettersAndGetters() {
        BlockDto<Integer> block = new BlockDto<>();
        List<Integer> items = Arrays.asList(1, 2, 3, 4, 5);

        block.setItems(items);
        block.setExistMoreItems(true);

        assertEquals(items, block.getItems());
        assertTrue(block.getExistMoreItems());
    }

    @Test
    public void testWithNullItems() {
        BlockDto<String> block = new BlockDto<>(null, false);

        assertNull(block.getItems());
        assertFalse(block.getExistMoreItems());
    }

    @Test
    public void testWithEmptyList() {
        List<String> emptyList = new ArrayList<>();
        BlockDto<String> block = new BlockDto<>(emptyList, false);

        assertNotNull(block.getItems());
        assertTrue(block.getItems().isEmpty());
        assertFalse(block.getExistMoreItems());
    }

    @Test
    public void testExistMoreItemsFalse() {
        List<String> items = Arrays.asList("single");
        BlockDto<String> block = new BlockDto<>(items, false);

        assertFalse(block.getExistMoreItems());
    }

    @Test
    public void testExistMoreItemsTrue() {
        List<String> items = Arrays.asList("item1", "item2");
        BlockDto<String> block = new BlockDto<>(items, true);

        assertTrue(block.getExistMoreItems());
    }

    @Test
    public void testSetExistMoreItemsToFalse() {
        BlockDto<String> block = new BlockDto<>();
        block.setExistMoreItems(false);

        assertFalse(block.getExistMoreItems());
    }

    @Test
    public void testGenericTypeInteger() {
        List<Integer> items = Arrays.asList(10, 20, 30);
        BlockDto<Integer> block = new BlockDto<>(items, true);

        assertEquals(3, block.getItems().size());
        assertEquals(Integer.valueOf(10), block.getItems().get(0));
    }

    @Test
    public void testGenericTypeCustomObject() {
        CategoryDto cat1 = new CategoryDto(1L, "Category1");
        CategoryDto cat2 = new CategoryDto(2L, "Category2");
        List<CategoryDto> items = Arrays.asList(cat1, cat2);

        BlockDto<CategoryDto> block = new BlockDto<>(items, false);

        assertEquals(2, block.getItems().size());
        assertEquals("Category1", block.getItems().get(0).getName());
    }
}
