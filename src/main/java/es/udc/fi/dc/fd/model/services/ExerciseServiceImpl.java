package es.udc.fi.dc.fd.model.services;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.ExerciseExecutionDao;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.rest.dtos.ExerciseFollowerStatDto;
import es.udc.fi.dc.fd.model.services.exceptions.DuplicateExerciseException;
import es.udc.fi.dc.fd.model.services.exceptions.ExerciseInRoutineException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.PremiumRequiredException;
import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.rest.dtos.ExerciseUpdateDto;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {
    private static final String ENTITY_EXERCISE = "project.entities.exercise";

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private ExerciseExecutionDao exerciseExecutionDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    @Transactional(readOnly = true)
    public Block<Exercise> findExercises(Long userId, String name, String material, Set<ExerciseMuscle>  exerciseMuscles, int page, int size)
            throws PermissionException, InstanceNotFoundException {

        permissionChecker.checkUser(userId);

        Slice<Exercise> slice = exerciseDao.find(name, material, exerciseMuscles, page, size);
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public Block<Exercise> findExercisesPending(Long userId, String name, String material, Set<ExerciseMuscle>  exerciseMuscles, int page, int size)
            throws PermissionException, InstanceNotFoundException {

        Users user = permissionChecker.checkUser(userId);
        if (user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        Slice<Exercise> slice = exerciseDao.findPending(name, material, exerciseMuscles, page, size);
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    @Transactional
    public Exercise createExercise(Long userId, String name, String material, Set<ExerciseMuscle> exerciseMuscles, String image, String description, ExerciseType type)
            throws PermissionException, InstanceNotFoundException, DuplicateExerciseException, PremiumRequiredException {

        Users user = permissionChecker.checkUser(userId);
        if (user.getRole() != Users.RoleType.TRAINER && user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }
        if (user.getRole() == Users.RoleType.TRAINER && !Boolean.TRUE.equals(user.getIsPremium())) {
            throw new PremiumRequiredException("project.exceptions.PremiumRequiredException.exerciseCreation");
        }
        if (exerciseDao.existsByNameIgnoreCase(name.trim())) {
            throw new DuplicateExerciseException("Ya existe un ejercicio con el nombre '" + name + "'");
        }

        ExerciseStatus status = (user.getRole() == Users.RoleType.ADMIN) ? ExerciseStatus.APPROVED : ExerciseStatus.PENDING;
        
        Exercise exercise = new Exercise(name, material, status, exerciseMuscles, image, description);
        exercise.setType(type != null ? type : ExerciseType.REPS);
        return exerciseDao.save(exercise);
    }

    @Override
    @Transactional(readOnly = true)
    public Exercise getExercise(Long userId, Long id)
            throws InstanceNotFoundException {

        permissionChecker.checkUser(userId);

        return exerciseDao.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_EXERCISE, id));
    }

    @Override
    @Transactional
    public Exercise updateExercise(Long userId, Long id, ExerciseUpdateDto dto)
            throws InstanceNotFoundException, PermissionException {

        Users user = permissionChecker.checkUser(userId);
        if (user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        Exercise exercise = exerciseDao.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_EXERCISE, id));

        exercise.setName(dto.getName());
        exercise.setMaterial(dto.getMaterial());
        exercise.setStatus(dto.getStatus());
        exercise.setMuscles(dto.getExerciseMuscles());
        exercise.setImage(dto.getImage());
        exercise.setDescription(dto.getDescription());
        if (dto.getType() != null) {
            exercise.setType(dto.getType());
        }


        return exerciseDao.save(exercise);
    }

    @Override
    @Transactional
    public void deleteExercise(Long userId, Long id)
            throws InstanceNotFoundException, PermissionException, ExerciseInRoutineException {

        Users user = permissionChecker.checkUser(userId);

        if (user.getRole() != Users.RoleType.ADMIN) {
            throw new PermissionException();
        }

        Exercise exercise = exerciseDao.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_EXERCISE, id));
        List<RoutineExercise> res = routineExerciseDao.findByExercise_Id(id);

        if (res != null && !res.isEmpty()) {
            throw new ExerciseInRoutineException(exercise.getId());
        }

        exerciseDao.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseFollowerStatDto> getFollowersExerciseStats(Long requesterId, Long exerciseId)
            throws InstanceNotFoundException {

        Users requester = permissionChecker.checkUser(requesterId);
        if (!exerciseDao.existsById(exerciseId)) {
            throw new InstanceNotFoundException(ENTITY_EXERCISE, exerciseId);
        }

        Set<Users> following = requester.getFollowing();

        Set<Long> targetIds = new java.util.LinkedHashSet<>();
        targetIds.add(requesterId); 
        if (following != null) {
            following.stream()
                    .map(Users::getId)
                    .forEach(targetIds::add);
        }

        return exerciseExecutionDao.findFollowerExerciseStats(exerciseId, List.copyOf(targetIds));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Exercise> findUserPerformedExercises(Long userId) throws InstanceNotFoundException {
        permissionChecker.checkUser(userId);
        return exerciseExecutionDao.findDistinctExercisesByUser(userId);
    }

    @Override
    @Transactional
    public Exercise updateExerciseImage(Long userId, Long exerciseId, String base64Image, String imageMimeType)
            throws InstanceNotFoundException, PermissionException {

        Users user = permissionChecker.checkUser(userId);
        if (user.getRole() != Users.RoleType.ADMIN && user.getRole() != Users.RoleType.TRAINER) {
            throw new PermissionException();
        }

        Exercise exercise = exerciseDao.findById(exerciseId)
                .orElseThrow(() -> new InstanceNotFoundException(ENTITY_EXERCISE, exerciseId));

        ExerciseStatus currentStatus = exercise.getStatus();

        if (checkExerciseImage(base64Image)) {
            if (!base64Image.startsWith("data:image")) {
                base64Image = "data:" + imageMimeType + ";base64," + base64Image;
            }
            exercise.setImage(base64Image);
            exercise.setImageMimeType(imageMimeType);
        } else {
            exercise.setImage(null);
            exercise.setImageMimeType(null);
        }

        exercise.setStatus(currentStatus);

        return exerciseDao.save(exercise);
    }

    // validación imagen
    private boolean checkExerciseImage(String base64Image) {
        return base64Image != null && !base64Image.isBlank();
    }
}
