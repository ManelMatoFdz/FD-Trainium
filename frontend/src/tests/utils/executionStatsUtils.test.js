import {
  normalizeDateString,
  groupExecutionsByDate,
  getExecutionsForDate,
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  formatDuration,
  calculateTotals,
  getDaysWithExecutions,
  filterExecutionsByDateRange,
  calculateExecutionInsights,
  calculateExerciseWeightByPeriod,
  getExercisesWithWeightData,
} from '../../modules/routines/utils/executionStatsUtils';

describe('executionStatsUtils basic helpers', () => {
  const baseDate = new Date(2024, 0, 10); // 10 Jan 2024

  it('normalizes dates and groups executions by day', () => {
    const iso = new Date(2024, 0, 10, 15, 0, 0).toISOString();
    const key = normalizeDateString(baseDate);
    expect(key).toMatch(/2024-01-1[0-9]/);

    const executions = [
      { id: 1, performedAt: iso },
      { id: 2, performedAt: iso },
      { id: 3, performedAt: new Date(2024, 0, 11).toISOString() },
      { id: 4 }, // sin fecha, se ignora
    ];

    const grouped = groupExecutionsByDate(executions);
    expect(grouped.get(normalizeDateString(iso)).length).toBe(2);
    expect(grouped.get(normalizeDateString(new Date(2024, 0, 11))).length).toBe(1);

    const sameDay = getExecutionsForDate(executions, baseDate);
    expect(sameDay.map((e) => e.id)).toEqual([1, 2]);
  });

  it('calculates daily, weekly and monthly stats', () => {
    const executions = [
      {
        id: 1,
        performedAt: new Date(2024, 0, 1, 8).toISOString(),
        totalDurationSec: 1800,
        exercises: [1, 2],
      },
      {
        id: 2,
        performedAt: new Date(2024, 0, 2, 9).toISOString(),
        totalDurationSec: 900,
        exercises: [3],
      },
    ];

    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 7);

    const daily = calculateDailyStats(executions, start, end);
    expect(daily.length).toBeGreaterThan(0);
    const totalRoutines = daily.reduce((sum, d) => sum + d.routinesCompleted, 0);
    expect(totalRoutines).toBe(2);

    const weekly = calculateWeeklyStats(executions, start, end);
    expect(weekly.length).toBeGreaterThan(0);
    expect(weekly[0].routinesCompleted).toBe(2);

    const monthly = calculateMonthlyStats(executions, start, new Date(2024, 0, 31));
    expect(monthly.length).toBeGreaterThan(0);
    expect(monthly[0].routinesCompleted).toBe(2);
  });

  it('formats durations and aggregates totals', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(300)).toBe('5m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(5400)).toBe('1h 30m');

    const totals = calculateTotals([
      { routinesCompleted: 1, totalDurationSec: 600, totalExercises: 3 },
      { routinesCompleted: 2, totalDurationSec: 900, totalExercises: 5 },
    ]);

    expect(totals.totalRoutines).toBe(3);
    expect(totals.totalDurationSec).toBe(1500);
    expect(totals.totalExercises).toBe(8);
    expect(totals.averageDurationPerRoutine).toBeGreaterThan(0);
  });

  it('gets days with executions and filters by date range', () => {
    const executions = [
      { performedAt: new Date(2024, 0, 5).toISOString() },
      { performedAt: new Date(2024, 0, 5, 10).toISOString() },
      { performedAt: new Date(2024, 0, 10).toISOString() },
    ];

    const days = getDaysWithExecutions(executions, new Date(2024, 0, 1));
    expect(days.has(5)).toBe(true);
    expect(days.has(10)).toBe(true);

    const filtered = filterExecutionsByDateRange(
      executions,
      new Date(2024, 0, 6),
      new Date(2024, 0, 12)
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].performedAt).toBe(executions[2].performedAt);
  });
});

describe('executionStatsUtils execution insights', () => {
  it('calculates rich insights from executions', () => {
    const executions = [
      {
        id: 1,
        routineName: 'Fuerza Pecho',
        performedAt: new Date(2024, 0, 1, 6).toISOString(),
        totalDurationSec: 1800,
        exercises: [{ id: 'e1', name: 'Press banca' }],
      },
      {
        id: 2,
        routineName: 'Piernas',
        performedAt: new Date(2024, 0, 2, 19).toISOString(),
        totalDurationSec: 2400,
        exercises: [
          { id: 'e2', name: 'Sentadilla' },
          { id: 'e3', name: 'Zancadas' },
        ],
      },
      {
        id: 3,
        routineName: 'Fuerza Pecho',
        performedAt: new Date(2024, 0, 4, 20).toISOString(),
        totalDurationSec: 1200,
        exercises: [{ id: 'e1', name: 'Press banca' }],
      },
    ];

    const insights = calculateExecutionInsights(executions);

    expect(insights.totalWorkouts).toBe(3);
    expect(insights.totalDurationSec).toBeGreaterThan(0);
    expect(insights.totalExercises).toBe(4);
    expect(insights.uniqueRoutineCount).toBe(2);
    expect(insights.uniqueExerciseCount).toBe(3);
    expect(insights.mostRepeatedRoutine).toBe('Fuerza Pecho');
    expect(insights.longestSession).not.toBeNull();
    expect(insights.shortestSession).not.toBeNull();
    expect(Array.isArray(insights.weekdayDistribution)).toBe(true);
    expect(insights.weekdayDistribution.length).toBe(7);
    expect(insights.topExercises.length).toBeGreaterThan(0);
  });
});

