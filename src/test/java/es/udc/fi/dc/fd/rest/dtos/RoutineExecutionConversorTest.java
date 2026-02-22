package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.model.entities.*;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.Assert.*;

public class RoutineExecutionConversorTest {

    @Test
    public void testToRoutineExecutionDtoBasic() {
        RoutineExecution execution = createMockRoutineExecution();
        
        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        assertNotNull(dto);
        assertEquals(execution.getId(), dto.getId());
        assertEquals(execution.getRoutine().getId(), dto.getRoutineId());
        assertEquals(execution.getRoutine().getName(), dto.getRoutineName());
        assertEquals(execution.getPerformedAt(), dto.getPerformedAt());
        assertEquals(execution.getStartedAt(), dto.getStartedAt());
        assertEquals(execution.getFinishedAt(), dto.getFinishedAt());
        assertEquals(execution.getTotalDurationSec(), dto.getTotalDurationSec());
        assertNotNull(dto.getTotalVolume());
        assertEquals(0.0, dto.getTotalVolume(), 0.001);
    }

    @Test
    public void testToRoutineExecutionDtoWithUserId() {
        RoutineExecution execution = createMockRoutineExecution();
        Long currentUserId = 10L;

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution, currentUserId);

        assertNotNull(dto);
        assertEquals(execution.getId(), dto.getId());
        assertNotNull(dto.getUserId());
    }

    @Test
    public void testToRoutineExecutionDtoWithLikes() {
        RoutineExecution execution = createMockRoutineExecution();
        Users user1 = new Users();
        user1.setId(1L);
        Users user2 = new Users();
        user2.setId(2L);
        Set<Users> likedByUsers = new HashSet<>(Arrays.asList(user1, user2));
        execution.setLikedByUsers(likedByUsers);

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        assertEquals(Long.valueOf(2L), dto.getLikesCount());
    }

    @Test
    public void testToRoutineExecutionDtoLikedByCurrentUser() {
        RoutineExecution execution = createMockRoutineExecution();
        Users user1 = new Users();
        user1.setId(1L);
        Users user2 = new Users();
        user2.setId(2L);
        Set<Users> likedByUsers = new HashSet<>(Arrays.asList(user1, user2));
        execution.setLikedByUsers(likedByUsers);

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution, 1L);

        assertTrue(dto.getLikedByCurrentUser());
    }

    @Test
    public void testToRoutineExecutionDtoNotLikedByCurrentUser() {
        RoutineExecution execution = createMockRoutineExecution();
        Users user1 = new Users();
        user1.setId(1L);
        execution.setLikedByUsers(Collections.singleton(user1));

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution, 99L);

        assertFalse(dto.getLikedByCurrentUser());
    }

    @Test
    public void testToRoutineExecutionDtoWithNullLikes() {
        RoutineExecution execution = createMockRoutineExecution();
        execution.setLikedByUsers(null);

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        assertEquals(Long.valueOf(0L), dto.getLikesCount());
        assertFalse(dto.getLikedByCurrentUser());
    }

    @Test
    public void testToRoutineExecutionDtos() {
        RoutineExecution exec1 = createMockRoutineExecution();
        exec1.setId(1L);
        RoutineExecution exec2 = createMockRoutineExecution();
        exec2.setId(2L);

        List<RoutineExecutionDto> dtos = RoutineExecutionConversor.toRoutineExecutionDtos(Arrays.asList(exec1, exec2));

        assertEquals(2, dtos.size());
        assertEquals(Long.valueOf(1L), dtos.get(0).getId());
        assertEquals(Long.valueOf(2L), dtos.get(1).getId());
    }

    @Test
    public void testToRoutineExecutionDtosEmptyList() {
        List<RoutineExecutionDto> dtos = RoutineExecutionConversor.toRoutineExecutionDtos(Collections.emptyList());

        assertNotNull(dtos);
        assertTrue(dtos.isEmpty());
    }

    @Test
    public void testToExerciseExecutionDtos() {
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        List<ExerciseExecution> exercises = Collections.singletonList(exerciseExec);

        List<ExerciseExecutionDto> dtos = RoutineExecutionConversor.toExerciseExecutionDtos(exercises);

        assertEquals(1, dtos.size());
        assertEquals(exerciseExec.getExercise().getId(), dtos.get(0).getExerciseId());
        assertEquals(exerciseExec.getExercise().getName(), dtos.get(0).getExerciseName());
        assertEquals(exerciseExec.getPerformedSets(), dtos.get(0).getPerformedSets());
        assertEquals(exerciseExec.getPerformedReps(), dtos.get(0).getPerformedReps());
        assertEquals(exerciseExec.getWeightUsed(), dtos.get(0).getWeightUsed());
        assertEquals(exerciseExec.getNotes(), dtos.get(0).getNotes());
    }

    @Test
    public void testToExerciseExecutionDtosWithType() {
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        exerciseExec.setType(ExerciseType.REPS);
        List<ExerciseExecution> exercises = Collections.singletonList(exerciseExec);

        List<ExerciseExecutionDto> dtos = RoutineExecutionConversor.toExerciseExecutionDtos(exercises);

        assertEquals("REPS", dtos.get(0).getType());
    }

    @Test
    public void testToExerciseExecutionDtosWithSetsDetails() {
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        ExerciseExecutionSet set1 = new ExerciseExecutionSet();
        set1.setSetIndex(1);
        set1.setReps(10);
        set1.setWeight(50.0);
        exerciseExec.setSetsDetails(Collections.singletonList(set1));

        List<ExerciseExecution> exercises = Collections.singletonList(exerciseExec);
        List<ExerciseExecutionDto> dtos = RoutineExecutionConversor.toExerciseExecutionDtos(exercises);

        assertNotNull(dtos.get(0).getSetsDetails());
        assertEquals(1, dtos.get(0).getSetsDetails().size());
        assertEquals(Integer.valueOf(1), dtos.get(0).getSetsDetails().get(0).getIndex());
        assertEquals(Integer.valueOf(10), dtos.get(0).getSetsDetails().get(0).getReps());
    }

    @Test
    public void testToExerciseExecutionDtosNull() {
        List<ExerciseExecutionDto> dtos = RoutineExecutionConversor.toExerciseExecutionDtos(null);

        assertNotNull(dtos);
        assertTrue(dtos.isEmpty());
    }

    @Test
    public void testToExerciseExecutionEntities() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Notes");
        List<ExerciseExecutionDto> dtos = Collections.singletonList(dto);

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(dtos);

        assertEquals(1, entities.size());
        assertEquals(dto.getPerformedSets(), entities.get(0).getPerformedSets());
        assertEquals(dto.getPerformedReps(), entities.get(0).getPerformedReps());
        assertEquals(dto.getWeightUsed(), entities.get(0).getWeightUsed());
        assertEquals(dto.getNotes(), entities.get(0).getNotes());
        assertEquals(dto.getExerciseId(), entities.get(0).getExercise().getId());
    }

    @Test
    public void testToExerciseExecutionEntitiesWithType() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Notes");
        dto.setType("REPS");
        List<ExerciseExecutionDto> dtos = Collections.singletonList(dto);

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(dtos);

        assertEquals(ExerciseType.REPS, entities.get(0).getType());
    }

    @Test
    public void testToExerciseExecutionEntitiesWithInvalidType() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Notes");
        dto.setType("INVALID_TYPE");
        List<ExerciseExecutionDto> dtos = Collections.singletonList(dto);

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(dtos);

        assertNull(entities.get(0).getType());
    }

    @Test
    public void testToExerciseExecutionEntitiesWithSetsDetails() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Notes");
        ExerciseExecutionSetDto setDto = new ExerciseExecutionSetDto(1, 10, null, 50.0);
        dto.setSetsDetails(Collections.singletonList(setDto));

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(Collections.singletonList(dto));

        assertNotNull(entities.get(0).getSetsDetails());
        assertEquals(1, entities.get(0).getSetsDetails().size());
        assertEquals(1, entities.get(0).getSetsDetails().get(0).getSetIndex());
        assertEquals(10, entities.get(0).getSetsDetails().get(0).getReps().intValue());
    }

    @Test
    public void testToExerciseExecutionEntitiesWithNullIndex() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Notes");
        ExerciseExecutionSetDto setDto = new ExerciseExecutionSetDto(null, 10, null, 50.0);
        dto.setSetsDetails(Collections.singletonList(setDto));

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(Collections.singletonList(dto));

        assertEquals(1, entities.get(0).getSetsDetails().get(0).getSetIndex());
    }

    @Test
    public void testCardioFieldsToDto() {
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        exerciseExec.setType(ExerciseType.CARDIO);
        exerciseExec.setDistanceMeters(2500.0);
        exerciseExec.setDurationSeconds(900);
        exerciseExec.setSetsDetails(Collections.emptyList());

        List<ExerciseExecutionDto> dtos = RoutineExecutionConversor.toExerciseExecutionDtos(Collections.singletonList(exerciseExec));

        assertEquals("CARDIO", dtos.get(0).getType());
        assertEquals(Double.valueOf(2500.0), dtos.get(0).getDistanceMeters());
        assertEquals(Integer.valueOf(900), dtos.get(0).getDurationSeconds());
    }

    @Test
    public void testCardioFieldsToEntity() {
        ExerciseExecutionDto dto = new ExerciseExecutionDto(1L, "Correr", null, null, null, "Notas cardio");
        dto.setType("CARDIO");
        dto.setDistanceMeters(4000.0);
        dto.setDurationSeconds(1500);

        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(Collections.singletonList(dto));

        ExerciseExecution entity = entities.get(0);
        assertEquals(ExerciseType.CARDIO, entity.getType());
        assertEquals(Double.valueOf(4000.0), entity.getDistanceMeters());
        assertEquals(Integer.valueOf(1500), entity.getDurationSeconds());
    }

    @Test
    public void testToExerciseExecutionEntitiesNull() {
        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(null);

        assertNotNull(entities);
        assertTrue(entities.isEmpty());
    }

    @Test
    public void testToExerciseExecutionEntitiesEmptyList() {
        List<ExerciseExecution> entities = RoutineExecutionConversor.toExerciseExecutionEntities(Collections.emptyList());

        assertNotNull(entities);
        assertTrue(entities.isEmpty());
    }

    // Helper methods
    private RoutineExecution createMockRoutineExecution() {
        RoutineExecution execution = new RoutineExecution();
        execution.setId(1L);
        execution.setPerformedAt(LocalDateTime.now());
        execution.setStartedAt(LocalDateTime.now().minusHours(1));
        execution.setFinishedAt(LocalDateTime.now());
        execution.setTotalDurationSec(3600);
        execution.setExerciseExecutions(new ArrayList<>());
        execution.setLikedByUsers(new HashSet<>());

        Routine routine = new Routine();
        routine.setId(10L);
        routine.setName("Test Routine");
        execution.setRoutine(routine);

        Users user = new Users();
        user.setId(100L);
        execution.setUser(user);

        return execution;
    }

    private ExerciseExecution createMockExerciseExecution() {
        ExerciseExecution exerciseExec = new ExerciseExecution();
        Exercise exercise = new Exercise();
        exercise.setId(5L);
        exercise.setName("Press banca");
        exerciseExec.setExercise(exercise);
        exerciseExec.setPerformedSets(3);
        exerciseExec.setPerformedReps(10);
        exerciseExec.setWeightUsed(50.0);
        exerciseExec.setNotes("Test notes");
        return exerciseExec;
    }

    @Test
    public void testToRoutineExecutionDtoWithVolumeFromWeightAndReps() {
        RoutineExecution execution = createMockRoutineExecution();
        ExerciseExecution exerciseExec1 = createMockExerciseExecution();
        exerciseExec1.setWeightUsed(50.0);
        exerciseExec1.setPerformedReps(10);
        
        ExerciseExecution exerciseExec2 = createMockExerciseExecution();
        exerciseExec2.setWeightUsed(60.0);
        exerciseExec2.setPerformedReps(12);
        
        execution.setExerciseExecutions(Arrays.asList(exerciseExec1, exerciseExec2));

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        // Volumen esperado: (50.0 * 10) + (60.0 * 12) = 500 + 720 = 1220.0
        assertEquals(1220.0, dto.getTotalVolume(), 0.001);
    }

    @Test
    public void testToRoutineExecutionDtoWithVolumeFromSetsDetails() {
        RoutineExecution execution = createMockRoutineExecution();
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        
        ExerciseExecutionSet set1 = new ExerciseExecutionSet();
        set1.setSetIndex(1);
        set1.setReps(10);
        set1.setWeight(50.0);
        
        ExerciseExecutionSet set2 = new ExerciseExecutionSet();
        set2.setSetIndex(2);
        set2.setReps(8);
        set2.setWeight(55.0);
        
        exerciseExec.setSetsDetails(Arrays.asList(set1, set2));
        execution.setExerciseExecutions(Collections.singletonList(exerciseExec));

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        // Volumen esperado: (50.0 * 10) + (55.0 * 8) = 500 + 440 = 940.0
        assertEquals(940.0, dto.getTotalVolume(), 0.001);
    }

    @Test
    public void testToRoutineExecutionDtoWithVolumeMixed() {
        RoutineExecution execution = createMockRoutineExecution();
        
        // Ejercicio con setsDetails
        ExerciseExecution exerciseExec1 = createMockExerciseExecution();
        ExerciseExecutionSet set1 = new ExerciseExecutionSet();
        set1.setSetIndex(1);
        set1.setReps(10);
        set1.setWeight(50.0);
        exerciseExec1.setSetsDetails(Collections.singletonList(set1));
        
        // Ejercicio sin setsDetails (usa weightUsed y performedReps)
        ExerciseExecution exerciseExec2 = createMockExerciseExecution();
        exerciseExec2.setWeightUsed(60.0);
        exerciseExec2.setPerformedReps(12);
        
        execution.setExerciseExecutions(Arrays.asList(exerciseExec1, exerciseExec2));

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        // Volumen esperado: (50.0 * 10) + (60.0 * 12) = 500 + 720 = 1220.0
        assertEquals(1220.0, dto.getTotalVolume(), 0.001);
    }

    @Test
    public void testToRoutineExecutionDtoWithVolumeNullValues() {
        RoutineExecution execution = createMockRoutineExecution();
        ExerciseExecution exerciseExec = createMockExerciseExecution();
        exerciseExec.setWeightUsed(null);
        exerciseExec.setPerformedReps(null);
        exerciseExec.setSetsDetails(null);
        execution.setExerciseExecutions(Collections.singletonList(exerciseExec));

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        assertEquals(0.0, dto.getTotalVolume(), 0.001);
    }

    @Test
    public void testToRoutineExecutionDtoWithVolumeEmptyExercises() {
        RoutineExecution execution = createMockRoutineExecution();
        execution.setExerciseExecutions(Collections.emptyList());

        RoutineExecutionDto dto = RoutineExecutionConversor.toRoutineExecutionDto(execution);

        assertEquals(0.0, dto.getTotalVolume(), 0.001);
    }
}
