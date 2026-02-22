package es.udc.fi.dc.fd.rest.dtos;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;

public class RoutineConversor {

    private RoutineConversor() {
    }

    public static RoutineDto toRoutineDto(Routine routine) {
        List<RoutineExercise> routineExercisesList = List.of();
        if (routine != null && routine.getExercises() != null) {
            routineExercisesList = new ArrayList<>(routine.getExercises());
        }

        RoutineDto dto = new RoutineDto(
                routine.getName(),
                routine.getLevel(),
                routine.getDescription(),
                routine.getMaterials(),
                routineExercisesList.stream().map(RoutineExercise::getExerciseId).collect(Collectors.toList()),
                routine.getCategory() != null ? routine.getCategory().getName() : null,
                routine.getCategory() != null ? routine.getCategory().getId() : null,
                routine.getUser() != null ? routine.getUser().getId() : null,
                routine.getUser() != null ? routine.getUser().getUserName() : null,
                routine.isOpenPublic());
        dto.setId(routine.getId());
        return dto;
    }

    public static RoutineDetailDto toRoutineDetailDto(Routine routine) {
        return new RoutineDetailDto(
                routine.getId(),
                routine.getName(),
                routine.getLevel(),
                routine.getDescription(),
                routine.getMaterials(),
                routine.getCategory() != null ? routine.getCategory().getName() : null,
                RoutineExerciseConversor.toDtoList(routine.getExercises().stream().toList()),
                routine.getUser() != null ? routine.getUser().getId() : null,
                routine.getUser() != null ? routine.getUser().getUserName() : null,
                routine.getUser() != null && routine.getUser().getRole() != null ? routine.getUser().getRole().toString() : null,
                routine.isOpenPublic()
        );
    }

    private static List<Long> toExerciseIds(List<RoutineExercise> exercises) {
        return exercises.stream()
                .map(RoutineExercise::getExerciseId)
                .collect(Collectors.toList());
    }

    public static List<RoutineDetailDto> toRoutineDetailDtos(List<Routine> routines) {
        return routines.stream().map(RoutineConversor::toRoutineDetailDto).collect(Collectors.toList());
    }

    public static List<RoutineDto> toRoutineDtos(List<Routine> routines) {
        return routines.stream().map(RoutineConversor::toRoutineDto).collect(Collectors.toList());
    }
}
