package es.udc.fi.dc.fd.model.services;

import java.util.*;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.events.BadgesEarnedEvent;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyNotLikedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;

/**
 * Implementation of RoutineExecutionService.
 */
@Service
@Transactional
public class RoutineExecutionServiceImpl implements RoutineExecutionService {
    private static final String ENTITY_ROUTINE_EXECUTION = "project.entities.routineExecution";
    private static final String ENTITY_ROUTINE = "project.entities.routine";
    private static final String ENTITY_ROUTINE_EXECUTION_COMMENT = "project.entities.routineExecutionComment";


    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private RoutineExecutionCommentDao commentDao;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Autowired
    private UserService userService;

    @PersistenceContext
    private EntityManager entityManager;


    private List<Long> buildTargetUserIds(Long requesterId) throws PermissionException, InstanceNotFoundException {
        Users requester = permissionChecker.checkUser(requesterId);
        Set<Long> targetIds = new LinkedHashSet<>();
        targetIds.add(requester.getId());

        if (requester.getFollowing() != null) {
            requester.getFollowing()
                    .stream()
                    .map(Users::getId)
                    .forEach(targetIds::add);
        }

        return List.copyOf(targetIds);
    }


    @Override
    @Transactional
    public RoutineExecution registerRoutineExecution(Long userId, Long routineId, List<ExerciseExecution> exercises,
                                                     java.time.LocalDateTime startedAt,
                                                     java.time.LocalDateTime finishedAt,
                                                     Integer totalDurationSec)
            throws PermissionException, InstanceNotFoundException {

        Users user = permissionChecker.checkUser(userId);
        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        List<String> oldBadges = userService.getUserBadges(user.getId());

        // Ranking por rutina (antes)
        List<RoutineFollowerStatDto> routineRankingBefore =
                routineExecutionDao.findFollowerRoutineStats(
                        routineId,
                        buildTargetUserIds(userId)
                );

        // Ranking por ejercicio (antes)
        Map<Long, List<ExerciseFollowerStatDto>> exerciseRankingBefore = new HashMap<>();
        Set<Long> exerciseIds = exercises.stream()
                .map(exec -> exec.getExercise().getId())
                .collect(Collectors.toSet());
        for (Long exerciseId : exerciseIds) {
            exerciseRankingBefore.put(
                    exerciseId,
                    exerciseExecutionDao.findFollowerExerciseStats(
                            exerciseId,
                            buildTargetUserIds(userId)
                    )
            );
        }

        // Crear la ejecución de rutina
        RoutineExecution routineExecution = new RoutineExecution();
        routineExecution.setUser(user);
        routineExecution.setRoutine(routine);
        // Timing info
        if (startedAt != null) routineExecution.setStartedAt(startedAt);
        if (finishedAt != null) routineExecution.setFinishedAt(finishedAt);
        if (totalDurationSec != null) {
            routineExecution.setTotalDurationSec(totalDurationSec);
        } else if (startedAt != null && finishedAt != null) {
            long secs = java.time.Duration.between(startedAt, finishedAt).getSeconds();
            routineExecution.setTotalDurationSec((int) Math.max(0, secs));
        }
        routineExecution = routineExecutionDao.save(routineExecution);

        // Guardar los ejercicios realizados en esa ejecución
        for (ExerciseExecution e : exercises) {
            e.setRoutineExecution(routineExecution);
            exerciseExecutionDao.save(e);
        }
        entityManager.flush();
        entityManager.refresh(routineExecution);

        // Ranking por rutina y ejercicio (después)
        List<RoutineFollowerStatDto> routineRankingAfter =
                routineExecutionDao.findFollowerRoutineStats(routineId, buildTargetUserIds(userId));

        Map<Long, List<ExerciseFollowerStatDto>> exerciseRankingAfter = new HashMap<>();
        for (Long exerciseId : exerciseIds) {
            exerciseRankingAfter.put(
                    exerciseId,
                    exerciseExecutionDao.findFollowerExerciseStats(exerciseId, buildTargetUserIds(userId))
            );
        }

        // Comparar posiciones y notificar si baja
        checkAndNotifyRankingDrop(user, routine, exercises, routineRankingBefore, routineRankingAfter, exerciseRankingBefore, exerciseRankingAfter);

        List<String> newBadges = userService.getUserBadges(user.getId());
        newBadges.removeAll(oldBadges);


        if (!newBadges.isEmpty()) {
            eventPublisher.publishEvent(new BadgesEarnedEvent(this, user, newBadges));
        }
        return routineExecution;
    }

