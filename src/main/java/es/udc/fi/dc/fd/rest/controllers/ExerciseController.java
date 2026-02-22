package es.udc.fi.dc.fd.rest.controllers;

import java.util.List;
import java.util.Locale;

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

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseException;
import es.udc.fi.dc.fd.model.services.exceptions.ExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseCreateDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseUpdateDto;
import es.udc.fi.dc.fd.rest.dtos.UpdateExerciseImageDto;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private static final String EXERCISE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String EXERCISE_PERMISSION_EXCEPTION_CODE = "project.exceptions.PermissionException";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ExerciseService exerciseService;

    private static final int PAGESIZE = 10;


    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                EXERCISE_NOT_FOUND_EXCEPTION_CODE, null, EXERCISE_NOT_FOUND_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(PermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePermissionException(PermissionException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                EXERCISE_PERMISSION_EXCEPTION_CODE, null, EXERCISE_PERMISSION_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(ExerciseInRoutineException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleExerciseInRoutineException(ExerciseInRoutineException exception, Locale locale) {
        String errorMessage = "No se puede eliminar el ejercicio porque pertenece a una rutina";
        return new ErrorsDto(errorMessage);
    }
    @ExceptionHandler(DuplicateExerciseException.class)
    @ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
    @ResponseBody
    public ErrorsDto handleDuplicateExerciseException(DuplicateExerciseException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                "project.exceptions.DuplicateExerciseException",
                null,
                "Ya existe un ejercicio con ese nombre.",
                locale
        );
        return new ErrorsDto(errorMessage);
    }
    @ExceptionHandler(PremiumRequiredException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePremiumRequiredException(PremiumRequiredException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(exception.getMessage(), null, exception.getMessage(), locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Create a new exercise (TRAINER, ADMIN).
     */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ExerciseDto createExercise(@RequestAttribute Long userId,
                                      @Validated @RequestBody ExerciseCreateDto exercise)
            throws PermissionException, InstanceNotFoundException, DuplicateExerciseException, PremiumRequiredException {

        Exercise created = exerciseService.createExercise(
                userId,
                exercise.getName(),
                exercise.getMaterial(),
                ExerciseConversor.convertToMusclesSet(exercise.getMuscles()),
                exercise.getImage(),
                exercise.getDescription(),
                exercise.getType()
        );

        return ExerciseConversor.toExerciseDto(created);
    }

    /**
     * Exercises executed by the current user (distinct).
     */
    @GetMapping("/executed")
    public List<ExerciseDto> findExecutedExercises(@RequestAttribute Long userId) throws InstanceNotFoundException {
        List<Exercise> exercises = exerciseService.findUserPerformedExercises(userId);
        return ExerciseConversor.toExerciseDtos(exercises);
    }

    /**
     * Search approved exercises with optional filters (usuarios autenticados).
     */
    @GetMapping
    public Block<ExerciseDto> findExercises(@RequestAttribute Long userId,
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) String material,
                                            @RequestParam(required = false) String muscles,
                                            @RequestParam(defaultValue = "0") int page)
            throws PermissionException, InstanceNotFoundException {

        Block<Exercise> exercises = exerciseService.findExercises(
                userId,
                (name != null) ? name.trim() : null,
                (material != null) ? material.trim() : null,
                ExerciseConversor.convertToMusclesSet(muscles),
                page,
                PAGESIZE
        );

        return ExerciseConversor.toExerciseDtos(exercises);
    }

    /**
     * Search pending exercises with optional filters (ADMIN only).
     */
    @GetMapping("/pending")
    public Block<ExerciseDto> findExercisesPending(@RequestAttribute Long userId,
                                                   @RequestParam(required = false) String name,
                                                   @RequestParam(required = false) String material,
                                                   @RequestParam(required = false) String muscles,
                                                   @RequestParam(defaultValue = "0") int page)
            throws PermissionException, InstanceNotFoundException {

        Block<Exercise> exercises = exerciseService.findExercisesPending(
                userId,
                (name != null) ? name.trim() : null,
                (material != null) ? material.trim() : null,
                ExerciseConversor.convertToMusclesSet(muscles),
                page,
                PAGESIZE
        );

        return ExerciseConversor.toExerciseDtos(exercises);
    }

    /**
     * Get exercise by id (usuarios autenticados).
     */
    @GetMapping("/{id}")
    public ExerciseDto getExercise(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException {

        Exercise exercise = exerciseService.getExercise(userId, id);
        return ExerciseConversor.toExerciseDto(exercise);
    }

    /**
     * Update an existing exercise (ADMIN).
     */
    @PutMapping("/{id}")
    public ExerciseDto updateExercise(@RequestAttribute Long userId,
                                      @PathVariable Long id,
                                      @Validated @RequestBody ExerciseCreateDto exercise)
            throws InstanceNotFoundException, PermissionException {

        ExerciseUpdateDto dto = new ExerciseUpdateDto();
        dto.setName(exercise.getName());
        dto.setMaterial(exercise.getMaterial());
        dto.setStatus(exercise.getStatus());
        dto.setExerciseMuscles(ExerciseConversor.convertToMusclesSet(exercise.getMuscles()));
        dto.setImage(exercise.getImage());
        dto.setDescription(exercise.getDescription());
        dto.setType(exercise.getType());

        // Llamar al servicio con el DTO
        Exercise updated = exerciseService.updateExercise(userId, id, dto);

        return ExerciseConversor.toExerciseDto(updated);
    }

    /**
     * Delete an exercise (ADMIN).
     */
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteExercise(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException, ExerciseInRoutineException {
        exerciseService.deleteExercise(userId, id);
    }

    /**
     * Ranking de peso por ejercicio entre los usuarios seguidos.
     */
    @GetMapping("/{id}/followers/stats")
    public List<ExerciseFollowerStatDto> getFollowersExerciseStats(@RequestAttribute Long userId,
                                                                             @PathVariable("id") Long exerciseId)
            throws InstanceNotFoundException {
        return exerciseService.getFollowersExerciseStats(userId, exerciseId);
    }

    /**
     * Update exercise image.
     */
    @PutMapping("/{id}/image")
    public ExerciseDto updateExerciseImage(
            @RequestAttribute Long userId,
            @PathVariable("id") Long id,
            @Validated @RequestBody UpdateExerciseImageDto imageDto)
            throws InstanceNotFoundException, PermissionException {

        Exercise updated = exerciseService.updateExerciseImage(
                userId,
                id,
                imageDto.getBase64Image(),
                imageDto.getImageMimeType()
        );

        return ExerciseConversor.toExerciseDto(updated);
    }
}
