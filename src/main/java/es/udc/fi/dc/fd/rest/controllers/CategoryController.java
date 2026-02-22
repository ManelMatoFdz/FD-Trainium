package es.udc.fi.dc.fd.rest.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.services.CategoryService;
import static es.udc.fi.dc.fd.rest.dtos.CategoryConversor.toCategoryDtos;
import es.udc.fi.dc.fd.rest.dtos.CategoryDto;

/**
 * Controlador REST para la gestión de categorías.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Devuelve todas las categorías existentes.
     *
     * @return lista de categorías
     */
    @GetMapping
    public List<CategoryDto> findAll() {
        List<Category> categories = categoryService.findAll();
        return toCategoryDtos(categories);
    }
}
