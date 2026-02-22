package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.entities.CategoryDao;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryDao categoryDao;

    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        // Limpiar en el orden correcto para evitar violaciones de FK
        // Primero las rutinas que referencian categorías
        entityManager.createQuery("DELETE FROM RoutineExercise").executeUpdate();
        entityManager.createQuery("DELETE FROM Routine").executeUpdate();
        entityManager.flush();
        categoryDao.deleteAll();
    }

    @Test
    void testFindAll_Empty() {
        List<Category> all = categoryService.findAll();
        assertNotNull(all);
        assertTrue(all.isEmpty(), "Debe ser vacío cuando no hay categorías");
    }

    @Test
    void testFindAll_WithData() {
        String n1 = "Fuerza_" + System.nanoTime();
        String n2 = "Cardio_" + System.nanoTime();
        Category c1 = new Category(n1);
        Category c2 = new Category(n2);
        categoryDao.saveAll(List.of(c1, c2));

        List<Category> all = categoryService.findAll();
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(c -> n1.equals(c.getName())));
        assertTrue(all.stream().anyMatch(c -> n2.equals(c.getName())));
    }
}
