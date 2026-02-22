export const translateMuscle = (muscle, intl) => {
    const translations = {
        CHEST: intl.formatMessage({ id: 'muscle.chest', defaultMessage: 'Pectorales' }),
        BACK: intl.formatMessage({ id: 'muscle.back', defaultMessage: 'Espalda' }),
        SHOULDERS: intl.formatMessage({ id: 'muscle.shoulders', defaultMessage: 'Hombros' }),
        BICEPS: intl.formatMessage({ id: 'muscle.biceps', defaultMessage: 'Bíceps' }),
        TRICEPS: intl.formatMessage({ id: 'muscle.triceps', defaultMessage: 'Tríceps' }),
        LEGS: intl.formatMessage({ id: 'muscle.legs', defaultMessage: 'Piernas' }),
        GLUTES: intl.formatMessage({ id: 'muscle.glutes', defaultMessage: 'Glúteos' }),
        ABS: intl.formatMessage({ id: 'muscle.abs', defaultMessage: 'Abdomen' }),
        CALVES: intl.formatMessage({ id: 'muscle.calves', defaultMessage: 'Pantorrillas' }),
        FOREARMS: intl.formatMessage({ id: 'muscle.forearms', defaultMessage: 'Antebrazos' }),
    };
    return translations[muscle] || muscle;
};