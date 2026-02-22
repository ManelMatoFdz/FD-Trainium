package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.controllers.NotificationController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Locale;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class NotificationControllerTest {

    @Autowired private MockMvc mvc;
    @MockBean private NotificationService notificationService;
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

    // ========= LISTAR NOTIFICACIONES =========

    @Test
    @DisplayName("GET /api/users/{userId}/notifications -> 200 OK (list)")
    void list_ok() throws Exception {
        when(notificationService.getUserNotifications(1L)).thenReturn(List.of());

        mvc.perform(get("/api/users/{userId}/notifications", 1L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", hasSize(0)));
    }
    
    @Test
    @DisplayName("GET /api/users/{userId}/notifications -> 403 Forbidden")
    void list_forbidden() throws Exception {
        when(notificationService.getUserNotifications(2L))
            .thenThrow(new PermissionException());

        mvc.perform(get("/api/users/{userId}/notifications", 2L))
           .andExpect(status().isForbidden())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= CONTAR NO LEÍDAS =========

    @Test
    @DisplayName("GET /api/users/{userId}/notifications/unread/count -> 200 OK")
    void unreadCount_ok() throws Exception {
        when(notificationService.countUnreadNotifications(1L)).thenReturn(5L);

        mvc.perform(get("/api/users/{userId}/notifications/unread/count", 1L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string("5"));
    }


    // ========= MARCAR TODAS COMO LEÍDAS =========

    @Test
    @DisplayName("POST /api/users/{userId}/notifications/mark-all-read -> 200 OK")
    void markAllAsRead_ok() throws Exception {
        when(notificationService.markAllAsRead(1L)).thenReturn(3);

        mvc.perform(post("/api/users/{userId}/notifications/mark-all-read", 1L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string("3"));
    }

    @Test
    @DisplayName("POST /api/users/{userId}/notifications/mark-all-read -> 403 Forbidden")
    void markAllAsRead_forbidden() throws Exception {
        when(notificationService.markAllAsRead(1L))
            .thenThrow(new PermissionException());

        mvc.perform(post("/api/users/{userId}/notifications/mark-all-read", 1L))
           .andExpect(status().isForbidden())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= BORRAR TODAS =========

    @Test
    @DisplayName("DELETE /api/users/{userId}/notifications -> 204 No Content")
    void deleteAll_ok() throws Exception {
        when(notificationService.deleteAllByUser(1L)).thenReturn(1); // o el valor que quieras

        mvc.perform(delete("/api/users/{userId}/notifications", 1L))
           .andExpect(status().isNoContent());
    }

    // ========= MARCAR UNA COMO LEÍDA =========

    @Test
    @DisplayName("POST /api/users/{userId}/notifications/{notificationId}/mark-read -> 200 OK")
    void markAsRead_ok() throws Exception {
        when(notificationService.markAsRead(1L, 5L)).thenReturn(1);

        mvc.perform(post("/api/users/{userId}/notifications/{notificationId}/mark-read", 1L, 5L))
           .andExpect(status().isOk())
           .andExpect(content().string("1"));
    }

}