describe('executionStatsUtils exercise weight functions', () => {
  const executionsWithWeight = [
    {
      id: 1,
      performedAt: new Date(2024, 0, 1, 10).toISOString(),
      exercises: [
        {
          exerciseId: 1,
          exerciseName: 'Press Banca',
          weightUsed: 80,
          setsDetails: [
            { weight: 80, reps: 8 },
            { weight: 85, reps: 6 }
          ]
        },
        {
          exerciseId: 2,
          exerciseName: 'Sentadilla',
          weightUsed: 100,
          setsDetails: [
            { weight: 100, reps: 10 }
          ]
        }
      ]
    },
    {
      id: 2,
      performedAt: new Date(2024, 0, 5, 10).toISOString(),
      exercises: [
        {
          exerciseId: 1,
          exerciseName: 'Press Banca',
          weightUsed: 85,
          setsDetails: [
            { weight: 85, reps: 8 },
            { weight: 90, reps: 5 }
          ]
        },
        {
          exerciseId: 3,
          exerciseName: 'Peso Muerto',
          weightUsed: 120
        }
      ]
    },
    {
      id: 3,
      performedAt: new Date(2024, 0, 10, 10).toISOString(),
      exercises: [
        {
          exerciseId: 1,
          exerciseName: 'Press Banca',
          weightUsed: 90,
          setsDetails: [
            { weight: 90, reps: 8 }
          ]
        }
      ]
    }
  ];

  it('gets exercises with weight data correctly', () => {
    const exercises = getExercisesWithWeightData(executionsWithWeight);
    
    expect(exercises.length).toBe(3);
    expect(exercises.some(e => e.name === 'Press Banca')).toBe(true);
    expect(exercises.some(e => e.name === 'Sentadilla')).toBe(true);
    expect(exercises.some(e => e.name === 'Peso Muerto')).toBe(true);
    
    const pressBanca = exercises.find(e => e.name === 'Press Banca');
    expect(pressBanca).toBeDefined();
    expect(pressBanca.dataKey).toBe('exercise_1');
  });

  it('calculates exercise weight by period - daily', () => {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 15);
    
    const result = calculateExerciseWeightByPeriod(
      executionsWithWeight,
      startDate,
      endDate,
      'daily'
    );
    
    expect(result.length).toBeGreaterThan(0);
    
    // Buscar el día con Press Banca
    const dayWithPressBanca = result.find(period => 
      period.exercise_1 != null && period.exercise_1 > 0
    );
    expect(dayWithPressBanca).toBeDefined();
    expect(dayWithPressBanca.exercise_1).toBeGreaterThan(0);
  });

  it('calculates exercise weight by period - weekly', () => {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 15);
    
    const result = calculateExerciseWeightByPeriod(
      executionsWithWeight,
      startDate,
      endDate,
      'weekly'
    );
    
    expect(result.length).toBeGreaterThan(0);
    
    // Verificar que hay datos de peso para los ejercicios
    const weekWithData = result.find(period => 
      period.exercise_1 != null || period.exercise_2 != null || period.exercise_3 != null
    );
    expect(weekWithData).toBeDefined();
  });

  it('calculates exercise weight by period - monthly', () => {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 31);
    
    const result = calculateExerciseWeightByPeriod(
      executionsWithWeight,
      startDate,
      endDate,
      'monthly'
    );
    
    expect(result.length).toBeGreaterThan(0);
    
    // Verificar que hay datos de peso
    const monthWithData = result.find(period => 
      period.exercise_1 != null || period.exercise_2 != null || period.exercise_3 != null
    );
    expect(monthWithData).toBeDefined();
  });

  it('prioritizes setsDetails weight over weightUsed', () => {
    const execution = [
      {
        id: 1,
        performedAt: new Date(2024, 0, 1).toISOString(),
        exercises: [
          {
            exerciseId: 1,
            exerciseName: 'Test Exercise',
            weightUsed: 50, // Valor más bajo
            setsDetails: [
              { weight: 60, reps: 10 },
              { weight: 65, reps: 8 } // Valor máximo mayor
            ]
          }
        ]
      }
    ];
    
    const result = calculateExerciseWeightByPeriod(
      execution,
      new Date(2024, 0, 1),
      new Date(2024, 0, 2),
      'daily'
    );
    
    expect(result.length).toBeGreaterThan(0);
    const dayData = result[0];
    // Debe usar el peso máximo de setsDetails (65), no weightUsed (50)
    expect(dayData.exercise_1).toBe(65);
  });

  it('handles empty executions gracefully', () => {
    const exercises = getExercisesWithWeightData([]);
    expect(exercises).toEqual([]);
    
    const result = calculateExerciseWeightByPeriod(
      [],
      new Date(2024, 0, 1),
      new Date(2024, 0, 15),
      'daily'
    );
    expect(result).toEqual([]);
  });

  it('ignores exercises without weight data', () => {
    const executionsNoWeight = [
      {
        id: 1,
        performedAt: new Date(2024, 0, 1).toISOString(),
        exercises: [
          {
            exerciseId: 1,
            exerciseName: 'Sin Peso',
            weightUsed: null,
            setsDetails: []
          }
        ]
      }
    ];
    
    const exercises = getExercisesWithWeightData(executionsNoWeight);
    expect(exercises.length).toBe(0);
  });
});

