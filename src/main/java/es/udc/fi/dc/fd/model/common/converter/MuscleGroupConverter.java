package es.udc.fi.dc.fd.model.common.converter;

import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Converter(autoApply = false)
public class MuscleGroupConverter implements AttributeConverter<Set<ExerciseMuscle>, String> {

    @Override
    public String convertToDatabaseColumn(Set<ExerciseMuscle> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "";
        }
        return attribute.stream()
                .map(Enum::name)
                .collect(Collectors.joining(","));
    }

    @Override
    public Set<ExerciseMuscle> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new HashSet<>();
        }
        return Arrays.stream(dbData.split(","))
                .map(String::trim)
                .map(ExerciseMuscle::valueOf)
                .collect(Collectors.toSet());
    }

}
