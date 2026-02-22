package es.udc.fi.dc.fd.model.services;

import java.util.*;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.rest.dtos.RoutineFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Category;
import es.udc.fi.dc.fd.model.entities.CategoryDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadySavedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {
    private static final String ENTITY_ROUTINE = "project.entities.routine";
    private static final String ENTITY_ROUTINE_SIMPLE = "Routine";
    private static final String ENTITY_USER_ID = "userId";
    private static final String ENTITY_CATEGORY_ID = "categoryId";
    private static final String ENTITY_EXERCISE_ID = "exerciseId";
    private static final String ENTITY_EXERCISE_NOT_APPROVED = "project.entities.exercise.notApproved";

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private CategoryDao categoryDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageSource messageSource;


    /**
     * Find all routines.
     *
     * @return the list of routines
     */
    @Override
    @Transactional(readOnly = true)
    public Block<Routine> findAllRoutines(Long userId, int page, int size) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        List<Routine> routines;
        if (user.isAdmin()) {
            routines = routineDao.findAll();
        } else {
            routines = routineDao.findByOpenPublicTrue();
        }

        int start = page * size;
        if (start >= routines.size()) {
            return new Block<>(List.of(), false);
        }

        int end = Math.min(start + size, routines.size());
        List<Routine> pageContent = routines.subList(start, end);

        boolean hasNext = end < routines.size();

        return new Block<>(pageContent, hasNext);
    }

    @Override
    @Transactional(readOnly = true)
    public Block<Routine> searchRoutines(Long categoryId, String keywords, String level, Set<ExerciseMuscle> exerciseMuscles, int page, int size) {

        List<Routine> openRoutines = routineDao.findByOpenPublicTrue();

        if (categoryId != null) {
            openRoutines = openRoutines.stream()
                    .filter(routine -> routine.getCategory() != null 
                            && routine.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }

        if (level != null && !level.isBlank()) {
            openRoutines = openRoutines.stream()
                    .filter(routine -> routine.getLevel() != null 
                            && routine.getLevel().equalsIgnoreCase(level.trim()))
                    .collect(Collectors.toList());
        }

    if (keywords != null && !keywords.isBlank()) {
            List<String> keywordList = List.of(keywords.toLowerCase().split("\\s+"));
            openRoutines = openRoutines.stream()
                    .filter(routine -> keywordList.stream()
                            .allMatch(keyword -> routine.getName().toLowerCase().contains(keyword)))
                    .collect(Collectors.toList());
        }

    // Filter by muscles based on included exercises (ANY match semantics)
    if (exerciseMuscles != null && !exerciseMuscles.isEmpty()) {
        final Set<ExerciseMuscle> requested = exerciseMuscles;
        // Lazy set of exercises may be empty until fetched; rely on mapped association
        openRoutines = openRoutines.stream()
            .filter(routine -> routine.getExercises() != null && routine.getExercises().stream()
                .map(RoutineExercise::getExercise)
                .filter(Objects::nonNull)
                .anyMatch(ex -> ex.getMuscles() != null && ex.getMuscles().stream().anyMatch(requested::contains)))
            .collect(Collectors.toList());
    }

        int start = page * size;
        if (start >= openRoutines.size()) {
            return new Block<>(List.of(), false);
        }

        int end = Math.min(start + size, openRoutines.size());
        List<Routine> pageContent = openRoutines.subList(start, end);

        boolean hasNext = end < openRoutines.size();

        return new Block<>(pageContent, hasNext);
    }

    /**
     * Find routine by id.
     *
     * @param userId the ids
     * @return the routine
     * @throws InstanceNotFoundException if not found
     */
    @Override
    @Transactional(readOnly = true)
    public Routine findRoutineById(Long userId, Long routineId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        return routineDao.findVisibleByIdAndUserId(routineId, userId, user.isAdmin())
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineExercise> findRoutineExercisesByRoutineId(Long routineId) throws InstanceNotFoundException {
        if (!routineDao.existsById(routineId)) {
            throw new InstanceNotFoundException(ENTITY_ROUTINE_SIMPLE, routineId);
        }
        return routineExerciseDao.findByRoutine_Id(routineId);
    }

    private void checkTrainerLimits(Users user, List<RoutineExercise> res) throws PremiumRequiredException {
        if (user.getRole() == Users.RoleType.TRAINER && !Boolean.TRUE.equals(user.getIsPremium())) {
            int routineCount = routineDao.countByUser(user);
            if (routineCount >= 3) {
                throw new PremiumRequiredException("project.exceptions.PremiumRequiredException.routineLimit");
            }
            if (res != null && res.size() > 5) {
                throw new PremiumRequiredException("project.exceptions.PremiumRequiredException.exercisePerRoutineLimit");
            }
        }
    }

    @Override
    @Transactional
    public Routine createRoutine(String name, String level, String description, String materials, Long userId, Long categoryId, List<RoutineExercise> res, Boolean openPublic) throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException, PremiumRequiredException {

        Users user = permissionChecker.checkUser(userId);
        if (userId!=null){
            user=userDao.findById(userId).orElseThrow(()-> new InstanceNotFoundException(ENTITY_USER_ID, userId));
        }
        Category category = null;
        if (categoryId != null) {
            category = categoryDao.findById(categoryId).orElseThrow(()-> new InstanceNotFoundException(ENTITY_CATEGORY_ID, categoryId));
        }

        if (user.getRole() != Users.RoleType.TRAINER && user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        checkTrainerLimits(user, res);

        Routine routine = new Routine(name, level, description, materials, user, category, openPublic);
        routine = routineDao.save(routine);

        Set<Users> followers = user.getFollowers();
        if (followers != null && !followers.isEmpty()) {
            String title = "New routine";
            String message = "Trainer '" + user.getUserName() + "' has published a new routine: '" + routine.getName() + "'.";
            for (Users follower : followers) {
                Notification notification = new Notification(
                        follower,
                        title,
                        message
                );
                notificationDao.save(notification);
            }
        }

        if (res != null && !res.isEmpty()) {
            return getRoutine(res, routine);
        }

        return routine;
    }

    @Override
    @Transactional
    public Routine updateRoutine(Long routineId, String name, String level, String description, String materials, Long userId, Long categoryId, List<RoutineExercise> newRes, Boolean openPublic) throws PermissionException, InstanceNotFoundException, DuplicateExerciseInRoutineException, PremiumRequiredException {

        Users user = permissionChecker.checkUser(userId);
        Category category = categoryDao.findById(categoryId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_CATEGORY_ID, categoryId));

        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        if (!Objects.equals(routine.getUser().getId(), user.getId()) && user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        checkTrainerLimits(user, newRes);

        routine.setName(name);
        routine.setLevel(level);
        routine.setDescription(description);
        routine.setMaterials(materials);
        routine.setCategory(category);
        routine.setOpenPublic(openPublic);
        routine.getExercises().clear();
        routine = routineDao.save(routine);

        Set<Users> followers = user.getFollowers();
        if (followers != null && !followers.isEmpty()) {
            String title = "New routine";
            String message = "Trainer '" + user.getUserName() + "' has updated the routine: '" + routine.getName() + "'.";

            for (Users follower : followers) {
                Notification notification = new Notification(
                        follower,
                        title,
                        message
                );
                notificationDao.save(notification);
            }
        }

        if (newRes != null && !newRes.isEmpty()) {
            return getRoutine(newRes, routine);
        }

        return routine;

    }

    private Routine getRoutine(List<RoutineExercise> newRes, Routine routine) throws InstanceNotFoundException, DuplicateExerciseInRoutineException {
        Set<Long> seenExerciseIds = new HashSet<>();
        Set<RoutineExercise> savedExercises = new HashSet<>();

        for (RoutineExercise routineExercise : newRes) {
            Long exerciseId = routineExercise.getExerciseId();
            assertUniqueExerciseId(seenExerciseIds, exerciseId);

            Exercise exercise = getApprovedExerciseOrThrow(exerciseId);
            normalizeRoutineExerciseFields(routineExercise, exercise, exerciseId);

            savedExercises.add(saveRoutineExercise(routineExercise, routine, exercise));
        }

        attachExercisesToRoutine(routine, savedExercises);
        return routineDao.save(routine);
    }

    private void assertUniqueExerciseId(Set<Long> seenExerciseIds, Long exerciseId)
            throws DuplicateExerciseInRoutineException {
        if (!seenExerciseIds.add(exerciseId)) {
            throw new DuplicateExerciseInRoutineException(exerciseId);
        }
    }

    private Exercise getApprovedExerciseOrThrow(Long exerciseId) throws InstanceNotFoundException {
        Exercise exercise = exerciseDao.findById(exerciseId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_EXERCISE_ID, exerciseId));

        if (exercise.getStatus() != ExerciseStatus.APPROVED) {
            throw new InstanceNotFoundException(ENTITY_EXERCISE_NOT_APPROVED, exerciseId);
        }

        return exercise;
    }

    private void normalizeRoutineExerciseFields(RoutineExercise routineExercise, Exercise exercise, Long exerciseId) {
        if (exercise.getType() == ExerciseType.CARDIO) {
            normalizeCardioRoutineExercise(routineExercise);
            return;
        }

        normalizeNonCardioRoutineExercise(routineExercise, exerciseId);
    }

    private void normalizeCardioRoutineExercise(RoutineExercise routineExercise) {
        Double distanceMeters = routineExercise.getDistanceMeters();
        Integer durationSeconds = routineExercise.getDurationSeconds();

        // Soportar valores antiguos guardados en sets/repetitions
        if (distanceMeters == null && routineExercise.getSets() != null) {
            distanceMeters = routineExercise.getSets().doubleValue();
        }
        if (durationSeconds == null) {
            durationSeconds = routineExercise.getRepetitions();
        }

        if (distanceMeters != null && distanceMeters <= 0) {
            distanceMeters = null;
        }
        if (durationSeconds != null && durationSeconds < 0) {
            durationSeconds = null;
        }

        routineExercise.setDistanceMeters(distanceMeters);
        routineExercise.setDurationSeconds(durationSeconds);
        routineExercise.setSets(null);
        routineExercise.setRepetitions(null);
    }

    private void normalizeNonCardioRoutineExercise(RoutineExercise routineExercise, Long exerciseId) {
        Integer repetitions = routineExercise.getRepetitions();
        Integer sets = routineExercise.getSets();

        if (repetitions == null || repetitions <= 0 || sets == null || sets <= 0) {
            throw new IllegalArgumentException(
                    "Repetitions and sets are required for non-cardio exercises. ExerciseId=" + exerciseId);
        }

        routineExercise.setDistanceMeters(null);
        routineExercise.setDurationSeconds(null);
    }

    private RoutineExercise saveRoutineExercise(RoutineExercise routineExercise, Routine routine, Exercise exercise) {
        routineExercise.setExercise(exercise);
        routineExercise.setRoutine(routine);
        return routineExerciseDao.save(routineExercise);
    }

    private void attachExercisesToRoutine(Routine routine, Set<RoutineExercise> savedExercises) {
        Set<RoutineExercise> newExercises = routine.getExercises();
        newExercises.addAll(savedExercises);
        routine.setExercises(newExercises);
    }

    @Override
    @Transactional
    public void deleteRoutine(Long routineId, Long userId)
            throws PermissionException, InstanceNotFoundException {

        Users user = permissionChecker.checkUser(userId);

        Routine routine = routineDao.findVisibleByIdAndUserId(routineId, userId, user.isAdmin())
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        // Comprobar permisos
        if (!Objects.equals(routine.getUser().getId(), user.getId()) &&
                user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        // Eliminar rutina
        routineDao.deleteById(routineId);
    }


    @Override
    @Transactional(readOnly = true)
    public Block<Routine> myRoutines(Long userId, int page, int size) throws InstanceNotFoundException, PermissionException {
        Users user = permissionChecker.checkUser(userId);

        if (user.getRole() != Users.RoleType.TRAINER && user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        List<Routine> routines = routineDao.findByUser(user);

        int start = page * size;
        if (start >= routines.size()) {
            return new Block<>(List.of(), false);
        }

        int end = Math.min(start + size, routines.size());
        List<Routine> pageContent = routines.subList(start, end);

        boolean hasNext = end < routines.size();

        return new Block<>(pageContent, hasNext);
    }

    /**
     * Save routine.
     *
     * @param userId    the user id
     * @param routineId the routine id
     * @throws InstanceNotFoundException if user or routine not found
     */
    @Override
    @Transactional
    public Routine saveRoutine(Long userId, Long routineId) throws InstanceNotFoundException, AlreadySavedException {
        Users user = permissionChecker.checkUser(userId);

        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        boolean alreadySaved = user.getSavedRoutines().stream().anyMatch(r -> r.getId().equals(routineId));

        if (alreadySaved) {
            throw new AlreadySavedException();
        }

        user.addSavedRoutine(routine);
        userDao.save(user);

        var locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage("notification.routine.saved.title", null, locale);
        String message = messageSource.getMessage(
                "notification.routine.saved.message",
                new Object[]{ routine.getName(), user.getUserName() },
                locale);
        Notification notification = new Notification(routine.getUser(), title, message);
        notificationDao.save(notification);

        return routine;
    }

    /**
     * Unsave routine.
     *
     * @param userId    the user id
     * @param routineId the routine id
     * @throws InstanceNotFoundException if user or routine not found
     */
    @Override
    @Transactional
    public Routine unsaveRoutine(Long userId, Long routineId) throws InstanceNotFoundException, AlreadySavedException {
        Users user = permissionChecker.checkUser(userId);

        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        boolean alreadySaved = user.getSavedRoutines().stream().anyMatch(r -> r.getId().equals(routineId));
        if (!alreadySaved) {
            // Siguiendo la convención existente: se usa AlreadySavedException también para el caso inverso
            throw new AlreadySavedException();
        }

        user.removeSavedRoutine(routine);
        userDao.save(user);
        return routine;
    }

    /**
     * Find routines by user id.
     *
     * @param userId the user id
     * @return the list of routines
     * @throws InstanceNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public Block<Routine> findRoutinesByUserId(Long userId, int page, int size) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        List<Routine> routines = user.getSavedRoutines().stream().toList();

        int start = page * size;
        if (start >= routines.size()) {
            return new Block<>(List.of(), false);
        }

        int end = Math.min(start + size, routines.size());
        List<Routine> pageContent = routines.subList(start, end);

        boolean hasNext = end < routines.size();

        return new Block<>(pageContent, hasNext);
    }

    @Override
    @Transactional(readOnly = true)
    public Block<Users> findUsersWhoSavedRoutine(Long trainerId, Long routineId, int page, int size)
            throws InstanceNotFoundException, PermissionException {

        Users trainer = permissionChecker.checkUser(trainerId);

        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));

        if (!trainer.isAdmin() && (trainer.getId() == null || !routine.getUser().getId().equals(trainer.getId()))) {
            throw new PermissionException();
        }

        List<Users> allUsers = routine.getSavedByUsers().stream().toList();

        int start = page * size;
        int end = Math.min(start + size, allUsers.size());

        if (start >= allUsers.size()) {
            return new Block<>(Collections.emptyList(), false);
        }

        List<Users> pagedUsers = allUsers.subList(start, end);
        boolean existMoreItems = end < allUsers.size();

        return new Block<>(pagedUsers, existMoreItems);
    }
    @Override
    @Transactional(readOnly = true)
    public Users getCreator(Long routineId) throws InstanceNotFoundException {
        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_ROUTINE, routineId));
        return routine.getUser();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Routine> findUserPerformedRoutines(Long userId) throws InstanceNotFoundException {
        permissionChecker.checkUser(userId);
        return routineExecutionDao.findDistinctRoutinesByUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineFollowerStatDto> getFollowersRoutineStats(Long requesterId, Long routineId)
            throws InstanceNotFoundException {

        Users requester = permissionChecker.checkUser(requesterId);
        if (!routineDao.existsById(routineId)) {
            throw new InstanceNotFoundException(ENTITY_ROUTINE, routineId);
        }

        Set<Users> following = requester.getFollowing();

        Set<Long> targetIds = new java.util.LinkedHashSet<>();
        targetIds.add(requesterId);
        if (following != null) {
            following.stream()
                    .map(Users::getId)
                    .forEach(targetIds::add);
        }

        List<RoutineFollowerStatDto> allStats = routineExecutionDao.findFollowerRoutineStats(routineId, List.copyOf(targetIds));

        // Group by user and find max volume
        Map<Long, RoutineFollowerStatDto> maxStatsByUser = new HashMap<>();
        for (RoutineFollowerStatDto stat : allStats) {
            if (!maxStatsByUser.containsKey(stat.getUserId()) ||
                    stat.getTotalVolume() > maxStatsByUser.get(stat.getUserId()).getTotalVolume()) {
                maxStatsByUser.put(stat.getUserId(), stat);
            }
        }

        return maxStatsByUser.values().stream()
                .sorted(Comparator.comparing(RoutineFollowerStatDto::getTotalVolume, Comparator.reverseOrder())
                        .thenComparing(RoutineFollowerStatDto::getLastPerformedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

}
