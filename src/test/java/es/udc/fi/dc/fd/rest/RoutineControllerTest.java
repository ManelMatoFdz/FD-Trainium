package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseInRoutineException;
import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.controllers.RoutineController;
import es.udc.fi.dc.fd.rest.dtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.Block;

import java.util.List;
import java.util.Locale;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.mockito.ArgumentMatchers;

@WebMvcTest(controllers = RoutineController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommonControllerAdvice.class)
public class RoutineControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper om;

    @MockBean private RoutineService routineService;
    @MockBean private ExerciseService exerciseService;
    @MockBean private es.udc.fi.dc.fd.model.services.UserService userService;
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

    @Test
    @DisplayName("GET /api/routines/{routineId}/followers/stats -> 200 OK (followers stats ordered)")
    void getFollowersRoutineStats_ok_andOrdered() throws Exception {
        // Prepare DTOs in expected order: user2 (200), user1 (100), user3 (50)
        RoutineFollowerStatDto s1 = new RoutineFollowerStatDto(2L, "user2", "seed2", 200.0, LocalDateTime.now());
        RoutineFollowerStatDto s2 = new RoutineFollowerStatDto(1L, "user1", "seed1", 100.0, LocalDateTime.now());
        RoutineFollowerStatDto s3 = new RoutineFollowerStatDto(3L, "user3", "seed3", 50.0, LocalDateTime.now());

        when(routineService.getFollowersRoutineStats(eq(1L), eq(10L))).thenReturn(List.of(s1, s2, s3));

        mvc.perform(get("/api/routines/{routineId}/followers/stats", 10L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].userId").value(2))
                .andExpect(jsonPath("$[1].userId").value(1))
                .andExpect(jsonPath("$[2].userId").value(3));
    }

    private Routine routine(Long id, String name) {
        Routine r = new Routine();
        r.setId(id);
        r.setName(name);
        return r;
    }

    private Users user(Long id, String username) {
        Users u = new Users();
        u.setId(id);
        u.setUserName(username);
        u.setFirstName("First");
        u.setLastName("Last");
        u.setEmail(username + "@test.com");
        u.setRole(Users.RoleType.USER);
        return u;
    }

    // ========= FIND ROUTINES =========

    @Test
    @DisplayName("GET /api/routines/ -> 200 OK (findAllRoutines)")
    void findAllRoutines_ok() throws Exception {
        when(routineService.findAllRoutines(1L, 0, 10))
            .thenReturn(new Block<>(List.of(routine(1L, "Rutina 1"), routine(2L, "Rutina 2")), false));

        mvc.perform(get("/api/routines/")
                .requestAttr("userId", 1L)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    @Test
    @DisplayName("GET /api/routines/search -> 200 OK (searchRoutines)")
    void searchRoutines_ok() throws Exception {
        Block<Routine> block = new Block<>(List.of(routine(1L, "Rutina 1")), false);
        when(routineService.searchRoutines(eq(1L), eq("fuerza"), eq("BASICO"), any(), eq(0), eq(10)))
                .thenReturn(block);

        mvc.perform(get("/api/routines/search")
                        .param("categoryId", "1")
                        .param("keywords", "fuerza")
                        .param("level", "BASICO")
                        .param("muscles", "BICEPS")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }
    @Test
    @DisplayName("GET /api/routines/{routineId} -> 200 OK (findRoutineById)")
    void findRoutineById_ok() throws Exception {
        Routine r = routine(5L, "Rutina 5");
        when(routineService.findRoutineById(1L, 5L)).thenReturn(r);

        mvc.perform(get("/api/routines/{routineId}", 5L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= ROUTINE EXERCISES =========

    @Test
    @DisplayName("GET /api/routines/{routineId}/exercises -> 200 OK")
    void findRoutineExercises_ok() throws Exception {
        RoutineExercise re = new RoutineExercise();
        es.udc.fi.dc.fd.model.entities.Exercise ex = new es.udc.fi.dc.fd.model.entities.Exercise();
        ex.setId(123L);
        ex.setMuscles(java.util.Collections.emptySet()); // <- Añade esto
        re.setExercise(ex);

        when(routineService.findRoutineExercisesByRoutineId(5L)).thenReturn(List.of(re));

        mvc.perform(get("/api/routines/{routineId}/exercises", 5L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= CREATE ROUTINE =========

    @Test
    @DisplayName("POST /api/routines/ -> 201 Created (createRoutine)")
    void createRoutine_ok() throws Exception {
        RoutineDetailDto dto = new RoutineDetailDto();
        dto.setName("Nueva rutina");
        dto.setLevel("BASICO");
        dto.setDescription("desc");
        dto.setMaterials("mats");
        dto.setCategory(1L);
        dto.setExercises(List.of());
        dto.setOpenPublic(true);

        Routine r = routine(10L, "Nueva rutina");
        when(routineService.createRoutine(any(), any(), any(), any(), anyLong(), any(), anyList(), anyBoolean()))
                .thenReturn(r);

        mvc.perform(post("/api/routines/")
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("POST /api/routines/ -> 400 Bad Request (DuplicateExerciseInRoutineException)")
    void createRoutine_duplicateExercise() throws Exception {
        RoutineDetailDto dto = new RoutineDetailDto();
        dto.setName("Nueva rutina");
        dto.setLevel("BASICO");
        dto.setDescription("desc");
        dto.setMaterials("mats");
        dto.setCategory(1L);
        dto.setExercises(List.of());
        dto.setOpenPublic(true);

        when(routineService.createRoutine(any(), any(), any(), any(), anyLong(), any(), anyList(), anyBoolean()))
                .thenThrow(new DuplicateExerciseInRoutineException(123L));

        mvc.perform(post("/api/routines/")
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= UPDATE ROUTINE =========

    @Test
    @DisplayName("PUT /api/routines/{routineId} -> 200 OK (updateRoutine)")
    void updateRoutine_ok() throws Exception {
        RoutineDetailDto dto = new RoutineDetailDto();
        dto.setName("Rutina editada");
        dto.setLevel("BASICO");
        dto.setDescription("desc");
        dto.setMaterials("mats");
        dto.setCategory(1L);
        dto.setExercises(List.of());
        dto.setOpenPublic(true);

        Routine r = routine(10L, "Rutina editada");
        when(routineService.updateRoutine(eq(10L), any(), any(), any(), any(), anyLong(), any(), anyList(), anyBoolean()))
                .thenReturn(r);

        mvc.perform(put("/api/routines/{routineId}", 10L)
                        .requestAttr("userId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= DELETE ROUTINE =========

    @Test
    @DisplayName("DELETE /api/routines/{routineId} -> 204 No Content (deleteRoutine)")
    void deleteRoutine_ok() throws Exception {
        doNothing().when(routineService).deleteRoutine(10L, 1L);

        mvc.perform(delete("/api/routines/{routineId}", 10L).requestAttr("userId", 1L))
                .andExpect(status().isNoContent());
    }

    // ========= MY ROUTINES & SAVED ROUTINES =========

    @Test
    @DisplayName("GET /api/routines/myRoutines -> 200 OK")
    void myRoutines_ok() throws Exception {
        when(routineService.myRoutines(1L, 0, 10))
            .thenReturn(new Block<>(List.of(routine(1L, "Rutina 1")), false));

        mvc.perform(get("/api/routines/myRoutines")
                .requestAttr("userId", 1L)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    @Test
    @DisplayName("GET /api/routines/savedRoutines -> 200 OK")
    void findRoutinesByUserId_ok() throws Exception {
        when(routineService.findRoutinesByUserId(1L, 0, 10))
            .thenReturn(new Block<>(List.of(routine(1L, "Rutina 1")), false));

        mvc.perform(get("/api/routines/savedRoutines")
                .requestAttr("userId", 1L)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    // ========= SAVE / UNSAVE ROUTINE =========

    @Test
    @DisplayName("POST /api/routines/{routineId}/save -> 200 OK")
    void saveRoutine_ok() throws Exception {
        Routine r = routine(5L, "Rutina 5");
        when(routineService.saveRoutine(1L, 5L)).thenReturn(r);

        mvc.perform(post("/api/routines/{routineId}/save", 5L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId}/unsave -> 200 OK")
    void unsaveRoutine_ok() throws Exception {
        Routine r = routine(5L, "Rutina 5");
        when(routineService.unsaveRoutine(1L, 5L)).thenReturn(r);

        mvc.perform(delete("/api/routines/{routineId}/unsave", 5L).requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= ERRORES: 404 NOT FOUND =========

    @Test
    @DisplayName("GET /api/routines/{routineId} -> 404 Not Found")
    void findRoutineById_notFound() throws Exception {
        when(routineService.findRoutineById(1L, 99L))
            .thenThrow(new InstanceNotFoundException("Routine", 99L));

        mvc.perform(get("/api/routines/{routineId}", 99L).requestAttr("userId", 1L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/routines/{routineId}/exercises -> 404 Not Found")
    void findRoutineExercises_notFound() throws Exception {
        when(routineService.findRoutineExercisesByRoutineId(99L))
            .thenThrow(new InstanceNotFoundException("Routine", 99L));

        mvc.perform(get("/api/routines/{routineId}/exercises", 99L).requestAttr("userId", 1L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("PUT /api/routines/{routineId} -> 404 Not Found")
    void updateRoutine_notFound() throws Exception {
        RoutineDetailDto dto = new RoutineDetailDto();
        dto.setName("Rutina editada");
        dto.setLevel("BASICO");
        dto.setDescription("desc");
        dto.setMaterials("mats");
        dto.setCategory(1L);
        dto.setExercises(List.of());
        dto.setOpenPublic(true);

        when(routineService.updateRoutine(eq(99L), any(), any(), any(), any(), anyLong(), any(), anyList(), anyBoolean()))
            .thenThrow(new InstanceNotFoundException("Routine", 99L));

        mvc.perform(put("/api/routines/{routineId}", 99L)
                .requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(dto)))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId} -> 404 Not Found")
    void deleteRoutine_notFound() throws Exception {
        org.mockito.Mockito.doThrow(new InstanceNotFoundException("Routine", 99L))
            .when(routineService).deleteRoutine(99L, 1L);

        mvc.perform(delete("/api/routines/{routineId}", 99L).requestAttr("userId", 1L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("POST /api/routines/{routineId}/save -> 404 Not Found")
    void saveRoutine_notFound() throws Exception {
        when(routineService.saveRoutine(1L, 99L))
            .thenThrow(new InstanceNotFoundException("Routine", 99L));

        mvc.perform(post("/api/routines/{routineId}/save", 99L).requestAttr("userId", 1L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId}/unsave -> 404 Not Found")
    void unsaveRoutine_notFound() throws Exception {
        when(routineService.unsaveRoutine(1L, 99L))
            .thenThrow(new InstanceNotFoundException("Routine", 99L));

        mvc.perform(delete("/api/routines/{routineId}/unsave", 99L).requestAttr("userId", 1L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= ERRORES: 403 FORBIDDEN =========

    @Test
    @DisplayName("PUT /api/routines/{routineId} -> 403 Forbidden")
    void updateRoutine_forbidden() throws Exception {
        RoutineDetailDto dto = new RoutineDetailDto();
        dto.setName("Rutina editada");
        dto.setLevel("BASICO");
        dto.setDescription("desc");
        dto.setMaterials("mats");
        dto.setCategory(1L);
        dto.setExercises(List.of());
        dto.setOpenPublic(true);

        when(routineService.updateRoutine(eq(10L), any(), any(), any(), any(), anyLong(), any(), anyList(), anyBoolean()))
            .thenThrow(new PermissionException());

        mvc.perform(put("/api/routines/{routineId}", 10L)
                .requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(dto)))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId} -> 403 Forbidden")
    void deleteRoutine_forbidden() throws Exception {
        org.mockito.Mockito.doThrow(new PermissionException())
            .when(routineService).deleteRoutine(10L, 1L);

        mvc.perform(delete("/api/routines/{routineId}", 10L).requestAttr("userId", 1L))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("POST /api/routines/{routineId}/save -> 403 Forbidden")
    void saveRoutine_forbidden() throws Exception {
        when(routineService.saveRoutine(1L, 10L))
            .thenThrow(new PermissionException());

        mvc.perform(post("/api/routines/{routineId}/save", 10L).requestAttr("userId", 1L))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId}/unsave -> 403 Forbidden")
    void unsaveRoutine_forbidden() throws Exception {
        when(routineService.unsaveRoutine(1L, 10L))
            .thenThrow(new PermissionException());

        mvc.perform(delete("/api/routines/{routineId}/unsave", 10L).requestAttr("userId", 1L))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ========= USERS WHO SAVED / FOLLOW CREATOR =========

    @Test
    @DisplayName("GET /api/routines/{routineId}/savedBy -> 200 OK")
    void getUsersWhoSavedRoutine_ok() throws Exception {
        Users u1 = user(1L, "u1");
        Users u2 = user(2L, "u2");
        when(routineService.findUsersWhoSavedRoutine(10L, 5L, 0, 10))
                .thenReturn(new Block<>(List.of(u1, u2), false));

        mvc.perform(get("/api/routines/{routineId}/savedBy", 5L)
                        .requestAttr("userId", 10L)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].id").value(1L))
                .andExpect(jsonPath("$.items[1].id").value(2L));
    }

    @Test
    @DisplayName("POST /api/routines/{routineId}/followCreator -> 204 No Content")
    void followCreator_ok() throws Exception {
        Users creator = user(3L, "trainer");
        when(routineService.getCreator(5L)).thenReturn(creator);
        doNothing().when(userService).followTrainer(1L, 3L);

        mvc.perform(post("/api/routines/{routineId}/followCreator", 5L)
                        .requestAttr("userId", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/routines/{routineId}/unfollowCreator -> 204 No Content")
    void unfollowCreator_ok() throws Exception {
        Users creator = user(3L, "trainer");
        when(routineService.getCreator(5L)).thenReturn(creator);
        doNothing().when(userService).unfollowTrainer(1L, 3L);

        mvc.perform(delete("/api/routines/{routineId}/unfollowCreator", 5L)
                        .requestAttr("userId", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/routines/{routineId}/trainer -> 200 OK")
    void getTrainerFromRoutine_ok() throws Exception {
        Users creator = user(3L, "trainer");
        when(routineService.getCreator(5L)).thenReturn(creator);

        mvc.perform(get("/api/routines/{routineId}/trainer", 5L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.userName").value("trainer"));
    }

    @Test
    @DisplayName("GET /api/routines/{routineId}/isFollowingCreator -> 200 OK")
    void isFollowingCreator_ok() throws Exception {
        Users creator = user(3L, "trainer");
        when(routineService.getCreator(5L)).thenReturn(creator);
        when(userService.isFollowingTrainer(1L, 3L)).thenReturn(true);

        mvc.perform(get("/api/routines/{routineId}/isFollowingCreator", 5L)
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
}
