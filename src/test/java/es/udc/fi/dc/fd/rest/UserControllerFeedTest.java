package es.udc.fi.dc.fd.rest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.dto.FeedItemDto;

/**
 * Tests TDD para el endpoint de feed en UserController.
 * 
 * Endpoints a implementar:
 * - GET /api/users/feed?page=0&size=10 → lista paginada de FeedItemDto
 */
@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class UserControllerFeedTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private UserService userService;

    @MockBean
    private MessageSource messageSource;

    @MockBean
    private es.udc.fi.dc.fd.rest.common.JwtGenerator jwtGenerator;

    @MockBean
    private es.udc.fi.dc.fd.model.services.WrappedService wrappedService;

    // ========== Helpers ==========

    private FeedItemDto createFeedItem(Long id, String routineName, String authorUserName, String type) {
        FeedItemDto item = new FeedItemDto();
        item.setId(id);
        item.setRoutineId(100L);
        item.setRoutineName(routineName);
        item.setAuthorId(10L);
        item.setAuthorUserName(authorUserName);
        item.setPerformedAt(LocalDateTime.now());
        item.setType(type);
        item.setLikesCount(5);
        return item;
    }

    // ========== Tests ==========

    @Test
    @DisplayName("GET /api/users/feed -> 200 OK con lista vacía")
    void getFeed_emptyFeed_returnsEmptyPage() throws Exception {
        Page<FeedItemDto> emptyPage = Page.empty();
        when(userService.getFeed(eq(7L), eq(0), eq(10))).thenReturn(emptyPage);

        mvc.perform(get("/api/users/feed")
                .param("page", "0")
                .param("size", "10")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.content", hasSize(0)))
           .andExpect(jsonPath("$.totalElements", is(0)));
    }

    @Test
    @DisplayName("GET /api/users/feed -> 200 OK con items")
    void getFeed_withItems_returnsPageWithContent() throws Exception {
        List<FeedItemDto> items = List.of(
            createFeedItem(1L, "Rutina Fuerza", "trainer1", "EXECUTION"),
            createFeedItem(2L, "Rutina Cardio", "trainer2", "EXECUTION")
        );
        Page<FeedItemDto> page = new PageImpl<>(items, PageRequest.of(0, 10), 2);
        when(userService.getFeed(eq(7L), eq(0), eq(10))).thenReturn(page);

        mvc.perform(get("/api/users/feed")
                .param("page", "0")
                .param("size", "10")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.content", hasSize(2)))
           .andExpect(jsonPath("$.content[0].id", is(1)))
           .andExpect(jsonPath("$.content[0].routineName", is("Rutina Fuerza")))
           .andExpect(jsonPath("$.content[0].authorUserName", is("trainer1")))
           .andExpect(jsonPath("$.content[0].type", is("EXECUTION")))
           .andExpect(jsonPath("$.content[1].id", is(2)))
           .andExpect(jsonPath("$.totalElements", is(2)));
    }

    @Test
    @DisplayName("GET /api/users/feed -> paginación correcta (página 1)")
    void getFeed_page1_returnsSecondPage() throws Exception {
        List<FeedItemDto> items = List.of(
            createFeedItem(11L, "Rutina Extra", "trainer3", "EXECUTION")
        );
        Page<FeedItemDto> page = new PageImpl<>(items, PageRequest.of(1, 10), 11);
        when(userService.getFeed(eq(7L), eq(1), eq(10))).thenReturn(page);

        mvc.perform(get("/api/users/feed")
                .param("page", "1")
                .param("size", "10")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.content", hasSize(1)))
           .andExpect(jsonPath("$.content[0].id", is(11)))
           .andExpect(jsonPath("$.number", is(1)))
           .andExpect(jsonPath("$.totalElements", is(11)));
    }

    @Test
    @DisplayName("GET /api/users/feed -> parámetros por defecto (page=0, size=10)")
    void getFeed_defaultParams_usesDefaults() throws Exception {
        Page<FeedItemDto> emptyPage = Page.empty();
        when(userService.getFeed(eq(7L), eq(0), eq(10))).thenReturn(emptyPage);

        mvc.perform(get("/api/users/feed")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/users/feed -> 404 si usuario no encontrado")
    void getFeed_userNotFound_returns404() throws Exception {
        when(userService.getFeed(anyLong(), anyInt(), anyInt()))
            .thenThrow(new InstanceNotFoundException("User", 999L));
        when(messageSource.getMessage(anyString(), any(), anyString(), any(Locale.class)))
            .thenReturn("Usuario no encontrado");

        mvc.perform(get("/api/users/feed")
                .param("page", "0")
                .param("size", "10")
                .requestAttr("userId", 999L))
           .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/users/feed -> campos del FeedItemDto correctos")
    void getFeed_itemFields_areCorrect() throws Exception {
        FeedItemDto item = new FeedItemDto();
        item.setId(42L);
        item.setRoutineId(100L);
        item.setRoutineName("Mi Rutina");
        item.setAuthorId(5L);
        item.setAuthorUserName("entrenador");
        item.setPerformedAt(LocalDateTime.of(2025, 11, 30, 10, 0));
        item.setType("EXECUTION");
        item.setLikesCount(10);
        item.setCommentsCount(3);
        item.setTotalDurationSec(1800);

        Page<FeedItemDto> page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
        when(userService.getFeed(eq(7L), eq(0), eq(10))).thenReturn(page);

        mvc.perform(get("/api/users/feed")
                .param("page", "0")
                .param("size", "10")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.content[0].id", is(42)))
           .andExpect(jsonPath("$.content[0].routineId", is(100)))
           .andExpect(jsonPath("$.content[0].routineName", is("Mi Rutina")))
           .andExpect(jsonPath("$.content[0].authorId", is(5)))
           .andExpect(jsonPath("$.content[0].authorUserName", is("entrenador")))
           .andExpect(jsonPath("$.content[0].type", is("EXECUTION")))
           .andExpect(jsonPath("$.content[0].likesCount", is(10)))
           .andExpect(jsonPath("$.content[0].commentsCount", is(3)))
           .andExpect(jsonPath("$.content[0].totalDurationSec", is(1800)));
    }

    @Test
    @DisplayName("GET /api/users/feed -> tamaño de página personalizado")
    void getFeed_customSize_respectsSize() throws Exception {
        List<FeedItemDto> items = List.of(
            createFeedItem(1L, "R1", "t1", "EXECUTION"),
            createFeedItem(2L, "R2", "t2", "EXECUTION"),
            createFeedItem(3L, "R3", "t3", "EXECUTION"),
            createFeedItem(4L, "R4", "t4", "EXECUTION"),
            createFeedItem(5L, "R5", "t5", "EXECUTION")
        );
        Page<FeedItemDto> page = new PageImpl<>(items, PageRequest.of(0, 5), 20);
        when(userService.getFeed(eq(7L), eq(0), eq(5))).thenReturn(page);

        mvc.perform(get("/api/users/feed")
                .param("page", "0")
                .param("size", "5")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.content", hasSize(5)))
           .andExpect(jsonPath("$.size", is(5)))
           .andExpect(jsonPath("$.totalElements", is(20)))
           .andExpect(jsonPath("$.totalPages", is(4)));
    }
}
