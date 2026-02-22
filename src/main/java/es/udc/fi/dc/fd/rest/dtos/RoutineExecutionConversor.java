package es.udc.fi.dc.fd.rest.dtos;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.common.enums.ExerciseType;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseExecution;
import es.udc.fi.dc.fd.model.entities.ExerciseExecutionSet;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionComment;

public class RoutineExecutionConversor {

    private RoutineExecutionConversor() {}

    public static RoutineExecutionDto toRoutineExecutionDto(RoutineExecution execution) {
        return toRoutineExecutionDto(execution, null);
    }

    public static RoutineExecutionDto toRoutineExecutionDto(RoutineExecution execution, Long currentUserId) {
        long likes = execution.getLikedByUsers() != null ? execution.getLikedByUsers().size() : 0L;

        boolean likedByMe =
                currentUserId != null &&
                execution.getLikedByUsers() != null &&
                execution.getLikedByUsers().stream().anyMatch(u -> u.getId().equals(currentUserId));

        RoutineExecutionDto dto = new RoutineExecutionDto(
                execution.getId(),
                execution.getRoutine().getId(),
                execution.getRoutine().getName(),
                execution.getPerformedAt(),
                execution.getStartedAt(),
                execution.getFinishedAt(),
                execution.getTotalDurationSec(),
                toExerciseExecutionDtos(execution.getExerciseExecutions()),
                likes,
                likedByMe
        );

        if (execution.getUser() != null) {
            dto.setUserId(execution.getUser().getId());
        }

        // Calcular volumen total de la ejecución
        dto.setTotalVolume(calculateTotalVolume(execution.getExerciseExecutions()));

        return dto;
    }

    public static List<RoutineExecutionDto> toRoutineExecutionDtos(List<RoutineExecution> executions) {
        return executions.stream()
                .map(RoutineExecutionConversor::toRoutineExecutionDto)
                .collect(Collectors.toList());
    }

    public static CommentDto toCommentDto(RoutineExecutionComment comment) {
        if (comment == null) return null;
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setCreatedAt(comment.getCreatedAt());
        if (comment.getUser() != null) {
            dto.setUserId(comment.getUser().getId());
            dto.setUserName(comment.getUser().getUserName());
        }
        return dto;
    }

    public static List<CommentDto> toCommentDtos(List<RoutineExecutionComment> comments) {
        if (comments == null) return List.of();
        return comments.stream()
                .map(RoutineExecutionConversor::toCommentDto)
                .collect(Collectors.toList());
    }

    public static List<ExerciseExecutionDto> toExerciseExecutionDtos(List<ExerciseExecution> exercises) {
        if (exercises == null) return List.of();

        return exercises.stream()
                .map(e -> {
                    ExerciseExecutionDto dto = new ExerciseExecutionDto(
                            e.getExercise().getId(),
                            e.getExercise().getName(),
                            e.getPerformedSets(),
                            e.getPerformedReps(),
                            e.getWeightUsed(),
                            e.getNotes()
                    );
                    dto.setType(e.getType() != null ? e.getType().name() : null);
                    dto.setDistanceMeters(e.getDistanceMeters());
                    dto.setDurationSeconds(e.getDurationSeconds());

                    if (e.getSetsDetails() != null) {
                        dto.setSetsDetails(
                                e.getSetsDetails().stream()
                                        .map(s -> new ExerciseExecutionSetDto(
                                                s.getSetIndex(),
                                                s.getReps(),
                                                s.getSeconds(),
                                                s.getWeight()))
                                        .collect(Collectors.toList())
                        );
                    }
                    dto.setMuscles(
                            e.getExercise() != null && e.getExercise().getMuscles() != null
                                    ? e.getExercise().getMuscles().stream()
                                    .map(Enum::name)
                                    .collect(Collectors.toList())
                                    : List.of()
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public static List<ExerciseExecution> toExerciseExecutionEntities(List<ExerciseExecutionDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream()
                .map(RoutineExecutionConversor::mapDtoToEntity)
                .collect(Collectors.toList());
    }

    private static ExerciseExecution mapDtoToEntity(ExerciseExecutionDto dto) {
        ExerciseExecution entity = new ExerciseExecution();

        entity.setPerformedSets(dto.getPerformedSets());
        entity.setPerformedReps(dto.getPerformedReps());
        entity.setWeightUsed(dto.getWeightUsed());
        entity.setNotes(dto.getNotes());
        entity.setDistanceMeters(dto.getDistanceMeters());
        entity.setDurationSeconds(dto.getDurationSeconds());

        setExecutionType(entity, dto.getType());

        if (dto.getSetsDetails() != null && !dto.getSetsDetails().isEmpty()) {
            entity.setSetsDetails(mapSetDetails(dto.getSetsDetails(), entity));
        }

        Exercise exercise = new Exercise();
        exercise.setId(dto.getExerciseId());
        entity.setExercise(exercise);

        return entity;
    }

    private static void setExecutionType(ExerciseExecution entity, String type) {
        if (type == null) return;
        try {
            entity.setType(ExerciseType.valueOf(type));
        } catch (IllegalArgumentException ignored) {
            // El tipo recibido no es válido. Se ignora a propósito porque simplemente
            // no queremos asignar un valor inválido y mantener el valor actual.
        }
    }

    private static List<ExerciseExecutionSet> mapSetDetails(
            List<ExerciseExecutionSetDto> setDtos,
            ExerciseExecution parent) {

        List<ExerciseExecutionSet> result = new ArrayList<>();

        for (ExerciseExecutionSetDto s : setDtos) {
            ExerciseExecutionSet row = new ExerciseExecutionSet();
            row.setSetIndex(s.getIndex() != null ? s.getIndex() : (result.size() + 1));
            row.setReps(s.getReps());
            row.setSeconds(s.getSeconds());
            row.setWeight(s.getWeight());
            row.setExerciseExecution(parent);
            result.add(row);
        }

        return result;
    }

    /**
     * Calcula el volumen total (peso × repeticiones) de una ejecución de rutina.
     * @param exercises Lista de ejercicios ejecutados
     * @return Volumen total en kg, o 0.0 si no hay ejercicios
     */
    private static Double calculateTotalVolume(List<ExerciseExecution> exercises) {
        if (exercises == null || exercises.isEmpty()) {
            return 0.0;
        }

        double totalVolume = 0.0;
        for (ExerciseExecution exercise : exercises) {
            totalVolume += calculateExerciseVolume(exercise);
        }
        return totalVolume;
    }

    private static double calculateExerciseVolume(ExerciseExecution exercise) {
        List<ExerciseExecutionSet> sets = exercise.getSetsDetails();
        if (sets != null && !sets.isEmpty()) {
            return calculateVolumeFromSets(sets);
        }
        return calculateVolumeFromAggregates(exercise);
    }

    private static double calculateVolumeFromSets(List<ExerciseExecutionSet> sets) {
        double volume = 0.0;
        for (ExerciseExecutionSet set : sets) {
            double weight = set.getWeight() != null ? set.getWeight() : 0.0;
            int reps = set.getReps() != null ? set.getReps() : 0;
            volume += weight * reps;
        }
        return volume;
    }

    private static double calculateVolumeFromAggregates(ExerciseExecution exercise) {
        if (exercise.getWeightUsed() != null && exercise.getPerformedReps() != null) {
            return exercise.getWeightUsed() * exercise.getPerformedReps();
        }
        return 0.0;
    }
}
