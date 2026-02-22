package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.ExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.controllers.ExerciseController;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.dtos.ExerciseCreateDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseUpdateDto;
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
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import java.util.List;
import java.util.Locale;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ExerciseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class ExerciseControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper om;

    @MockBean private ExerciseService exerciseService;
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

    private Exercise exercise(Long id, String name) {
        Exercise e = new Exercise();
        e.setId(id);
        e.setName(name);
        e.setMuscles(java.util.Collections.emptySet());
        e.setType(ExerciseType.REPS);
        return e;
    }

    // ========= CREATE EXERCISE =========

    @Test
    @DisplayName("POST /api/exercises -> 201 Created")
    void createExercise_ok() throws Exception {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Press banca");
        dto.setMaterial("Barra");
        dto.setMuscles(List.of("CHEST"));
        dto.setImage("img.png");
        dto.setDescription("Ejercicio de pecho");
        dto.setType(ExerciseType.CARDIO);

        Exercise ex = exercise(10L, "Press banca");
        ex.setType(ExerciseType.CARDIO);
        when(exerciseService.createExercise(anyLong(), any(), any(), anySet(), any(), any(), any()))
                .thenReturn(ex);

        mvc.perform(post("/api/exercises")
                .requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(dto)))
           .andExpect(status().isCreated())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.type").value("CARDIO"));
    }

    @Test
    @DisplayName("POST /api/exercises -> 403 Forbidden")
    void createExercise_forbidden() throws Exception {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Press banca");
        dto.setMaterial("Barra");
        dto.setMuscles(List.of("CHEST"));
        dto.setImage("img.png");
        dto.setDescription("Ejercicio de pecho");

        when(exerciseService.createExercise(anyLong(), any(), any(), anySet(), any(), any(), any()))
                .thenThrow(new PermissionException());

        mvc.perform(post("/api/exercises")
                .requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(dto)))
           .andExpect(status().isForbidden())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= FIND EXERCISES =========

    @Test
    @DisplayName("GET /api/exercises -> 200 OK")
    void findExercises_ok() throws Exception {
        Block<Exercise> block = new Block<>(List.of(exercise(1L, "Press banca")), false);
        when(exerciseService.findExercises(anyLong(), any(), any(), anySet(), anyInt(), anyInt()))
                .thenReturn(block);

        mvc.perform(get("/api/exercises")
                .requestAttr("userId", 1L)
                .param("name", "Press")
                .param("material", "Barra")
                .param("muscleGroups", "CHEST")
                .param("page", "0"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.items", hasSize(1)))
           .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    @Test
    @DisplayName("GET /api/exercises/executed -> 200 OK")
    void findExecutedExercises_ok() throws Exception {
        when(exerciseService.findUserPerformedExercises(anyLong()))
                .thenReturn(List.of(exercise(1L, "Press banca")));

        mvc.perform(get("/api/exercises/executed")
                .requestAttr("userId", 1L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", hasSize(1)))
           .andExpect(jsonPath("$[0].name").value("Press banca"));
    }

    @Test
    @DisplayName("GET /api/exercises/executed -> 404 Not Found")
    void findExecutedExercises_notFound() throws Exception {
        when(exerciseService.findUserPerformedExercises(anyLong()))
                .thenThrow(new InstanceNotFoundException("User", 99L));

        mvc.perform(get("/api/exercises/executed")
                .requestAttr("userId", 99L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/exercises/pending -> 200 OK")
    void findExercisesPending_ok() throws Exception {
        Block<Exercise> block = new Block<>(List.of(exercise(2L, "Dominadas")), false);
        when(exerciseService.findExercisesPending(anyLong(), any(), any(), anySet(), anyInt(), anyInt()))
                .thenReturn(block);

        mvc.perform(get("/api/exercises/pending")
                .requestAttr("userId", 1L)
                .param("name", "Dominadas")
                .param("material", "Barra")
                .param("muscleGroups", "BACK")
                .param("page", "0"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.items", hasSize(1)))
           .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    // ========= GET EXERCISE BY ID =========

    @Test
    @DisplayName("GET /api/exercises/{id} -> 200 OK")
    void getExercise_ok() throws Exception {
        Exercise ex = exercise(5L, "Sentadilla");
        when(exerciseService.getExercise(1L, 5L)).thenReturn(ex);

        mvc.perform(get("/api/exercises/{id}", 5L).requestAttr("userId", 1L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/exercises/{id} -> 404 Not Found")
    void getExercise_notFound() throws Exception {
        when(exerciseService.getExercise(1L, 99L))
            .thenThrow(new InstanceNotFoundException("Exercise", 99L));

        mvc.perform(get("/api/exercises/{id}", 99L).requestAttr("userId", 1L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= UPDATE EXERCISE =========

    @Test
    @DisplayName("PUT /api/exercises/{id} -> 200 OK")
    void updateExercise_ok() throws Exception {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Press banca modificado");
        dto.setMaterial("Barra");
        dto.setMuscles(List.of("CHEST"));
        dto.setImage("img2.png");
        dto.setDescription("Modificado");
        dto.setStatus(ExerciseStatus.APPROVED);

        Exercise ex = exercise(10L, "Press banca modificado");

        // Adaptar el when para recibir el DTO
        when(exerciseService.updateExercise(anyLong(), eq(10L), any(ExerciseUpdateDto.class)))
                .thenReturn(ex);

        mvc.perform(put("/api/exercises/{id}", 10L)
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("PUT /api/exercises/{id} -> 404 Not Found")
    void updateExercise_notFound() throws Exception {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Press banca modificado");
        dto.setMaterial("Barra");
        dto.setMuscles(List.of("CHEST"));
        dto.setImage("img2.png");
        dto.setDescription("Modificado");
        dto.setStatus(ExerciseStatus.APPROVED);

        // Adaptar el when para recibir el DTO
        when(exerciseService.updateExercise(anyLong(), eq(99L), any(ExerciseUpdateDto.class)))
                .thenThrow(new InstanceNotFoundException("Exercise", 99L));

        mvc.perform(put("/api/exercises/{id}", 99L)
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("PUT /api/exercises/{id} -> 403 Forbidden")
    void updateExercise_forbidden() throws Exception {
        ExerciseCreateDto dto = new ExerciseCreateDto();
        dto.setName("Press banca modificado");
        dto.setMaterial("Barra");
        dto.setMuscles(List.of("CHEST"));
        dto.setImage("img2.png");
        dto.setDescription("Modificado");
        dto.setStatus(ExerciseStatus.APPROVED);

        // Adaptar el when para recibir el DTO
        when(exerciseService.updateExercise(anyLong(), eq(10L), any(ExerciseUpdateDto.class)))
                .thenThrow(new PermissionException());

        mvc.perform(put("/api/exercises/{id}", 10L)
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }


    // ========= DELETE EXERCISE =========

    @Test
    @DisplayName("DELETE /api/exercises/{id} -> 204 No Content")
    void deleteExercise_ok() throws Exception {
        doNothing().when(exerciseService).deleteExercise(1L, 10L);

        mvc.perform(delete("/api/exercises/{id}", 10L).requestAttr("userId", 1L))
           .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} -> 404 Not Found")
    void deleteExercise_notFound() throws Exception {
        doThrow(new InstanceNotFoundException("Exercise", 99L))
            .when(exerciseService).deleteExercise(1L, 99L);

        mvc.perform(delete("/api/exercises/{id}", 99L).requestAttr("userId", 1L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} -> 403 Forbidden")
    void deleteExercise_forbidden() throws Exception {
        doThrow(new PermissionException())
            .when(exerciseService).deleteExercise(1L, 10L);

        mvc.perform(delete("/api/exercises/{id}", 10L).requestAttr("userId", 1L))
           .andExpect(status().isForbidden())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} -> 400 Bad Request (ExerciseInRoutineException)")
    void deleteExercise_inRoutine() throws Exception {
        doThrow(new ExerciseInRoutineException(20L))
            .when(exerciseService).deleteExercise(1L, 10L);

        mvc.perform(delete("/api/exercises/{id}", 10L).requestAttr("userId", 1L))
           .andExpect(status().isBadRequest())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= FOLLOWERS STATS =========

    @Test
    @DisplayName("GET /api/exercises/{id}/followers/stats -> 200 OK with ranking")
    void followersStats_ok() throws Exception {
        List<ExerciseFollowerStatDto> stats = List.of(
                new ExerciseFollowerStatDto(10L, "alice", "seed1", 120.0, java.time.LocalDateTime.of(2024,1,1,10,0)),
                new ExerciseFollowerStatDto(11L, "bob", "seed2", 100.0, java.time.LocalDateTime.of(2024,1,2,10,0))
        );
        when(exerciseService.getFollowersExerciseStats(1L, 5L)).thenReturn(stats);

        mvc.perform(get("/api/exercises/{id}/followers/stats", 5L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].userId", is(10)))
                .andExpect(jsonPath("$[0].userName", is("alice")))
                .andExpect(jsonPath("$[0].weightUsed", is(120.0)))
                .andExpect(jsonPath("$[1].userName", is("bob")));
    }
}
