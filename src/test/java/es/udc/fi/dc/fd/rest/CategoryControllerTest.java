package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.services.CategoryService;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.controllers.CategoryController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Locale;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class CategoryControllerTest {

    @Autowired private MockMvc mvc;

    @MockBean private CategoryService categoryService;
    @MockBean private JwtGenerator jwtGenerator;
    @MockBean private MessageSource messageSource;

    @BeforeEach
    void setup() {
        when(messageSource.getMessage(
            ArgumentMatchers.anyString(),
            ArgumentMatchers.isNull(),
            ArgumentMatchers.anyString(),
            ArgumentMatchers.any(Locale.class)))
            .thenAnswer(inv -> inv.getArgument(2));
    }

    private Category category(Long id, String name) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        return c;
    }

    // ========= FIND ALL CATEGORIES =========

    @Test
    @DisplayName("GET /api/categories -> 200 OK (findAll)")
    void findAll_ok() throws Exception {
        when(categoryService.findAll()).thenReturn(List.of(category(1L, "Fuerza"), category(2L, "Cardio")));

        mvc.perform(get("/api/categories"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", hasSize(2)))
           .andExpect(jsonPath("$[0].name").value("Fuerza"))
           .andExpect(jsonPath("$[1].name").value("Cardio"));
    }

}
