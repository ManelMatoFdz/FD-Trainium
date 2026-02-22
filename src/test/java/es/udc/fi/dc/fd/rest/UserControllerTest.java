package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.services.exceptions.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.WrappedService;
import es.udc.fi.dc.fd.model.services.WrappedStats;

import es.udc.fi.dc.fd.rest.common.CommonControllerAdvice;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.*;

import java.util.List;
import java.util.Locale;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)     // desactiva filtros de seguridad/JWT en el slice
@Import(CommonControllerAdvice.class)         // incluye tu @ControllerAdvice
@ActiveProfiles("test")                       // usa el perfil de test con H2
class UserControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper om;

    @MockBean private UserService userService;
    @MockBean private JwtGenerator jwtGenerator;
    @MockBean private MessageSource messageSource;
    @MockBean private WrappedService wrappedService;

    private final Long userId = 1L;
    private final Long blockedId = 2L;

    private Users u(Long id, String userName, String first, String last, String email) {
        Users x = new Users();
        x.setId(id);
        x.setUserName(userName);
        x.setFirstName(first);
        x.setLastName(last);
        x.setEmail(email);
        x.setFormation("Ing Informática");
        x.setRole(Users.RoleType.USER);
        return x;
    }

    @BeforeEach
    void setup() {
        when(messageSource.getMessage(anyString(), isNull(), anyString(), any(Locale.class)))
            .thenAnswer(inv -> inv.getArgument(2)); // devuelve el code por defecto
        when(jwtGenerator.generate(any())).thenReturn("jwt-token");
    }

    // ========= SIGN UP =========

    @Test
    void signUp_201_y_devuelve_authenticatedUserDto_con_userDto() throws Exception {
        var in = new UserDto();
        in.setUserName("alice");
        in.setPassword("Secret#123");
        in.setFirstName("Alice");
        in.setLastName("Liddell");
        in.setEmail("alice@wonder.land");
        in.setRole("USER"); // requerido por AllValidations

        // El servicio asigna ID al persistir
        doAnswer(i -> { Users arg = i.getArgument(0); arg.setId(42L);arg.setRole(Users.RoleType.USER); return null; })
            .when(userService).signUp(any(Users.class));

        mvc.perform(post("/api/users/signUp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(in)))
           .andExpect(status().isCreated())
           .andExpect(header().string("Location",
                   org.hamcrest.Matchers.containsString("/api/users/signUp/42")))
           .andExpect(jsonPath("$.serviceToken").value("jwt-token"))
           .andExpect(jsonPath("$.user.id").value(42))
           .andExpect(jsonPath("$.user.userName").value("alice"))
           .andExpect(jsonPath("$.user.role").value("USER"));
    }

    @Test
    void signUp_duplicateInstance_400_por_advice() throws Exception {
        var in = new UserDto();
        in.setUserName("alice");
        in.setPassword("Secret#123");
        in.setFirstName("Alice");
        in.setLastName("Liddell");
        in.setEmail("alice@wonder.land");
        in.setRole("USER");

        doThrow(new DuplicateInstanceException("Users", "alice"))
            .when(userService).signUp(any(Users.class));

        mvc.perform(post("/api/users/signUp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(in)))
           .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$").isMap());
    }

    @Test
    void signUp_falta_role_400_fieldErrors() throws Exception {
        var in = new UserDto();
        in.setUserName("alice");
        in.setPassword("Secret#123");
        in.setFirstName("Alice");
        in.setLastName("Liddell");
        in.setEmail("alice@wonder.land");
        // role ausente

        mvc.perform(post("/api/users/signUp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(in)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.fieldErrors[?(@.fieldName=='role')]").exists())
                // opcional: valida también el mensaje de validación
                .andExpect(jsonPath("$.fieldErrors[?(@.fieldName=='role')].message")
                        .value(org.hamcrest.Matchers.hasItem("no debe ser nulo")));
    }

    // ========= LOGIN =========

    @Test
    void login_ok() throws Exception {
        var params = new LoginParamsDto();
        params.setUserName("alice");
        params.setPassword("Secret#123");

        var domain = u(42L, "alice", "Alice", "Liddell", "alice@wonder.land");
        when(userService.login("alice", "Secret#123")).thenReturn(domain);

        mvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(params)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.serviceToken").value("jwt-token"))
           .andExpect(jsonPath("$.user.id").value(42))
           .andExpect(jsonPath("$.user.userName").value("alice"));
    }

    @Test
    void login_incorrecto_404_por_handler_del_controller() throws Exception {
        var params = new LoginParamsDto();
        params.setUserName("wrong");
        params.setPassword("nope");

        when(userService.login(anyString(), anyString()))
            .thenThrow(new IncorrectLoginException("wrong", "nope"));

        mvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(params)))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.globalError").exists());
    }

    // ========= LOGIN FROM SERVICE TOKEN =========

    @Test
    void loginFromServiceToken_ok() throws Exception {
        var domain = u(7L, "bob", "Bob", "Builder", "bob@ex.com");
        when(userService.loginFromId(7L)).thenReturn(domain);

        mvc.perform(post("/api/users/loginFromServiceToken")
                .requestAttr("userId", 7L)
                .requestAttr("serviceToken", "service-token"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.serviceToken").value("service-token"))
           .andExpect(jsonPath("$.user.id").value(7));
    }

    @Test
    void loginFromServiceToken_instanceNotFound_404() throws Exception {
        when(userService.loginFromId(123L))
            .thenThrow(new InstanceNotFoundException("Users", 123L));

        mvc.perform(post("/api/users/loginFromServiceToken")
                .requestAttr("userId", 123L)
                .requestAttr("serviceToken", "abc"))
           .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$").isMap());
    }

    // ========= GET PROFILE =========

    @Test
    void getMyProfile_ok() throws Exception {
        var domain = u(10L, "eva", "Eva", "Stone", "eva@ex.com");
        when(userService.getProfile(10L)).thenReturn(domain);
        when(userService.getUserBadges(10L)).thenReturn(java.util.List.of("first_workout", "consistency_streak_3"));

        mvc.perform(get("/api/users/myProfile").requestAttr("userId", 10L))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(10))
           .andExpect(jsonPath("$.userName").value("eva"))
           .andExpect(jsonPath("$.badges[0]").value("first_workout"))
           .andExpect(jsonPath("$.badges[1]").value("consistency_streak_3"));
    }

    @Test
    void getProfile_instanceNotFound_404_por_advice() throws Exception {
        when(userService.getProfile(99L)).thenThrow(new InstanceNotFoundException("Users", 99L));

        mvc.perform(get("/api/users/myProfile").requestAttr("userId", 99L))
           .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$").isMap());
    }

    // ========= UPDATE PROFILE =========

    @Test
    void updateProfile_ok() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("Nuevo");
        upd.setLastName("Nombre");
        upd.setEmail("nuevo@mail.com");
        upd.setFormation("Grado X");
        upd.setAvatarUrl("https://img.test/pic.png");

        var updated = u(5L, "mike", "Nuevo", "Nombre", "nuevo@mail.com");
        when(userService.updateProfile(eq(5L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(updated);

        mvc.perform(put("/api/users/{id}", 5L)
                .requestAttr("userId", 5L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(5))
           .andExpect(jsonPath("$.email").value("nuevo@mail.com"));
    }

	@Test
    void updateProfile_forbidden_si_id_distinto_403() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("a@b.com");
        upd.setFormation("X");

        mvc.perform(put("/api/users/{id}", 5L)
                .requestAttr("userId", 4L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
           .andExpect(status().isForbidden());
    }

    @Test
    void updateProfile_instanceNotFound_404() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("a@b.com");
        upd.setFormation("X");

        when(userService.updateProfile(eq(5L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenThrow(new InstanceNotFoundException("Users", 5L));

        mvc.perform(put("/api/users/{id}", 5L)
                .requestAttr("userId", 5L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isMap());
    }

    @Test
    void updateProfile_email_invalido_400() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("no-es-email");
        upd.setFormation("X");

        mvc.perform(put("/api/users/{id}", 6L)
                .requestAttr("userId", 6L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.fieldErrors[*].fieldName").value(org.hamcrest.Matchers.hasItem("email")));
    }

    @Test
    void updateProfile_avatarUrl_vacio_permitido_200() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("a@b.com");
        upd.setFormation("X");
        upd.setAvatarUrl(""); // permitido por el Pattern

        var updated = u(8L, "user", "A", "B", "a@b.com");
        when(userService.updateProfile(eq(8L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(updated);

        mvc.perform(put("/api/users/{id}", 8L)
                .requestAttr("userId", 8L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(8));
    }

    @Test
    void updateProfile_avatarUrl_invalida_400() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("a@b.com");
        upd.setFormation("X");
        upd.setAvatarUrl("ftp://host/img.png");

        mvc.perform(put("/api/users/{id}", 9L)
                        .requestAttr("userId", 9L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(upd)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[?(@.fieldName=='avatarUrl')]").exists())
                .andExpect(jsonPath("$.fieldErrors[?(@.fieldName=='avatarUrl')].message").value(
                        org.hamcrest.Matchers.hasItem("avatarUrl must start with http:// or https://")
                ));
    }

    @Test
    void updateProfile_con_avatarImage_bytes_200() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("A");
        upd.setLastName("B");
        upd.setEmail("a@b.com");
        upd.setFormation("X");
        upd.setAvatarUrl(""); // ignorado si hay imagen
        upd.setAvatarImage(new byte[]{1,2,3}); // Jackson -> base64
        upd.setAvatarImageType("image/png");

        var updated = u(12L, "user", "A", "B", "a@b.com");
        when(userService.updateProfile(eq(12L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(updated);

        mvc.perform(put("/api/users/{id}", 12L)
                .requestAttr("userId", 12L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(upd)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(12));
    }

    // ========= CHANGE PASSWORD =========

    @Test
    void changePassword_204() throws Exception {
        var body = new ChangePasswordParamsDto();
        body.setOldPassword("old");
        body.setNewPassword("new#123");

        doNothing().when(userService).changePassword(3L, "old", "new#123");

        mvc.perform(post("/api/users/{id}/changePassword", 3L)
                .requestAttr("userId", 3L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(body)))
           .andExpect(status().isNoContent());
    }

    @Test
    void changePassword_incorrecta_404_por_handler_del_controller() throws Exception {
        var body = new ChangePasswordParamsDto();
        body.setOldPassword("bad");
        body.setNewPassword("new#123");

        doThrow(new IncorrectPasswordException())
            .when(userService).changePassword(3L, "bad", "new#123");

        mvc.perform(post("/api/users/{id}/changePassword", 3L)
                .requestAttr("userId", 3L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(body)))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.globalError").exists());
    }



    @Test
    void findUserById_ok() throws Exception {
        var domain = u(21L, "luke", "Luke", "Skywalker", "luke@jedi.org");
        when(userService.findUserById(21L)).thenReturn(domain);
        when(userService.getUserBadges(21L)).thenReturn(java.util.List.of("first_workout"));

        mvc.perform(get("/api/users/{id}", 21L))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(21))
           .andExpect(jsonPath("$.userName").value("luke"))
           .andExpect(jsonPath("$.badges[0]").value("first_workout"));
    }


    @Test
    void searchUsers_por_username_contiene_ok() throws Exception {
        var requesterId = 99L;
        var a = u(1L, "alice", "Alice", "Liddell", "alice@wonder.land");
        var b = u(2L, "malicia", "Ma", "Lic ia", "m@ex.com");
        when(userService.searchUser(requesterId,"ali")).thenReturn(java.util.List.of(a, b));

        mvc.perform(get("/api/users/search").param("userName", "ali")
           .requestAttr("userId", requesterId))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].id").value(1))
           .andExpect(jsonPath("$[0].userName").value("alice"))
           .andExpect(jsonPath("$[1].id").value(2))
           .andExpect(jsonPath("$[1].userName").value("malicia"));
    }

    // ========= FOLLOWERS / FOLLOWING =========

    @Test
    void getFollowers_ok_lista_de_usuarios() throws Exception {
        var u1 = u(5L, "bob", "Bob", "Builder", "bob@example.com");
        var u2 = u(6L, "carol", "Carol", "Danvers", "carol@example.com");

        when(userService.getFollowers(42L)).thenReturn(java.util.List.of(u1, u2));

        mvc.perform(get("/api/users/{id}/followers", 42L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$[0].id").value(5))
           .andExpect(jsonPath("$[0].userName").value("bob"))
           .andExpect(jsonPath("$[1].id").value(6))
           .andExpect(jsonPath("$[1].userName").value("carol"))
           .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getFollowers_instanceNotFound_404_por_advice() throws Exception {
        when(userService.getFollowers(999L))
            .thenThrow(new InstanceNotFoundException("Users", 999L));

        mvc.perform(get("/api/users/{id}/followers", 999L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getFollowers_vacio_ok() throws Exception {
        when(userService.getFollowers(55L)).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users/{id}/followers", 55L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }

    @Test
    void getFollowing_ok_lista_de_usuarios() throws Exception {
        var u1 = u(10L, "dave", "Dave", "Grohl", "dave@example.com");
        when(userService.getFollowing(7L)).thenReturn(java.util.List.of(u1));

        mvc.perform(get("/api/users/{id}/following", 7L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$[0].id").value(10))
           .andExpect(jsonPath("$[0].userName").value("dave"))
           .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getFollowing_instanceNotFound_404_por_advice() throws Exception {
        when(userService.getFollowing(888L))
            .thenThrow(new InstanceNotFoundException("Users", 888L));

        mvc.perform(get("/api/users/{id}/following", 888L))
           .andExpect(status().isNotFound())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getFollowing_vacio_ok() throws Exception {
        when(userService.getFollowing(56L)).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users/{id}/following", 56L))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }

    // ========= FOLLOW / UNFOLLOW / IS-FOLLOWING =========

    @Test
    void followUser_noContent() throws Exception {
        doNothing().when(userService).followTrainer(3L, 5L);

        mvc.perform(post("/api/users/{id}/follow", 5L)
                .requestAttr("userId", 3L))
           .andExpect(status().isNoContent());
    }

    @Test
    void unfollowUser_noContent() throws Exception {
        doNothing().when(userService).unfollowTrainer(3L, 5L);

        mvc.perform(delete("/api/users/{id}/unfollow", 5L)
                .requestAttr("userId", 3L))
           .andExpect(status().isNoContent());
    }

    @Test
    void isFollowingUser_true() throws Exception {
        when(userService.isFollowingTrainer(3L, 5L)).thenReturn(true);

        mvc.perform(get("/api/users/{id}/isFollowing", 5L)
                .requestAttr("userId", 3L))
           .andExpect(status().isOk())
           .andExpect(content().string("true"));
    }

    //Tests usuario premium

    @Test
    void activatePremium_Trainer_200() throws Exception {
        Users trainer = u(5L, "trainer", "Trainer", "User", "trainer@test.com");
        trainer.setRole(Users.RoleType.TRAINER);
        trainer.setIsPremium(true);

        when(userService.activatePremium(5L)).thenReturn(trainer);

        mvc.perform(post("/api/users/{id}/premium", 5L)
                        .requestAttr("userId", 5L)) // Mismo ID - escenario real
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.isPremium").value(true));
    }

    @Test
    void activatePremium_User_200_butNoChange() throws Exception {
        Users user = u(6L, "user", "Standard", "User", "user@test.com");
        user.setRole(Users.RoleType.USER);
        user.setIsPremium(false);

        when(userService.activatePremium(6L)).thenReturn(user);

        mvc.perform(post("/api/users/{id}/premium", 6L)
                        .requestAttr("userId", 6L)) // Mismo ID - escenario real
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(6))
                .andExpect(jsonPath("$.isPremium").value(false));
    }
    @Test
    void activatePremium_UserNotFound_404() throws Exception {
        when(userService.activatePremium(999L))
                .thenThrow(new InstanceNotFoundException("Users", 999L));

        mvc.perform(post("/api/users/{id}/premium", 999L)
                        .requestAttr("userId", 999L)) // Mismo ID
                .andExpect(status().isNotFound());
    }


    @Test
    void deactivatePremium_Trainer_200() throws Exception {
        Users trainer = u(7L, "trainer2", "Trainer", "Two", "trainer2@test.com");
        trainer.setRole(Users.RoleType.TRAINER);
        trainer.setIsPremium(false);

        when(userService.deactivatePremium(7L)).thenReturn(trainer);

        mvc.perform(post("/api/users/{id}/premium/remove", 7L)
                        .requestAttr("userId", 7L)) // Mismo ID
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.isPremium").value(false));
    }



    @Test
    void searchUsers_emptyString_returnsEmptyList() throws Exception {
        var requesterId = 99L;
        when(userService.searchUser(requesterId,"")).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users/search").param("userName", "")
                .requestAttr("userId", requesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }

    @Test
    void searchUsers_whitespaceString_returnsEmptyList() throws Exception {
        var requesterId = 99L;
        when(userService.searchUser(requesterId,"   ")).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users/search").param("userName", "   ")
                .requestAttr("userId", requesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }

    @Test
    void searchUsers_nullParameter_returnsEmptyList() throws Exception {
        var requesterId = 99L;
        when(userService.searchUser(requesterId,null)).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users/search").param("userName", "")
                .requestAttr("userId", requesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }



    @Test
    void followUser_alreadyFollowing_409() throws Exception {
        doThrow(new AlreadyFollowedException())
                .when(userService).followTrainer(3L, 5L);

        mvc.perform(post("/api/users/{id}/follow", 5L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isConflict());
    }

    @Test
    void followUser_userNotFound_404() throws Exception {
        doThrow(new InstanceNotFoundException("Users", 5L))
                .when(userService).followTrainer(3L, 5L);

        mvc.perform(post("/api/users/{id}/follow", 5L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isNotFound());
    }

    @Test
    void unfollowUser_notFollowing_409() throws Exception {
        doThrow(new AlreadyNotFollowedException())
                .when(userService).unfollowTrainer(3L, 5L);

        mvc.perform(delete("/api/users/{id}/unfollow", 5L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isConflict());
    }

    @Test
    void unfollowUser_userNotFound_404() throws Exception {
        doThrow(new InstanceNotFoundException("Users", 5L))
                .when(userService).unfollowTrainer(3L, 5L);

        mvc.perform(delete("/api/users/{id}/unfollow", 5L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isNotFound());
    }

    @Test
    void isFollowingUser_false() throws Exception {
        when(userService.isFollowingTrainer(3L, 5L)).thenReturn(false);

        mvc.perform(get("/api/users/{id}/isFollowing", 5L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void isFollowingUser_userNotFound_404() throws Exception {
        when(userService.isFollowingTrainer(3L, 999L))
                .thenThrow(new InstanceNotFoundException("Users", 999L));

        mvc.perform(get("/api/users/{id}/isFollowing", 999L)
                        .requestAttr("userId", 3L))
                .andExpect(status().isNotFound());
    }


    @Test
    void updateProfile_withHeightWeightGender_200() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("John");
        upd.setLastName("Doe");
        upd.setEmail("john.doe@example.com");
        upd.setFormation("Computer Science");
        upd.setHeightCm(180.0);
        upd.setWeightKg(75.0);
        upd.setGender("MALE");

        var updated = u(15L, "john", "John", "Doe", "john.doe@example.com");
        updated.setHeightCm(180.0);
        updated.setWeightKg(75.0);
        updated.setGender("MALE");

        when(userService.updateProfile(eq(15L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(updated);

        mvc.perform(put("/api/users/{id}", 15L)
                        .requestAttr("userId", 15L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(upd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(15))
                .andExpect(jsonPath("$.heightCm").value(180.0))
                .andExpect(jsonPath("$.weightKg").value(75.0))
                .andExpect(jsonPath("$.gender").value("MALE"));
    }

    @Test
    void updateProfile_withNullHeightWeight_200() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("John");
        upd.setLastName("Doe");
        upd.setEmail("john.doe@example.com");
        upd.setFormation("Computer Science");

        var updated = u(16L, "john", "John", "Doe", "john.doe@example.com");

        when(userService.updateProfile(eq(16L), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(updated);

        mvc.perform(put("/api/users/{id}", 16L)
                        .requestAttr("userId", 16L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(upd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(16));
    }

    @Test
    void updateProfile_invalidGender_400() throws Exception {
        var upd = new UpdateProfileParamsDto();
        upd.setFirstName("John");
        upd.setLastName("Doe");
        upd.setEmail("john.doe@example.com");
        upd.setFormation("Computer Science");
        upd.setGender("INVALID_GENDER");

        mvc.perform(put("/api/users/{id}", 17L)
                        .requestAttr("userId", 17L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(upd)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[?(@.fieldName=='gender')]").exists());
    }

    @Test
    void changePassword_Forbidden_WhenDifferentUser() throws Exception {
        var body = new ChangePasswordParamsDto();
        body.setOldPassword("old");
        body.setNewPassword("new#123");

        mvc.perform(post("/api/users/{id}/changePassword", 5L)
                        .requestAttr("userId", 4L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void changePassword_UserNotFound_404() throws Exception {
        var body = new ChangePasswordParamsDto();
        body.setOldPassword("old");
        body.setNewPassword("new#123");

        doThrow(new InstanceNotFoundException("Users", 999L))
                .when(userService).changePassword(999L, "old", "new#123");

        mvc.perform(post("/api/users/{id}/changePassword", 999L)
                        .requestAttr("userId", 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }



    @Test
    void findUserById_NotFound_404() throws Exception {
        when(userService.findUserById(999L))
                .thenThrow(new InstanceNotFoundException("Users", 999L));

        mvc.perform(get("/api/users/{id}", 999L))
                .andExpect(status().isNotFound());
    }



    @Test
    void signUp_withFormation_becomesTrainer() throws Exception {
        var in = new UserDto();
        in.setUserName("trainer");
        in.setPassword("Secret#123");
        in.setFirstName("Trainer");
        in.setLastName("User");
        in.setEmail("trainer@example.com");
        in.setRole("USER");
        in.setFormation("Sports Science");

        doAnswer(i -> {
            Users arg = i.getArgument(0);
            arg.setId(50L);
            arg.setRole(Users.RoleType.TRAINER);
            return null;
        }).when(userService).signUp(any(Users.class));

        mvc.perform(post("/api/users/signUp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(in)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.id").value(50))
                .andExpect(jsonPath("$.user.role").value("TRAINER"));
    }

    @Test
    void signUp_missingRequiredFields_400() throws Exception {
        var in = new UserDto();

        mvc.perform(post("/api/users/signUp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(in)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.fieldErrors[*].fieldName").value(
                        org.hamcrest.Matchers.hasItems("userName", "password", "firstName", "lastName", "email", "role")));
    }

    // ========= BLOCK USER =========

    // -------------------- BLOCK --------------------

    @Test
    void blockUser_success() throws Exception {
        doNothing().when(userService).blockUser(userId, blockedId);

        mvc.perform(post("/api/users/{id}/block", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isNoContent());

        verify(userService).blockUser(userId, blockedId);
    }

    @Test
    void blockUser_alreadyBlocked() throws Exception {
        doThrow(new AlreadyBlockedException()).when(userService).blockUser(userId, blockedId);

        mvc.perform(post("/api/users/{id}/block", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isConflict());

        verify(userService).blockUser(userId, blockedId);
    }

    @Test
    void blockUser_userNotFound() throws Exception {
        doThrow(new InstanceNotFoundException(userId.toString(), Users.class))
                .when(userService).blockUser(userId, blockedId);

        mvc.perform(post("/api/users/{id}/block", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isNotFound());

        verify(userService).blockUser(userId, blockedId);
    }

    // -------------------- UNBLOCK --------------------

    @Test
    void unblockUser_success() throws Exception {
        doNothing().when(userService).unblockUser(userId, blockedId);

        mvc.perform(delete("/api/users/{id}/unblock", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isNoContent());

        verify(userService).unblockUser(userId, blockedId);
    }

    @Test
    void unblockUser_notBlocked() throws Exception {
        doThrow(new NotBlockedException()).when(userService).unblockUser(userId, blockedId);

        mvc.perform(delete("/api/users/{id}/unblock", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isConflict());

        verify(userService).unblockUser(userId, blockedId);
    }

    @Test
    void unblockUser_userNotFound() throws Exception {
        doThrow(new InstanceNotFoundException(userId.toString(), Users.class))
                .when(userService).unblockUser(userId, blockedId);

        mvc.perform(delete("/api/users/{id}/unblock", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isNotFound());

        verify(userService).unblockUser(userId, blockedId);
    }

    // -------------------- IS BLOCKED --------------------

    @Test
    void isBlocked_returnsCorrectMap() throws Exception {
        when(userService.isBlocked(userId, blockedId)).thenReturn(true);
        when(userService.isBlocked(blockedId, userId)).thenReturn(false);

        mvc.perform(get("/api/users/{id}/isBlocked", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.blockedByMe").value(true))
                .andExpect(jsonPath("$.blockedMe").value(false));

        verify(userService).isBlocked(userId, blockedId);
        verify(userService).isBlocked(blockedId, userId);
    }

    @Test
    void isBlocked_userNotFound() throws Exception {
        doThrow(new InstanceNotFoundException(blockedId.toString(), Users.class))
                .when(userService).isBlocked(userId, blockedId);

        mvc.perform(get("/api/users/{id}/isBlocked", blockedId)
                        .requestAttr("userId", userId))
                .andExpect(status().isNotFound());

        verify(userService).isBlocked(userId, blockedId);
    }

    // -------------------- GET BLOCKED USERS --------------------

    @Test
    void getBlockedUsers_returnsList() throws Exception {
        // Mock de usuarios bloqueados
        Users bob = new Users();
        bob.setId(2L);
        bob.setUserName("bob");

        Users carol = new Users();
        carol.setId(3L);
        carol.setUserName("carol");

        when(userService.getBlockedUsers(userId)).thenReturn(List.of(bob, carol));

        mvc.perform(get("/api/users/blocked")
                        .param("userId", userId.toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[0].userName").value("bob"))
                .andExpect(jsonPath("$[1].id").value(3))
                .andExpect(jsonPath("$[1].userName").value("carol"));

        verify(userService).getBlockedUsers(userId);
    }

    @Test
    void getBlockedUsers_noBlockedUsers_returnsEmptyList() throws Exception {
        when(userService.getBlockedUsers(userId)).thenReturn(List.of());

        mvc.perform(get("/api/users/blocked")
                        .param("userId", userId.toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(userService).getBlockedUsers(userId);
    }

    @Test
    void getBlockedUsers_userNotFound_returnsNotFound() throws Exception {
        when(userService.getBlockedUsers(userId))
                .thenThrow(new InstanceNotFoundException(userId.toString(), Users.class));

        mvc.perform(get("/api/users/blocked")
                        .param("userId", userId.toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(userService).getBlockedUsers(userId);
    }




    @Test
    void getWrapped_ok() throws Exception {
        WrappedStats stats = new WrappedStats();
        stats.setTotalKgLifted(100.0);
        stats.setTotalHoursTrained(10.5);

        when(wrappedService.getWrappedStats(eq(userId), anyInt())).thenReturn(stats);

        mvc.perform(get("/api/users/wrapped")
                        .requestAttr("userId", userId)
                        .param("year", "2025"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalKgLifted").value(100.0))
                .andExpect(jsonPath("$.totalHoursTrained").value(10.5));
    }

}
