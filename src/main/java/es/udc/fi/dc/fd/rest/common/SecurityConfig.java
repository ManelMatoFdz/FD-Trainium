package es.udc.fi.dc.fd.rest.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ======== CONSTANTES PARA ROLES ========
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TRAINER = "TRAINER";
    private static final String ROLE_USER = "USER";

        // ======== CONSTANTES PARA PATHS (configurables) ========
        private static final String PATH_EXERCISES_ALL = "/api/exercises/**";
        private static final String PATH_ROUTINES_ALL = "/api/routines/**";
        private static final String PATH_ROUTINE_EXECUTIONS = "/api/routine-executions/**";

        // Valores externos configurables con defaults seguros
        @Value("${security.paths.public-login:/api/users/login}")
        private String pathPublicLogin;
        @Value("${security.paths.public-signup:/api/users/signUp}")
        private String pathPublicSignUp;
        @Value("${security.paths.frontend-root:/}")
        private String pathFrontendRoot;
        @Value("${security.paths.frontend-index:/index.html}")
        private String pathFrontendIndex;
        @Value("${security.paths.frontend-static:/static/**}")
        private String pathFrontendStatic;
        @Value("${security.paths.frontend-assets:/assets/**}")
        private String pathFrontendAssets;
        @Value("${security.paths.frontend-images:/*.png}")
        private String pathFrontendImages;
        @Value("${security.paths.frontend-icons:/*.ico}")
        private String pathFrontendIcons;
        @Value("${security.paths.frontend-manifest:/manifest.json}")
        private String pathFrontendManifest;
        @Value("${security.paths.frontend-service-worker:/service-worker.js}")
        private String pathFrontendServiceWorker;
        @Value("${security.paths.swagger-ui:/swagger-ui/**}")
        private String pathSwaggerUi;
        @Value("${security.paths.swagger-docs:/v3/api-docs/**}")
        private String pathSwaggerDocs;

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    protected SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(antMatcher("/actuator/**")).permitAll()

                // =============================
                //   Recursos públicos frontend
                // =============================
                .requestMatchers(
                        antMatcher(pathFrontendRoot),
                        antMatcher(pathFrontendIndex),
                        antMatcher(pathFrontendStatic),
                        antMatcher(pathFrontendAssets),
                        antMatcher(pathFrontendImages),
                        antMatcher(pathFrontendIcons),
                        antMatcher(pathFrontendManifest),
                        antMatcher(pathFrontendServiceWorker)
                ).permitAll()

                // =============================
                //   Swagger (documentación)
                // =============================
                .requestMatchers(
                        antMatcher(pathSwaggerUi),
                        antMatcher(pathSwaggerDocs)
                ).permitAll()

                // =============================
                //   Autenticación pública
                // =============================
                // Permitir preflight CORS para todas las rutas
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(antMatcher("/api/hello")).permitAll()
                // Login y SignUp - permitir POST explícitamente
                .requestMatchers(HttpMethod.POST, pathPublicLogin).permitAll()
                .requestMatchers(HttpMethod.POST, pathPublicSignUp).permitAll()
                .requestMatchers(antMatcher("/api/users/loginFromServiceToken")).permitAll()

                // =============================
                //   Seguimiento de usuarios
                // =============================
                .requestMatchers(HttpMethod.POST, "/api/users/*/follow").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/*/unfollow").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/isFollowing").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/followers").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/following").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/search").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()

                // =============================
                //   Premium
                // =============================
                .requestMatchers(HttpMethod.POST, "/api/users/*/premium").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/*/premium/remove").authenticated()

                // =============================
                //   Admin User Banning
                // =============================
                .requestMatchers(HttpMethod.POST, "/api/users/*/admin-ban")
                        .hasRole(ROLE_ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/users/*/admin-ban")
                        .hasRole(ROLE_ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/users/admin-banned")
                        .hasRole(ROLE_ADMIN)

                // =============================
                //   Rutinas
                // =============================
                .requestMatchers(HttpMethod.GET, "/api/routines/search").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/routines/", "/api/routines/*").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/routines/")
                        .hasAnyRole(ROLE_TRAINER, ROLE_ADMIN)

                .requestMatchers(HttpMethod.PUT, PATH_ROUTINES_ALL)
                        .hasAnyRole(ROLE_TRAINER, ROLE_ADMIN)

                .requestMatchers(HttpMethod.GET, "/api/routines/*/savedBy").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/routines/*/followCreator").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/routines/*/unfollowCreator").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/routines/*/trainer").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/routines/*/isFollowingCreator").authenticated()

                .requestMatchers(HttpMethod.DELETE, "/api/routines/*/unsave").authenticated()

                .requestMatchers(HttpMethod.DELETE, PATH_ROUTINES_ALL)
                        .hasAnyRole(ROLE_TRAINER, ROLE_ADMIN)

                .requestMatchers(HttpMethod.GET, "/api/routines/myRoutines")
                        .hasAnyRole(ROLE_TRAINER, ROLE_ADMIN)

                .requestMatchers(HttpMethod.POST, "/api/routines/*/save").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/routines/savedRoutines").authenticated()

                // =============================
                //   Ejercicios
                // =============================
                .requestMatchers(HttpMethod.GET, PATH_EXERCISES_ALL).authenticated()
                .requestMatchers(HttpMethod.POST, "/api/exercises")
                        .hasAnyRole(ROLE_TRAINER, ROLE_ADMIN)
                .requestMatchers(HttpMethod.PUT, PATH_EXERCISES_ALL)
                        .hasRole(ROLE_ADMIN)
                .requestMatchers(HttpMethod.DELETE, PATH_EXERCISES_ALL)
                        .hasRole(ROLE_ADMIN)

                // =============================
                //   Categorías
                // =============================
                .requestMatchers(HttpMethod.GET, "/api/categories/**").authenticated()

                // =============================
                //   Ejecuciones de rutinas
                // =============================
                .requestMatchers(HttpMethod.POST, "/api/routine-executions")
                        .hasAnyRole(ROLE_USER, ROLE_ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/routine-executions/*/like").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/routine-executions/*/like").authenticated()
                .requestMatchers(HttpMethod.GET, PATH_ROUTINE_EXECUTIONS).authenticated()

                // =============================
                //   Cualquier otro endpoint
                // =============================
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
