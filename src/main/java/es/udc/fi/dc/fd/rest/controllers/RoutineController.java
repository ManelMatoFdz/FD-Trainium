package es.udc.fi.dc.fd.rest.controllers;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.*;
import es.udc.fi.dc.fd.rest.dtos.*;
import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;


@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private static final String ROUTINE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";

    private static final String ROUTINE_PERMISSION_EXCEPTION_CODE = "project.exceptions.PermissionException";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserService userService;

    /**
     * Handle instance not found exception.
     *
     * @param exception the exception
     * @param locale    the locale
     * @return the errors dto
     */
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(ROUTINE_NOT_FOUND_EXCEPTION_CODE, null,
                ROUTINE_NOT_FOUND_EXCEPTION_CODE, locale);

        return new ErrorsDto(errorMessage);
    }

    /**
     * Handle permission exception.
     *
     * Thrown when a user tries to perform an operation without the required role
     * or ownership.
     *
     * @param exception the exception
     * @param locale    the locale
     * @return the errors dto with a localized error message
     */
    @ExceptionHandler(PermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePermissionException(PermissionException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(ROUTINE_PERMISSION_EXCEPTION_CODE, null,
                ROUTINE_PERMISSION_EXCEPTION_CODE, locale);

        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(DuplicateExerciseInRoutineException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleDuplicateExerciseInRoutineException(DuplicateExerciseInRoutineException exception, Locale locale) {
        String message = "No se pueden incluir ejercicios duplicados en la rutina (ID repetido: " + exception.getExerciseId() + ")";
        return new ErrorsDto(message);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleIllegalArgumentException(IllegalArgumentException exception, Locale locale) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            message = "Revisa los datos de los ejercicios: las series y repeticiones son obligatorias en ejercicios no cardio.";
        }
        return new ErrorsDto(message);
    }
    @ExceptionHandler(PremiumRequiredException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePremiumRequiredException(PremiumRequiredException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(exception.getMessage(), null, exception.getMessage(), locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Find all routines.
     *
     * @return the list of routine dtos
     */
    @GetMapping("/")
    public BlockDto<RoutineDto> findAllRoutines(@RequestAttribute Long userId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
        Block<Routine> routines = routineService.findAllRoutines(userId, page, size);
        return new BlockDto<>(
                RoutineConversor.toRoutineDtos(routines.getItems()),
                routines.getExistMoreItems()
        );
    }

    /**
     * Search routines with filters (category, keywords, level).
     *
     * @param categoryId the category id (optional)
     * @param keywords the search keywords (optional)
     * @param level the difficulty level (optional): "BASICO", "INTERMEDIO", "AVANZADO", etc.
     * @param page the page number (default: 0)
     * @param size the page size (default: 10)
     * @return a paginated block of routines
     */
    @GetMapping("/search")
    public BlockDto<RoutineDto> searchRoutines(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keywords,
            @RequestParam(required = false) String level,
            @RequestParam(required = false, name = "muscles") List<String> muscles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Set<ExerciseMuscle> exerciseMuscles =
                RoutineExerciseConversor.parseMuscles(muscles);

        Block<Routine> block = routineService.searchRoutines(
                categoryId, keywords, level, exerciseMuscles, page, size);

        return new BlockDto<>(
                RoutineConversor.toRoutineDtos(block.getItems()),
                block.getExistMoreItems()
        );
    }

    /**
     * Finds the exercises associated with a specific routine, including
     * sets and repetitions details (RoutineExercise).
     *
     * @param routineId the ID of the routine
     * @return the list of RoutineExerciseDetailDto
     * @throws InstanceNotFoundException if the routine is not found
     */
    @GetMapping("/{routineId}/exercises")
    public List<RoutineExerciseDetailDto> findRoutineExercises( @RequestAttribute Long userId,
            @PathVariable Long routineId) throws InstanceNotFoundException {
        List<RoutineExercise> routineExercises = routineService.findRoutineExercisesByRoutineId(routineId);
        return RoutineExerciseConversor.toDtoList(routineExercises);
    }


    /**
     * Find routine by id.
     *
     * @param routineId the id
     * @return the routine dto
     * @throws InstanceNotFoundException if routine not found
     */
    @GetMapping("/{routineId}")
    public RoutineDetailDto findRoutineById(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        Routine routine = routineService.findRoutineById(userId, routineId);
        return RoutineConversor.toRoutineDetailDto(routine);
    }

    @PostMapping("/")
    public RoutineDto createRoutine(@RequestAttribute long userId, @Validated @RequestBody RoutineDetailDto routineDto) throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException, PremiumRequiredException {
        Routine routine = routineService.createRoutine(routineDto.getName(), routineDto.getLevel(), routineDto.getDescription(),
                routineDto.getMaterials(), userId, routineDto.getCategory(), RoutineExerciseConversor.toEntityList(routineDto.getExercises()), routineDto.isOpenPublic());

        return RoutineConversor.toRoutineDto(routine);
    }

    @PutMapping("/{routineId}")
    public RoutineDto updateRoutine(@RequestAttribute long userId, @PathVariable long routineId,
                                       @Validated @RequestBody RoutineDetailDto routineDto) throws InstanceNotFoundException, PermissionException, DuplicateExerciseInRoutineException, PremiumRequiredException {
        Routine routine = routineService.updateRoutine(routineId,routineDto.getName(), routineDto.getLevel(), routineDto.getDescription(),
                routineDto.getMaterials(), userId, routineDto.getCategory(), RoutineExerciseConversor.toEntityList(routineDto.getExercises()), routineDto.isOpenPublic());

        return RoutineConversor.toRoutineDto(routine);
    }

    @DeleteMapping("/{routineId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoutine(@RequestAttribute long userId, @PathVariable long routineId) throws InstanceNotFoundException, PermissionException {
        routineService.deleteRoutine(routineId, userId);
    }

    @GetMapping("/myRoutines")
    public BlockDto<RoutineDto> myRoutines(@RequestAttribute Long userId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException, PermissionException {
        Block<Routine> routines = routineService.myRoutines(userId, page, size);
        return new BlockDto<>(
                RoutineConversor.toRoutineDtos(routines.getItems()),
                routines.getExistMoreItems()
        );
    }


    @PostMapping("/{routineId}/save")
    public RoutineDto saveRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        Routine savedRoutine = routineService.saveRoutine(userId, routineId);
        return RoutineConversor.toRoutineDto(savedRoutine);
    }

    @DeleteMapping("/{routineId}/unsave")
    public RoutineDto unsaveRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        Routine unsavedRoutine = routineService.unsaveRoutine(userId, routineId);
        return RoutineConversor.toRoutineDto(unsavedRoutine);
    }

    @GetMapping("/savedRoutines")
    public BlockDto<RoutineDto> findRoutinesByUserId(@RequestAttribute Long userId,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
        Block<Routine> routines = routineService.findRoutinesByUserId(userId, page, size);
        return new BlockDto<>(
                RoutineConversor.toRoutineDtos(routines.getItems()),
                routines.getExistMoreItems()
        );
    }

    @GetMapping("/{routineId}/savedBy")
    public BlockDto<UserDto> getUsersWhoSavedRoutine(
            @RequestAttribute Long userId,
            @PathVariable Long routineId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException, PermissionException {

        Block<Users> usersBlock = routineService.findUsersWhoSavedRoutine(userId, routineId, page, size);

        return new BlockDto<>(
                UserConversor.toUserDtos(usersBlock.getItems()),
                usersBlock.getExistMoreItems()
        );
    }

    @PostMapping("/{routineId}/followCreator")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void followCreator(@RequestAttribute Long userId, @PathVariable Long routineId)
            throws InstanceNotFoundException, AlreadyFollowedException {
        Users creator = routineService.getCreator(routineId);
        userService.followTrainer(userId, creator.getId());
    }

    @DeleteMapping("/{routineId}/unfollowCreator")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollowCreator(@RequestAttribute Long userId, @PathVariable Long routineId)
            throws InstanceNotFoundException, AlreadyNotFollowedException {
        Users creator = routineService.getCreator(routineId);
        userService.unfollowTrainer(userId, creator.getId());
    }

    @GetMapping("/{routineId}/trainer")
    public UserDto getTrainerFromRoutine(@PathVariable Long routineId)
            throws InstanceNotFoundException {
        Users trainer = routineService.getCreator(routineId);
        return UserConversor.toUserDto(trainer);
    }

    @GetMapping("/{routineId}/isFollowingCreator")
    public boolean isFollowingCreator(@RequestAttribute Long userId,
                                      @PathVariable Long routineId) throws InstanceNotFoundException {
        Users creator = routineService.getCreator(routineId);
        return userService.isFollowingTrainer(userId, creator.getId());
    }

    /**
     * Get routines performed by the user.
     */
    @GetMapping("/performed")
    public List<RoutineDto> findUserPerformedRoutines(@RequestAttribute Long userId)
            throws InstanceNotFoundException {
        return RoutineConversor.toRoutineDtos(routineService.findUserPerformedRoutines(userId));
    }

    /**
     * Ranking de volumen por rutina entre los usuarios seguidos.
     */
    @GetMapping("/{id}/followers/stats")
    public List<RoutineFollowerStatDto> getFollowersRoutineStats(@RequestAttribute Long userId,
                                                                 @PathVariable("id") Long routineId)
            throws InstanceNotFoundException {
        return routineService.getFollowersRoutineStats(userId, routineId);
    }

}
