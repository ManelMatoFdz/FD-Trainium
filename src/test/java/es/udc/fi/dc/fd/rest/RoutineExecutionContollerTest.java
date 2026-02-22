package es.udc.fi.dc.fd.rest;

import java.util.List;
import java.util.Locale;

import static org.hamcrest.Matchers.startsWith;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionComment;
import es.udc.fi.dc.fd.model.services.RoutineExecutionService;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyNotLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.controllers.RoutineExecutionController;

@WebMvcTest(controllers = RoutineExecutionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class RoutineExecutionContollerTest {

    @Autowired private MockMvc mvc;

    @MockBean private RoutineExecutionService routineExecutionService;
    @MockBean private MessageSource messageSource;
    @MockBean private es.udc.fi.dc.fd.rest.common.JwtGenerator jwtGenerator; 



    private RoutineExecution realExec() {
        RoutineExecution re = new RoutineExecution();
        // Crea y asigna Routine
        es.udc.fi.dc.fd.model.entities.Routine routine = new es.udc.fi.dc.fd.model.entities.Routine();
        routine.setId(10L);
        routine.setName("Test Routine");
        re.setRoutine(routine);

        // Establecer ID de la ejecución (requerido para el conversor)
        re.setId(100L);
        re.setExerciseExecutions(java.util.Collections.emptyList());
        return re;
    }

    private RoutineExecutionComment realComment() {
        RoutineExecutionComment c = new RoutineExecutionComment();
        c.setId(200L);
        es.udc.fi.dc.fd.model.entities.Users u = new es.udc.fi.dc.fd.model.entities.Users();
        u.setId(7L);
        u.setUserName("alice");
        c.setUser(u);
        c.setText("Comentario demo");
        RoutineExecution re = realExec();
        c.setRoutineExecution(re);
        return c;
    }
    @Test
    @DisplayName("POST /api/routine-executions/{id}/like -> 200 OK")
    void likeRoutineExecution_ok() throws Exception {
        when(routineExecutionService.likeRoutineExecution(7L, 100L)).thenReturn(realExec());

        mvc.perform(post("/api/routine-executions/{executionId}/like", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("POST /api/routine-executions/{id}/like -> 400 si AlreadyLikedException")
    void likeRoutineExecution_alreadyLiked() throws Exception {
        when(routineExecutionService.likeRoutineExecution(7L, 100L)).thenThrow(new AlreadyLikedException());

        mvc.perform(post("/api/routine-executions/{executionId}/like", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/routine-executions/{id}/like -> 200 OK")
    void unlikeRoutineExecution_ok() throws Exception {
        when(routineExecutionService.unlikeRoutineExecution(7L, 100L)).thenReturn(realExec());

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/routine-executions/{executionId}/like", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routine-executions/{id}/like -> 400 si AlreadyNotLikedException")
    void unlikeRoutineExecution_notLiked() throws Exception {
        when(routineExecutionService.unlikeRoutineExecution(7L, 100L)).thenThrow(new AlreadyNotLikedException());

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/routine-executions/{executionId}/like", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isBadRequest());
    }
    @Test
    @DisplayName("POST /api/routine-executions -> 201 Created")
    void registerRoutineExecution_created() throws Exception {
        when(routineExecutionService.registerRoutineExecution(eq(7L), eq(10L), anyList(), any(), any(), any()))
            .thenReturn(realExec()); 

        var body = """
          {
            "routineId": 10,
            "exercises": []
          }
        """;

        mvc.perform(post("/api/routine-executions")
                .requestAttr("userId", 7L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
           .andExpect(status().isCreated())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("POST /api/routine-executions -> 403 si PermissionException")
    void registerRoutineExecution_forbidden() throws Exception {
        when(routineExecutionService.registerRoutineExecution(anyLong(), anyLong(), anyList(), any(), any(), any()))
            .thenThrow(new PermissionException());
        when(messageSource.getMessage(eq("project.exceptions.PermissionException"), any(), anyString(), any(Locale.class)))
            .thenReturn("forbidden");

        var body = """
          {"routineId": 10, "exercises": []}
        """;

        mvc.perform(post("/api/routine-executions")
                .requestAttr("userId", 7L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
           .andExpect(status().isForbidden())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/routine-executions/user -> 200 OK (lista del usuario)")
    void findRoutineExecutionsByUser_ok() throws Exception {
        when(routineExecutionService.findRoutineExecutionsByUser(7L))
            .thenReturn(List.of(realExec(), realExec()));

        mvc.perform(get("/api/routine-executions/user")
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string(startsWith("["))); // devuelve array
    }

    @Test
    @DisplayName("GET /api/routine-executions/user -> 404 si InstanceNotFoundException")
    void findRoutineExecutionsByUser_notFound() throws Exception {
        when(routineExecutionService.findRoutineExecutionsByUser(7L))
            .thenThrow(new InstanceNotFoundException("Users", 7L));
        when(messageSource.getMessage(eq("project.exceptions.InstanceNotFoundException"), any(), anyString(), any(Locale.class)))
            .thenReturn("not-found");

        mvc.perform(get("/api/routine-executions/user")
                .requestAttr("userId", 7L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/routine-executions/{id} -> 200 OK (detalles)")
    void getRoutineExecutionDetails_ok() throws Exception {
        when(routineExecutionService.getRoutineExecutionDetails(7L, 100L))
            .thenReturn(realExec());

        mvc.perform(get("/api/routine-executions/{executionId}", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/routine-executions/{id} -> 403 si PermissionException")
    void getRoutineExecutionDetails_forbidden() throws Exception {
        when(routineExecutionService.getRoutineExecutionDetails(7L, 100L))
            .thenThrow(new PermissionException());
        when(messageSource.getMessage(eq("project.exceptions.PermissionException"), any(), anyString(), any(Locale.class)))
            .thenReturn("forbidden");

        mvc.perform(get("/api/routine-executions/{executionId}", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/routine-executions/{id} -> 404 si InstanceNotFoundException")
    void getRoutineExecutionDetails_notFound() throws Exception {
        when(routineExecutionService.getRoutineExecutionDetails(7L, 100L))
            .thenThrow(new InstanceNotFoundException("RoutineExecution", 100L));
        when(messageSource.getMessage(eq("project.exceptions.InstanceNotFoundException"), any(), anyString(), any(Locale.class)))
            .thenReturn("not-found");

        mvc.perform(get("/api/routine-executions/{executionId}", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/routine-executions/user/{id} -> 200 OK (historial público)")
    void findRoutineExecutionsByUserId_ok() throws Exception {
        when(routineExecutionService.findRoutineExecutionsByUser(9L))
            .thenReturn(List.of(realExec()));

        mvc.perform(get("/api/routine-executions/user/{id}", 9L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string(startsWith("[")));
    }

    @Test
    @DisplayName("GET /api/routine-executions/public/{id} -> 200 OK (detalles públicos)")
    void getRoutineExecutionDetailsPublic_ok() throws Exception {
        when(routineExecutionService.getRoutineExecutionDetailsPublic(100L))
            .thenReturn(realExec());

        mvc.perform(get("/api/routine-executions/public/{executionId}", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/routine-executions/{id}/likes -> 200 OK (likers)")
    void getLikers_ok() throws Exception {
        when(routineExecutionService.getRoutineExecutionLikers(7L, 100L))
            .thenReturn(List.of("alice", "bob"));

        mvc.perform(get("/api/routine-executions/{executionId}/likes", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string(startsWith("[")));
    }

    // ========= COMMENTS (fallarán hasta implementar) =========

    @Test
    @DisplayName("GET /api/routine-executions/{id}/comments -> 200 OK")
    void getComments_ok() throws Exception {
        when(routineExecutionService.findComments(100L))
            .thenReturn(List.of(realComment()));

        mvc.perform(get("/api/routine-executions/{executionId}/comments", 100L)
                .requestAttr("userId", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(content().string(startsWith("[")));
    }

    @Test
    @DisplayName("POST /api/routine-executions/{id}/comments -> 201 Created")
    void addComment_ok() throws Exception {
        when(routineExecutionService.addComment(7L, 100L, "Hola"))
            .thenReturn(realComment());

        mvc.perform(post("/api/routine-executions/{executionId}/comments", 100L)
                .requestAttr("userId", 7L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"text\":\"Hola\"}"))
           .andExpect(status().isCreated())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("PUT /api/routine-executions/comments/{commentId} -> 200 OK (update propio)")
    void updateComment_ok() throws Exception {
        when(routineExecutionService.updateComment(7L, 200L, "Editado"))
            .thenReturn(realComment());

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/routine-executions/comments/{commentId}", 200L)
                .requestAttr("userId", 7L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"text\":\"Editado\"}"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routine-executions/comments/{commentId} -> 204 No Content")
    void deleteComment_ok() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/routine-executions/comments/{commentId}", 200L)
                .requestAttr("userId", 7L))
           .andExpect(status().isNoContent());
    }
}
