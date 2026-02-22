package es.udc.fi.dc.fd.model.entities;
import es.udc.fi.dc.fd.model.common.enums.ExerciseMuscle;
import es.udc.fi.dc.fd.model.common.enums.ExerciseStatus;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

public class CustomizedExerciseDaoImpl implements CustomizedExerciseDao {

    @PersistenceContext
    private EntityManager entityManager;

    private static boolean hasText(String s) {
        return s != null && !s.isEmpty();
    }

    private static void appendLikeCondition(StringBuilder sb, String field, String param) {
        sb.append(" AND LOWER(").append(field).append(") LIKE LOWER(:").append(param).append(")");
    }

    private static void setLikeParameter(Query q, String param, String value) {
        if (hasText(value)) {
            q.setParameter(param, "%" + value + "%");
        }
    }

    private static List<Exercise> filterByMuscles(List<Exercise> exercises, Set<ExerciseMuscle> exerciseMuscles) {
        if (exerciseMuscles == null || exerciseMuscles.isEmpty()) {
            return exercises;
        }

        return exercises.stream()
                .filter(e -> e.getMuscles() != null && !e.getMuscles().isEmpty()
                        && e.getMuscles().stream().anyMatch(exerciseMuscles::contains))
                .toList();
    }
    @Override
    public Slice<Exercise> find(String name, String material, Set<ExerciseMuscle> exerciseMuscles, int page, int size) {
        return findByStatus(ExerciseStatus.APPROVED, name, material, exerciseMuscles, page, size);
    }

    @Override
    public Slice<Exercise> findPending(String name, String material, Set<ExerciseMuscle> exerciseMuscles, int page, int size) {
        return findByStatus(ExerciseStatus.PENDING, name, material, exerciseMuscles, page, size);
    }

    @SuppressWarnings("unchecked")
    private Slice<Exercise> findByStatus(ExerciseStatus status, String name, String material, Set<ExerciseMuscle> exerciseMuscles, int page, int size) {

        StringBuilder queryString = new StringBuilder("SELECT e FROM Exercise e WHERE e.status = :status");

        if (hasText(name)) {
            appendLikeCondition(queryString, "e.name", "name");
        }
        if (hasText(material)) {
            appendLikeCondition(queryString, "e.material", "material");
        }

        queryString.append(" ORDER BY e.name");

        Query query = entityManager.createQuery(queryString.toString())
            .setParameter("status", status);

        setLikeParameter(query, "name", name);
        setLikeParameter(query, "material", material);

        boolean filterMuscles = exerciseMuscles != null && !exerciseMuscles.isEmpty();

        if (!filterMuscles) {
            query.setFirstResult(page * size);
            query.setMaxResults(size + 1);

            List<Exercise> exercises = query.getResultList();
            boolean hasNext = exercises.size() > size;
            if (hasNext) {
                exercises = exercises.subList(0, size);
            }

            return new SliceImpl<>(exercises, PageRequest.of(page, size), hasNext);
        }

        List<Exercise> exercises = query.getResultList();
        List<Exercise> filtered = filterByMuscles(exercises, exerciseMuscles);

        int startIndex = page * size;
        if (startIndex >= filtered.size()) {
            return new SliceImpl<>(List.of(), PageRequest.of(page, size), false);
        }

        int endIndex = Math.min(startIndex + size, filtered.size());
        boolean hasNext = filtered.size() > endIndex;

        return new SliceImpl<>(filtered.subList(startIndex, endIndex), PageRequest.of(page, size), hasNext);
    }
}
