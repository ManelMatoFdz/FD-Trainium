package es.udc.fi.dc.fd.rest.dtos;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.services.Block;
import java.util.Objects;


public class ExerciseConversor {

    private ExerciseConversor() {}

    public static ExerciseDto toExerciseDto(Exercise exercise) {
        return ExerciseDto.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .material(exercise.getMaterial())
                .status(exercise.getStatus())
                .muscles(exercise.getMuscles().stream().map(Enum::name).collect(Collectors.toList()))
                .image(exercise.getImage())
                .description(exercise.getDescription())
                .type(exercise.getType())
                .imageMimeType(exercise.getImageMimeType())
                .build();
    }

    public static List<ExerciseDto> toExerciseDtos(List<Exercise> exercises) {
        return exercises.stream().map(ExerciseConversor::toExerciseDto).collect(Collectors.toList());
    }

    public static Block<ExerciseDto> toExerciseDtos(Block<Exercise> exerciseBlock) {
        return new Block<>(
                toExerciseDtos(exerciseBlock.getItems()),
                exerciseBlock.getExistMoreItems()
        );
    }

    public static Set<ExerciseMuscle> convertToMusclesSet(String muscles) {
        if (muscles == null || muscles.isBlank()) {
            return new HashSet<>();
        }
        return Arrays.stream(muscles.split(","))
                .map(String::trim)
                .map(ExerciseMuscle::valueOf)
                .collect(Collectors.toSet());
    }

    public static Set<ExerciseMuscle> convertToMusclesSet(List<String> muscles) {
        if (muscles == null || muscles.isEmpty()) {
            return new HashSet<>();
        }

        return muscles.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(ExerciseMuscle::valueOf)
                .collect(Collectors.toSet());
    }
}
