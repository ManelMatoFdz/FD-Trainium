package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;

/**
 * The Class Routine.
 */
@Entity
public class Routine {

    private Long id;

    private String name;

    private String level;

    private String description;

    private String materials;

    private Users user;

    private Category category;

    private Boolean openPublic;

    private LocalDateTime createdAt;

    private Set<RoutineExercise> exercises = new HashSet<>();

    private Set<Users> savedByUsers = new HashSet<>();

    public Routine() {
    }

    /**
     * Instantiates a new routine.
     *
     * @param name        the name
     * @param level       the level
     * @param description the description
     * @param materials   the materials
     * @param user        the user
     * @param category    the category
     * @param openPublic  the privacity
     */
    public Routine(String name, String level, String description, String materials, Users user, Category category, Boolean openPublic) {
        this.name = name;
        this.level = level;
        this.description = description;
        this.materials = materials;
        this.user = user;
        this.category = category;
        this.openPublic = openPublic;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMaterials() {
        return materials;
    }

    public void setMaterials(String materials) {
        this.materials = materials;
    }

    public Boolean isOpenPublic() {
        return openPublic;
    }

    public void setOpenPublic(Boolean openPublic) {
        this.openPublic = openPublic;
    }

    @Column(name = "createdAt")
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @ManyToOne
    @JoinColumn(name = "userId")
    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    @ManyToOne
    @JoinColumn(name = "categoryId")
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    public Set<RoutineExercise> getExercises() {
        return exercises;
    }

    public void setExercises(Set<RoutineExercise> exercises) {
        this.exercises = exercises;
    }

    @ManyToMany(mappedBy = "savedRoutines", fetch = FetchType.LAZY)
    public Set<Users> getSavedByUsers() {
        return savedByUsers;
    }

    public void setSavedByUsers(Set<Users> savedByUsers) {
        this.savedByUsers = savedByUsers;
    }

    public void addSavedByUser(Users user) {
        this.savedByUsers.add(user);
        user.getSavedRoutines().add(this);
    }

    public void removeSavedByUser(Users user) {
        this.savedByUsers.remove(user);
        user.getSavedRoutines().remove(this);
    }
}