    private void checkAndNotifyRankingDrop(
            Users currentUser,
            Routine routine,
            List<ExerciseExecution> exercises,
            List<RoutineFollowerStatDto> routineRankingBefore,
            List<RoutineFollowerStatDto> routineRankingAfter,
            Map<Long, List<ExerciseFollowerStatDto>> exerciseRankingBefore,
            Map<Long, List<ExerciseFollowerStatDto>> exerciseRankingAfter
    ) throws PermissionException, InstanceNotFoundException {
        notifyRoutineRankingDrops(currentUser, routine, routineRankingBefore, routineRankingAfter);
        notifyExerciseRankingDrops(currentUser, exercises, exerciseRankingBefore, exerciseRankingAfter);
    }

    private void notifyRoutineRankingDrops(Users currentUser, Routine routine,
            List<RoutineFollowerStatDto> before, List<RoutineFollowerStatDto> after)
            throws PermissionException, InstanceNotFoundException {
        Map<Long, Integer> beforeRanks = buildRankMap(before);
        var locale = LocaleContextHolder.getLocale();
        Long routineId = routine.getId();
        Routine managedRoutine = routineDao.findById(routineId).orElseThrow(()
                -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        for (int i = 0; i < after.size(); i++) {
            RoutineFollowerStatDto stat = after.get(i);
            Integer rankBefore = beforeRanks.get(stat.getUserId());
            if (hasDropped(rankBefore, i + 1) && !stat.getUserId().equals(currentUser.getId())) {
                sendRankingDropNotification(stat.getUserId(), managedRoutine.getName(), i + 1, locale);
            }
        }
    }

    private void notifyExerciseRankingDrops(Users currentUser, List<ExerciseExecution> exercises,
            Map<Long, List<ExerciseFollowerStatDto>> before, Map<Long, List<ExerciseFollowerStatDto>> after)
            throws PermissionException, InstanceNotFoundException {
        var locale = LocaleContextHolder.getLocale();

        for (ExerciseExecution exec : exercises) {
            Long exerciseId = exec.getExercise().getId();
            Exercise exercise = exerciseDao.findById(exerciseId).orElseThrow(()
                    -> new InstanceNotFoundException("project.entities.exercise", exerciseId) );
            Map<Long, Integer> beforeRanks = buildExerciseRankMap(before.get(exerciseId));
            List<ExerciseFollowerStatDto> afterList = after.get(exerciseId);

            for (int i = 0; i < afterList.size(); i++) {
                ExerciseFollowerStatDto stat = afterList.get(i);
                Integer rankBefore = beforeRanks.get(stat.getUserId());
                if (hasDropped(rankBefore, i + 1) && !stat.getUserId().equals(currentUser.getId())) {
                    sendRankingDropNotification(stat.getUserId(), exercise.getName(), i + 1, locale);
                }
            }
        }
    }

    private Map<Long, Integer> buildRankMap(List<RoutineFollowerStatDto> ranking) {
        Map<Long, Integer> ranks = new HashMap<>();
        for (int i = 0; i < ranking.size(); i++) {
            ranks.put(ranking.get(i).getUserId(), i + 1);
        }
        return ranks;
    }

    private Map<Long, Integer> buildExerciseRankMap(List<ExerciseFollowerStatDto> ranking) {
        Map<Long, Integer> ranks = new HashMap<>();
        for (int i = 0; i < ranking.size(); i++) {
            ranks.put(ranking.get(i).getUserId(), i + 1);
        }
        return ranks;
    }

    private boolean hasDropped(Integer rankBefore, int rankAfter) {
        return rankBefore != null && rankAfter > rankBefore;
    }

    private void sendRankingDropNotification(Long userId, String itemName, int newRank, java.util.Locale locale)
            throws PermissionException, InstanceNotFoundException {
        Users affectedUser = permissionChecker.checkUser(userId);
        String title = messageSource.getMessage("notification.ranking.down.title", null, locale);
        String message = messageSource.getMessage("notification.ranking.down.message",
                new Object[]{ itemName, newRank }, locale);
        notificationDao.save(new Notification(affectedUser, title, message));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineExecution> findRoutineExecutionsByUser(Long userId)
            throws PermissionException, InstanceNotFoundException {

        permissionChecker.checkUser(userId);
        return routineExecutionDao.findByUser_Id(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineExecution getRoutineExecutionDetails(Long userId, Long routineExecutionId)
            throws PermissionException, InstanceNotFoundException {

        Users user = permissionChecker.checkUser(userId);
        RoutineExecution execution = routineExecutionDao.findById(routineExecutionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, routineExecutionId));

        if (!execution.getUser().getId().equals(user.getId())) {
            throw new PermissionException();
        }
        
        return execution;
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineExecution getRoutineExecutionDetailsPublic(Long routineExecutionId)
            throws InstanceNotFoundException {
        return routineExecutionDao.findById(routineExecutionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, routineExecutionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getRoutineExecutionLikers(Long requesterId, Long routineExecutionId)
            throws InstanceNotFoundException, PermissionException {
        Users requester = permissionChecker.checkUser(requesterId);
        RoutineExecution execution = routineExecutionDao.findById(routineExecutionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, routineExecutionId));
        Users owner = execution.getUser();
        boolean isOwner = owner != null && owner.getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Users.RoleType.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new PermissionException();
        }
        if (execution.getLikedByUsers() == null) return java.util.List.of();
        return execution.getLikedByUsers().stream()
                .map(Users::getUserName)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public long getTotalLikesReceived(Long requesterId, List<RoutineExecution> executions)
            throws InstanceNotFoundException, PermissionException {

        if (executions == null || executions.isEmpty()) {
            return 0;
        }

        long totalLikes = 0;

        for (RoutineExecution exec : executions) {
            List<String> likers = getRoutineExecutionLikers(requesterId, exec.getId());
            totalLikes += likers.size();
        }

        return totalLikes;
    }

    @Override
    @Transactional
    public RoutineExecution likeRoutineExecution(Long userId, Long routineExecutionId)
            throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        RoutineExecution execution = routineExecutionDao.findById(routineExecutionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, routineExecutionId));

        boolean alreadyLiked = execution.getLikedByUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (alreadyLiked) {
            throw new AlreadyLikedException();
        }
        execution.addLikeByUser(user);
        execution = routineExecutionDao.save(execution);
        
        // Notify owner (avoid self-notification)
        if (execution.getUser() != null && !execution.getUser().getId().equals(user.getId())) {
            var locale = LocaleContextHolder.getLocale();
            String title = messageSource.getMessage("notification.workout.liked.title", null, locale);
            String message = messageSource.getMessage(
                    "notification.workout.liked.message",
                    new Object[]{ user.getUserName(), execution.getRoutine().getName() },
                    locale);
            notificationDao.save(new Notification(execution.getUser(), title, message));
        }
        return execution;
    }

    @Override
    @Transactional
    public RoutineExecution unlikeRoutineExecution(Long userId, Long routineExecutionId)
            throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        RoutineExecution execution = routineExecutionDao.findById(routineExecutionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, routineExecutionId));

        boolean liked = execution.getLikedByUsers().removeIf(u -> u.getId().equals(user.getId()));
        if (!liked) {
            throw new AlreadyNotLikedException();
        }
        execution = routineExecutionDao.save(execution);
        return execution;
    }

    @Override
    @Transactional
    public RoutineExecutionComment addComment(Long userId, Long executionId, String text)
            throws InstanceNotFoundException, PermissionException {
        Users author = permissionChecker.checkUser(userId);
        RoutineExecution execution = routineExecutionDao.findById(executionId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, executionId));
        if (text == null || text.isBlank()) {
            throw new PermissionException(); 
        }
        List<String> oldBadges = userService.getUserBadges(author.getId());
        RoutineExecutionComment comment = new RoutineExecutionComment(execution, author, text.trim());
        comment = commentDao.save(comment);

        List<String> newBadges = userService.getUserBadges(author.getId());
        newBadges.removeAll(oldBadges);
        if (!newBadges.isEmpty()) {
            eventPublisher.publishEvent(new BadgesEarnedEvent(this, author, newBadges));
        }
        // Notify owner (avoid self-notification)
        if (execution.getUser() != null && !execution.getUser().getId().equals(author.getId())) {
            var locale = LocaleContextHolder.getLocale();
            String title = messageSource.getMessage("notification.workout.comment.title", null, "New comment", locale);
            String message = messageSource.getMessage(
                    "notification.workout.comment.message",
                    new Object[]{ author.getUserName(), execution.getRoutine().getName() },
                    "User {0} commented your workout",
                    locale);
            notificationDao.save(new Notification(execution.getUser(), title, message));
        }
        return comment;
    }

