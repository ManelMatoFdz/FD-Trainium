package es.udc.fi.dc.fd.rest.dtos;

import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.*;

public class RoutineExecutionDtoTest {

    @Test
    public void testNoArgConstructor() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        assertNotNull(dto);
        assertNull(dto.getId());
        assertNull(dto.getRoutineId());
        assertNull(dto.getRoutineName());
        assertNull(dto.getPerformedAt());
        assertNull(dto.getStartedAt());
        assertNull(dto.getFinishedAt());
        assertNull(dto.getTotalDurationSec());
        assertNull(dto.getExercises());
        assertNull(dto.getLikesCount());
        assertNull(dto.getLikedByCurrentUser());
        assertNull(dto.getUserId());
        assertNull(dto.getTotalVolume());
    }

    @Test
    public void testParameterizedConstructor() {
        Long id = 1L;
        Long routineId = 10L;
        String routineName = "Morning Workout";
        LocalDateTime performedAt = LocalDateTime.of(2024, 11, 14, 8, 0);
        LocalDateTime startedAt = LocalDateTime.of(2024, 11, 14, 8, 5);
        LocalDateTime finishedAt = LocalDateTime.of(2024, 11, 14, 9, 0);
        Integer totalDurationSec = 3300;
        List<ExerciseExecutionDto> exercises = Arrays.asList(
            new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Good")
        );
        Long likesCount = 5L;
        Boolean likedByCurrentUser = true;

        RoutineExecutionDto dto = new RoutineExecutionDto(id, routineId, routineName, performedAt,
                                                          startedAt, finishedAt, totalDurationSec,
                                                          exercises, likesCount, likedByCurrentUser);

        assertEquals(id, dto.getId());
        assertEquals(routineId, dto.getRoutineId());
        assertEquals(routineName, dto.getRoutineName());
        assertEquals(performedAt, dto.getPerformedAt());
        assertEquals(startedAt, dto.getStartedAt());
        assertEquals(finishedAt, dto.getFinishedAt());
        assertEquals(totalDurationSec, dto.getTotalDurationSec());
        assertEquals(exercises, dto.getExercises());
        assertEquals(likesCount, dto.getLikesCount());
        assertEquals(likedByCurrentUser, dto.getLikedByCurrentUser());
    }

    @Test
    public void testSetId() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setId(99L);

        assertEquals(Long.valueOf(99L), dto.getId());
    }

    @Test
    public void testSetRoutineId() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setRoutineId(42L);

        assertEquals(Long.valueOf(42L), dto.getRoutineId());
    }

    @Test
    public void testSetRoutineName() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setRoutineName("Evening Workout");

        assertEquals("Evening Workout", dto.getRoutineName());
    }

    @Test
    public void testSetPerformedAt() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        LocalDateTime performedAt = LocalDateTime.of(2024, 11, 15, 10, 30);
        dto.setPerformedAt(performedAt);

        assertEquals(performedAt, dto.getPerformedAt());
    }

    @Test
    public void testSetStartedAt() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        LocalDateTime startedAt = LocalDateTime.of(2024, 11, 15, 10, 35);
        dto.setStartedAt(startedAt);

        assertEquals(startedAt, dto.getStartedAt());
    }

    @Test
    public void testSetFinishedAt() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        LocalDateTime finishedAt = LocalDateTime.of(2024, 11, 15, 11, 35);
        dto.setFinishedAt(finishedAt);

        assertEquals(finishedAt, dto.getFinishedAt());
    }

    @Test
    public void testSetTotalDurationSec() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setTotalDurationSec(3600);

        assertEquals(Integer.valueOf(3600), dto.getTotalDurationSec());
    }

    @Test
    public void testSetExercises() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        ExerciseExecutionDto ex1 = new ExerciseExecutionDto(1L, "Press banca", 3, 10, 50.0, "Set 1");
        ExerciseExecutionDto ex2 = new ExerciseExecutionDto(2L, "Curl bíceps", 4, 12, 60.0, "Set 2");
        List<ExerciseExecutionDto> exercises = Arrays.asList(ex1, ex2);
        
        dto.setExercises(exercises);

        assertNotNull(dto.getExercises());
        assertEquals(2, dto.getExercises().size());
    }

    @Test
    public void testSetLikesCount() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setLikesCount(10L);

        assertEquals(Long.valueOf(10L), dto.getLikesCount());
    }

    @Test
    public void testSetLikedByCurrentUser() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setLikedByCurrentUser(false);

        assertFalse(dto.getLikedByCurrentUser());
        
        dto.setLikedByCurrentUser(true);
        assertTrue(dto.getLikedByCurrentUser());
    }

    @Test
    public void testSetUserId() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setUserId(123L);

        assertEquals(Long.valueOf(123L), dto.getUserId());
    }

    @Test
    public void testConstructorWithNullValues() {
        RoutineExecutionDto dto = new RoutineExecutionDto(null, null, null, null, null, null, null, null, null, null);

        assertNull(dto.getId());
        assertNull(dto.getRoutineId());
        assertNull(dto.getRoutineName());
        assertNull(dto.getPerformedAt());
        assertNull(dto.getStartedAt());
        assertNull(dto.getFinishedAt());
        assertNull(dto.getTotalDurationSec());
        assertNull(dto.getExercises());
        assertNull(dto.getLikesCount());
        assertNull(dto.getLikedByCurrentUser());
    }

    @Test
    public void testEmptyExercisesList() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setExercises(Collections.emptyList());

        assertNotNull(dto.getExercises());
        assertTrue(dto.getExercises().isEmpty());
    }

    @Test
    public void testZeroLikesCount() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setLikesCount(0L);

        assertEquals(Long.valueOf(0L), dto.getLikesCount());
    }

    @Test
    public void testZeroDuration() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setTotalDurationSec(0);

        assertEquals(Integer.valueOf(0), dto.getTotalDurationSec());
    }

    @Test
    public void testAllGettersAndSetters() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        LocalDateTime now = LocalDateTime.now();
        
        dto.setId(1L);
        dto.setRoutineId(10L);
        dto.setRoutineName("Test Routine");
        dto.setPerformedAt(now);
        dto.setStartedAt(now.minusHours(1));
        dto.setFinishedAt(now);
        dto.setTotalDurationSec(3600);
        dto.setExercises(Arrays.asList(new ExerciseExecutionDto()));
        dto.setLikesCount(15L);
        dto.setLikedByCurrentUser(true);
        dto.setUserId(100L);

        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals(Long.valueOf(10L), dto.getRoutineId());
        assertEquals("Test Routine", dto.getRoutineName());
        assertEquals(now, dto.getPerformedAt());
        assertEquals(now.minusHours(1), dto.getStartedAt());
        assertEquals(now, dto.getFinishedAt());
        assertEquals(Integer.valueOf(3600), dto.getTotalDurationSec());
        assertEquals(1, dto.getExercises().size());
        assertEquals(Long.valueOf(15L), dto.getLikesCount());
        assertTrue(dto.getLikedByCurrentUser());
        assertEquals(Long.valueOf(100L), dto.getUserId());
    }

    @Test
    public void testSetTotalVolume() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setTotalVolume(1250.5);

        assertEquals(Double.valueOf(1250.5), dto.getTotalVolume());
    }

    @Test
    public void testSetTotalVolumeZero() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setTotalVolume(0.0);

        assertEquals(Double.valueOf(0.0), dto.getTotalVolume());
    }

    @Test
    public void testSetTotalVolumeNull() {
        RoutineExecutionDto dto = new RoutineExecutionDto();
        dto.setTotalVolume(null);

        assertNull(dto.getTotalVolume());
    }
}
