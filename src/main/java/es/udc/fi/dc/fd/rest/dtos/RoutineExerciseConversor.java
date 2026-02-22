package es.udc.fi.dc.fd.rest.dtos;

import java.util.*;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;

public class RoutineExerciseConversor {

    private RoutineExerciseConversor() {}

    public static RoutineExerciseDetailDto toDto(RoutineExercise entity) {
        if (entity == null) {
            return null;
        }
        Exercise exercise = entity.getExercise();
        Double distance = null;
        if (entity.getDistanceMeters() != null) {
            distance = entity.getDistanceMeters();
        } else if (entity.getSets() != null) {
            distance = entity.getSets().doubleValue();
        }
        Integer durationSeconds = entity.getDurationSeconds() != null ? entity.getDurationSeconds() : entity.getRepetitions();

        return RoutineExerciseDetailDto.builder()
            .id(entity.getExerciseId())
            .name(exercise.getName())
            .repetitions(entity.getRepetitions())
            .sets(entity.getSets())
            .distanceMeters(distance)
            .durationSeconds(durationSeconds)
            .material(entity.getMaterial())
            .type(exercise.getType() != null ? exercise.getType().name() : "REPS")
            .muscles(Optional.ofNullable(exercise.getMuscles())
                .orElseGet(Set::of)
                .stream()
                .map(Enum::name)
                .collect(Collectors.toList()))
            .image(exercise.getImage())
            .description(exercise.getDescription())
            .status(exercise.getStatus())
            .build();
    }

    public static List<RoutineExerciseDetailDto> toDtoList(List<RoutineExercise> entities) {
        if (entities == null) {
            return List.of(); // Devuelve una lista vacía si es null
        }
        return entities.stream()
                .map(RoutineExerciseConversor::toDto)
                .collect(Collectors.toList());
    }

    public static List<RoutineExercise> toEntityList(List<RoutineExerciseDetailDto> dtos) {
        if (dtos == null) {
            return List.of();
        }

        return dtos.stream()
                .map(RoutineExerciseConversor::toEntity)
                .collect(Collectors.toList());
    }

    private static RoutineExercise toEntity(RoutineExerciseDetailDto dto) {

        RoutineExercise entity = new RoutineExercise();
        Exercise exerciseProxy = new Exercise();
        exerciseProxy.setId(dto.getId());
        entity.setExercise(exerciseProxy);
        entity.setRepetitions(dto.getRepetitions());
        entity.setSets(dto.getSets());
        entity.setDistanceMeters(dto.getDistanceMeters());
        entity.setDurationSeconds(dto.getDurationSeconds());
        entity.setMaterial(dto.getMaterial());

        return entity;
    }

    public static Set<ExerciseMuscle> parseMuscles(List<String> muscles) {
        if (muscles == null || muscles.isEmpty()) {
            return Set.of();
        }

        Set<ExerciseMuscle> result = new HashSet<>();

        muscles.stream()
                .filter(Objects::nonNull)
                .filter(raw -> !raw.isBlank())
                .flatMap(raw -> Arrays.stream(raw.split(",")))
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .forEach(token -> {
                    try {
                        result.add(ExerciseMuscle.valueOf(token.toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                        // ignore invalid values
                    }
                });

        return result;
    }
}