    @Override
    @Transactional
    public RoutineExecutionComment updateComment(Long userId, Long commentId, String newText)
            throws InstanceNotFoundException, PermissionException {
        Users requester = permissionChecker.checkUser(userId);
        RoutineExecutionComment comment = commentDao.findById(commentId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION_COMMENT, commentId));
        boolean isAuthor = comment.getUser() != null && comment.getUser().getId().equals(requester.getId());
        if (!isAuthor) {
            throw new PermissionException();
        }
        comment.setText(newText != null ? newText.trim() : "");
        return commentDao.save(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineExecutionComment> findComments(Long executionId)
            throws InstanceNotFoundException {
        if (!routineExecutionDao.existsById(executionId)) {
            throw new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION, executionId);
        }
        return commentDao.findByRoutineExecution_IdOrderByCreatedAtDescIdDesc(executionId);
    }

    @Override
    @Transactional
    public void deleteComment(Long requesterId, Long commentId)
            throws InstanceNotFoundException, PermissionException {
        Users requester = permissionChecker.checkUser(requesterId);
        RoutineExecutionComment comment = commentDao.findById(commentId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE_EXECUTION_COMMENT, commentId));
        boolean isAuthor = comment.getUser() != null && comment.getUser().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Users.RoleType.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new PermissionException();
        }
        commentDao.delete(comment);
    }
}
