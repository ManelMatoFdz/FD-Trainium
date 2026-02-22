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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.services.RoutineExecutionService;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyNotLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.CommentDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExecutionConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineExecutionCreateDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExecutionDto;

@RestController
@RequestMapping("/api/routine-executions")
public class RoutineExecutionController {

    private static final String ROUTINE_EXECUTION_NOT_FOUND_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String ROUTINE_EXECUTION_PERMISSION_CODE = "project.exceptions.PermissionException";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private RoutineExecutionService routineExecutionService;

    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                ROUTINE_EXECUTION_NOT_FOUND_CODE, null, ROUTINE_EXECUTION_NOT_FOUND_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(PermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePermissionException(PermissionException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                ROUTINE_EXECUTION_PERMISSION_CODE, null, ROUTINE_EXECUTION_PERMISSION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler({AlreadyLikedException.class, AlreadyNotLikedException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleBadRequest(RuntimeException exception, Locale locale) {
        return new ErrorsDto(exception.getMessage());
    }

    /**
     * Registers a new routine execution (any logged user).
     */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public RoutineExecutionDto registerRoutineExecution(@RequestAttribute Long userId,
                                                        @Validated @RequestBody RoutineExecutionCreateDto executionDto)
            throws PermissionException, InstanceNotFoundException {

        RoutineExecution execution = routineExecutionService.registerRoutineExecution(
                userId,
                executionDto.getRoutineId(),
                RoutineExecutionConversor.toExerciseExecutionEntities(executionDto.getExercises()),
                executionDto.getStartedAt(),
                executionDto.getFinishedAt(),
                executionDto.getTotalDurationSec()
        );

        return RoutineExecutionConversor.toRoutineExecutionDto(execution, userId);
    }

    /**
     * Lists all executions performed by a user.
     */
    @GetMapping("/user")
    public List<RoutineExecutionDto> findRoutineExecutionsByUser(@RequestAttribute Long userId)
            throws PermissionException, InstanceNotFoundException {

        List<RoutineExecution> executions = routineExecutionService.findRoutineExecutionsByUser(userId);
        return executions.stream().map(e -> RoutineExecutionConversor.toRoutineExecutionDto(e, userId)).toList();
    }

    /**
     * Lists all executions performed by the specified user id.
     * This allows viewing another user's public workout history.
     */
    @GetMapping("/user/{id}")
    public List<RoutineExecutionDto> findRoutineExecutionsByUserId(@RequestAttribute Long userId,
                                                                   @PathVariable("id") Long id)
            throws PermissionException, InstanceNotFoundException {
        List<RoutineExecution> executions = routineExecutionService.findRoutineExecutionsByUser(id);
        return executions.stream().map(e -> RoutineExecutionConversor.toRoutineExecutionDto(e, userId)).toList();
    }

    /**
     * Gets the details of a specific routine execution.
     */
    @GetMapping("/{executionId}")
    public RoutineExecutionDto getRoutineExecutionDetails(@RequestAttribute Long userId,
                                                          @PathVariable Long executionId)
            throws PermissionException, InstanceNotFoundException {

        RoutineExecution execution = routineExecutionService.getRoutineExecutionDetails(userId, executionId);
        // Forzar carga de ejercicios antes de mapear
        execution.getExerciseExecutions().size();
        return RoutineExecutionConversor.toRoutineExecutionDto(execution, userId);
    }

    /**
     * Public read-only details of a routine execution (no ownership required).
     */
    @GetMapping("/public/{executionId}")
    public RoutineExecutionDto getRoutineExecutionDetailsPublic(@RequestAttribute Long userId,
                                                                @PathVariable Long executionId)
            throws InstanceNotFoundException {

        RoutineExecution execution = routineExecutionService.getRoutineExecutionDetailsPublic(executionId);
        // Forzar carga de ejercicios antes de mapear
        return RoutineExecutionConversor.toRoutineExecutionDto(execution, userId);
    }

    /** Like a routine execution */
    @PostMapping("/{executionId}/like")
    public RoutineExecutionDto like(@RequestAttribute Long userId, @PathVariable Long executionId)
            throws InstanceNotFoundException {
        RoutineExecution updated = routineExecutionService.likeRoutineExecution(userId, executionId);
        return RoutineExecutionConversor.toRoutineExecutionDto(updated, userId);
    }

    /** Unlike a routine execution */
    @DeleteMapping("/{executionId}/like")
    public RoutineExecutionDto unlike(@RequestAttribute Long userId, @PathVariable Long executionId)
            throws InstanceNotFoundException {
        RoutineExecution updated = routineExecutionService.unlikeRoutineExecution(userId, executionId);
        return RoutineExecutionConversor.toRoutineExecutionDto(updated, userId);
    }

    /** List usernames of users who liked this execution (only owner or admin) */
    @GetMapping("/{executionId}/likes")
    public List<String> getLikers(@RequestAttribute Long userId, @PathVariable Long executionId)
            throws InstanceNotFoundException, PermissionException {
        return routineExecutionService.getRoutineExecutionLikers(userId, executionId);
    }

    // ===== Comments =====
    @GetMapping("/{executionId}/comments")
    public List<CommentDto> getComments(@RequestAttribute Long userId,
                                        @PathVariable Long executionId)
            throws InstanceNotFoundException {
        return RoutineExecutionConversor.toCommentDtos(
                routineExecutionService.findComments(executionId));
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{executionId}/comments")
    public CommentDto addComment(@RequestAttribute Long userId,
                                 @PathVariable Long executionId,
                                 @RequestBody CommentDto body)
            throws InstanceNotFoundException, PermissionException {
        var created = routineExecutionService.addComment(userId, executionId, body != null ? body.getText() : null);
        return RoutineExecutionConversor.toCommentDto(created);
    }

    @PutMapping("/comments/{commentId}")
    public CommentDto updateComment(@RequestAttribute Long userId,
                                    @PathVariable Long commentId,
                                    @RequestBody CommentDto body)
            throws InstanceNotFoundException, PermissionException {
        var updated = routineExecutionService.updateComment(userId, commentId, body != null ? body.getText() : null);
        return RoutineExecutionConversor.toCommentDto(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@RequestAttribute Long userId,
                              @PathVariable Long commentId)
            throws InstanceNotFoundException, PermissionException {
        routineExecutionService.deleteComment(userId, commentId);
    }

}
