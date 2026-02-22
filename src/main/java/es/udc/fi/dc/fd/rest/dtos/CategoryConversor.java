package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Category;

public class CategoryConversor {

    private CategoryConversor() {}

    public static CategoryDto toCategoryDto(Category category) {
        return new CategoryDto(category.getId(), category.getName());
    }

    public static List<CategoryDto> toCategoryDtos(List<Category> categories) {
        return categories.stream()
                .map(CategoryConversor::toCategoryDto)
                .collect(Collectors.toList());
    }
}
