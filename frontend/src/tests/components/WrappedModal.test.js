import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import WrappedModal from '../../modules/users/components/WrappedModal';
import { getWrapped } from '../../backend/userService';

// Mock userService
jest.mock('../../backend/userService', () => ({
    getWrapped: jest.fn()
}));

const mockWrappedData = {
    topExercises: [
        { name: 'Sentadillas', count: 10 },
        { name: 'Press Banca', count: 8 }
    ],
    topRoutines: [
        { name: 'Rutina Fuerza', count: 5 }
    ],
    topTrainers: [
        { userName: 'Entrenador1', routineCount: 3 }
    ],
    bestFriend: { userName: 'AmigoFitness', interactionCount: 20 },
    totalKgLifted: 5000,
    kgComparison: 'un coche',
    totalHoursTrained: 100
};

const messages = {
    "project.wrapped.title": "Tu Año Fitness",
    "project.wrapped.subtitle": "Descubre tus logros del año",
    "project.wrapped.topExercises": "Tus ejercicios favoritos",
    "project.wrapped.noExercises": "No hay ejercicios registrados",
    "project.wrapped.topRoutines": "Tus rutinas más usadas",
    "project.wrapped.noRoutines": "No hay rutinas registradas",
    "project.wrapped.topTrainers": "Entrenadores que te inspiran",
    "project.wrapped.noTrainers": "No seguiste rutinas de otros entrenadores",
    "project.wrapped.routinesLabel": "rutinas",
    "project.wrapped.bestFriend": "Tu compañero fitness", // Matches component
    "project.wrapped.bestFriendDesc": "La persona con la que más interactuaste",
    "project.wrapped.interactions": "interacciones",
    "project.wrapped.noBestFriend": "¡Conecta con otros usuarios el próximo año!",
    "project.wrapped.totalKg": "Total levantado",
    "project.wrapped.kgComparison": "Eso equivale a levantar...",
    "project.wrapped.yourStats": "Tus estadísticas",
    "project.wrapped.totalHours": "Horas entrenando",
    "project.global.close": "Cerrar"
};

describe('WrappedModal', () => {
    test('renders successfully and displays data', async () => {
        getWrapped.mockImplementation((year, onSuccess, onError) => {
            onSuccess(mockWrappedData);
        });

        render(
            <IntlProvider locale="es" messages={messages}>
                <WrappedModal onClose={jest.fn()} />
            </IntlProvider>
        );

        // 1. Check Intro
        await waitFor(() => {
            expect(screen.getByText('Tu Año Fitness')).toBeInTheDocument();
        });

        // 2. Click Next -> Exercises
        const nextButton = screen.getByLabelText('Next section');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Sentadillas')).toBeInTheDocument();
        });
        expect(screen.getByText('10x')).toBeInTheDocument();

        // 3. Click Next -> Routines
        fireEvent.click(nextButton);
        await waitFor(() => {
             expect(screen.getByText('Rutina Fuerza')).toBeInTheDocument();
        });
        expect(screen.getByText('5x')).toBeInTheDocument();
    });

    test('renders empty states when no data', async () => {
         getWrapped.mockImplementation((year, onSuccess, onError) => {
            onSuccess({
                topExercises: [],
                topRoutines: [],
                topTrainers: [],
                bestFriend: null,
                totalKgLifted: 0,
                kgComparison: '',
                totalHoursTrained: 0
            });
         });

        render(
            <IntlProvider locale="es" messages={messages}>
                <WrappedModal onClose={jest.fn()} />
            </IntlProvider>
        );

        // 1. Check Intro
        await waitFor(() => {
             expect(screen.getByText('Tu Año Fitness')).toBeInTheDocument();
        });

        // 2. Click Next -> Exercises (Empty)
        const nextButton = screen.getByLabelText('Next section');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('No hay ejercicios registrados')).toBeInTheDocument();
        });
    });
});
