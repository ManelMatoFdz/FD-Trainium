package es.udc.fi.dc.fd.model.common.enums;

public enum ExerciseMuscle {
    CHEST("Pectorales"),
    BACK("Espalda"),
    SHOULDERS("Hombros"),
    BICEPS("Bíceps"),
    TRICEPS("Tríceps"),
    LEGS("Piernas"),
    GLUTES("Glúteos"),
    ABS("Abdomen"),
    CALVES("Pantorrillas"),
    FOREARMS("Antebrazos");


    private final String name;

    ExerciseMuscle(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return name;
    }
}
