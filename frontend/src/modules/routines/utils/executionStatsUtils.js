import {
  startOfDay,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  differenceInCalendarDays,
  getWeek,
  getYear,
  getMonth,
  isSameDay,
  subDays
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Normaliza una fecha a string YYYY-MM-DD en hora local.
 * @param {Date|string} date - Fecha a normalizar
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const normalizeDateString = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(startOfDay(dateObj), 'yyyy-MM-dd');
};

/**
 * Agrupa ejecuciones por fecha (dÃ­a).
 * @param {Array} executions - Array de ejecuciones con performedAt
 * @returns {Map<string, Array>} Map con clave fecha (YYYY-MM-DD) y valor array de ejecuciones
 */
export const groupExecutionsByDate = (executions) => {
  const grouped = new Map();
  
  if (!executions || executions.length === 0) {
    return grouped;
  }

  executions.forEach((execution) => {
    if (!execution.performedAt) return;
    
    const dateKey = normalizeDateString(execution.performedAt);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey).push(execution);
  });

  return grouped;
};

/**
 * Obtiene las ejecuciones de una fecha especÃ­fica.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} date - Fecha a buscar
 * @returns {Array} Ejecuciones de esa fecha
 */
export const getExecutionsForDate = (executions, date) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  const targetDay = startOfDay(date);
  
  return executions.filter((execution) => {
    if (!execution.performedAt) return false;
    const executionDate = parseISO(execution.performedAt);
    return isSameDay(executionDate, targetDay);
  });
};

/**
 * Obtiene el volumen total de una ejecución.
 * Usa el valor calculado en el backend si está disponible, sino calcula en el frontend.
 * @param {Object} execution - Ejecución de rutina
 * @returns {number} Volumen total en kg
 */
const calculateExecutionVolume = (execution) => {
  // Si el backend ya calculó el volumen, usarlo
  if (execution.totalVolume != null) {
    return execution.totalVolume;
  }

  // Fallback: calcular en el frontend si no viene del backend
  if (!execution?.exercises?.length) {
    return 0;
  }

  return execution.exercises.reduce((totalVolume, exercise) => {
    let exerciseVolume = 0;

    // Si hay setsDetails, usar esos datos (más preciso)
    if (exercise.setsDetails && exercise.setsDetails.length > 0) {
      exerciseVolume = exercise.setsDetails.reduce((setVolume, set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        return setVolume + (weight * reps);
      }, 0);
    } else if (exercise.weightUsed && exercise.performedReps) {
      // Si no hay setsDetails, usar los valores agregados
      exerciseVolume = (exercise.weightUsed || 0) * (exercise.performedReps || 0);
    }

    return totalVolume + exerciseVolume;
  }, 0);
};

/**
 * Calcula estadÃ­sticas diarias para un rango de fechas.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array<Object>} Array de estadÃ­sticas por dÃ­a
 */
export const calculateDailyStats = (executions, startDate, endDate) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const grouped = groupExecutionsByDate(executions);

  return days.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayExecutions = grouped.get(dateKey) || [];
    
    const totalDuration = dayExecutions.reduce((sum, exec) => {
      return sum + (exec.totalDurationSec || 0);
    }, 0);

    const totalExercises = dayExecutions.reduce((sum, exec) => {
      return sum + (exec.exercises?.length || 0);
    }, 0);

    const totalVolume = dayExecutions.reduce((sum, exec) => {
      return sum + calculateExecutionVolume(exec);
    }, 0);

    return {
      date: day,
      dateString: dateKey,
      routinesCompleted: dayExecutions.length,
      totalDurationSec: totalDuration,
      totalDurationMin: Math.round(totalDuration / 60),
      totalExercises,
      totalVolume: Math.round(totalVolume * 100) / 100, // Redondear a 2 decimales
      executions: dayExecutions
    };
  });
};

/**
 * Calcula estadÃ­sticas semanales para un rango de fechas.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array<Object>} Array de estadÃ­sticas por semana
 */
export const calculateWeeklyStats = (executions, startDate, endDate) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 } // Lunes
  );

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const weekExecutions = executions.filter((exec) => {
      if (!exec.performedAt) return false;
      const execDate = parseISO(exec.performedAt);
      return isWithinInterval(execDate, { start: weekStart, end: weekEnd });
    });

    const totalDuration = weekExecutions.reduce((sum, exec) => {
      return sum + (exec.totalDurationSec || 0);
    }, 0);

    const totalExercises = weekExecutions.reduce((sum, exec) => {
      return sum + (exec.exercises?.length || 0);
    }, 0);

    const totalVolume = weekExecutions.reduce((sum, exec) => {
      return sum + calculateExecutionVolume(exec);
    }, 0);

    return {
      weekStart,
      weekEnd,
      weekNumber: getWeek(weekStart, { weekStartsOn: 1 }),
      year: getYear(weekStart),
      label: `Semana ${getWeek(weekStart, { weekStartsOn: 1 })}`,
      dateRange: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM')}`,
      routinesCompleted: weekExecutions.length,
      totalDurationSec: totalDuration,
      totalDurationMin: Math.round(totalDuration / 60),
      totalExercises,
      totalVolume: Math.round(totalVolume * 100) / 100, // Redondear a 2 decimales
      executions: weekExecutions
    };
  });
};

/**
 * Calcula estadÃ­sticas mensuales para un rango de fechas.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array<Object>} Array de estadÃ­sticas por mes
 */
export const calculateMonthlyStats = (executions, startDate, endDate) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    
    const monthExecutions = executions.filter((exec) => {
      if (!exec.performedAt) return false;
      const execDate = parseISO(exec.performedAt);
      return isWithinInterval(execDate, { start: monthStart, end: monthEnd });
    });

    const totalDuration = monthExecutions.reduce((sum, exec) => {
      return sum + (exec.totalDurationSec || 0);
    }, 0);

    const totalExercises = monthExecutions.reduce((sum, exec) => {
      return sum + (exec.exercises?.length || 0);
    }, 0);

    const totalVolume = monthExecutions.reduce((sum, exec) => {
      return sum + calculateExecutionVolume(exec);
    }, 0);

    return {
      monthStart,
      monthEnd,
      month: getMonth(monthStart) + 1, // 1-12
      year: getYear(monthStart),
      label: format(monthStart, 'MMMM yyyy', { locale: es }),
      shortLabel: format(monthStart, 'MMM', { locale: es }),
      routinesCompleted: monthExecutions.length,
      totalDurationSec: totalDuration,
      totalDurationMin: Math.round(totalDuration / 60),
      totalExercises,
      totalVolume: Math.round(totalVolume * 100) / 100, // Redondear a 2 decimales
      executions: monthExecutions
    };
  });
};

/**
 * Formatea duraciÃ³n en segundos a formato legible.
 * @param {number} seconds - DuraciÃ³n en segundos
 * @returns {string} DuraciÃ³n formateada (ej: "1h 30m", "45m", "2h")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Calcula el total de estadÃ­sticas para un array de perÃ­odos.
 * @param {Array<Object>} stats - Array de estadÃ­sticas (diarias/semanales/mensuales)
 * @returns {Object} Totales agregados
 */
export const calculateTotals = (stats) => {
  if (!stats || stats.length === 0) {
    return {
      totalRoutines: 0,
      totalDurationSec: 0,
      totalDurationMin: 0,
      totalExercises: 0,
      averageRoutinesPerPeriod: 0,
      averageDurationPerRoutine: 0
    };
  }

  const totalRoutines = stats.reduce((sum, s) => sum + s.routinesCompleted, 0);
  const totalDurationSec = stats.reduce((sum, s) => sum + s.totalDurationSec, 0);
  const totalExercises = stats.reduce((sum, s) => sum + s.totalExercises, 0);

  return {
    totalRoutines,
    totalDurationSec,
    totalDurationMin: Math.round(totalDurationSec / 60),
    totalExercises,
    averageRoutinesPerPeriod: stats.length > 0 ? (totalRoutines / stats.length).toFixed(1) : 0,
    averageDurationPerRoutine: totalRoutines > 0 ? Math.round(totalDurationSec / totalRoutines / 60) : 0
  };
};

/**
 * Obtiene dÃ­as del mes actual con ejecuciones.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} date - Fecha dentro del mes a analizar
 * @returns {Set<number>} Set de dÃ­as (1-31) con ejecuciones
 */
export const getDaysWithExecutions = (executions, date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysSet = new Set();

  if (!executions || executions.length === 0) {
    return daysSet;
  }

  executions.forEach((exec) => {
    if (!exec.performedAt) return;
    const execDate = parseISO(exec.performedAt);
    
    if (isWithinInterval(execDate, { start: monthStart, end: monthEnd })) {
      daysSet.add(execDate.getDate());
    }
  });

  return daysSet;
};

/**
 * Obtiene el peso máximo utilizado en un ejercicio específico.
 * Prioriza setsDetails si están disponibles, sino usa weightUsed.
 * @param {Object} exerciseExecution - Ejecución de ejercicio
 * @returns {number|null} Peso máximo en kg, o null si no hay datos
 */
const getExerciseWeight = (exerciseExecution) => {
  if (!exerciseExecution) {
    return null;
  }

  // Priorizar setsDetails si están disponibles
  if (exerciseExecution.setsDetails && exerciseExecution.setsDetails.length > 0) {
    const weights = exerciseExecution.setsDetails
      .map(set => set.weight)
      .filter(weight => weight != null && weight > 0);
    
    if (weights.length > 0) {
      return Math.max(...weights);
    }
  }

  // Fallback: usar weightUsed si está disponible
  if (exerciseExecution.weightUsed != null && exerciseExecution.weightUsed > 0) {
    return exerciseExecution.weightUsed;
  }

  return null;
};

/**
 * Calcula el peso por ejercicio agrupado por período temporal.
 * @param {Array} executions - Array de ejecuciones de rutina
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @param {string} timeRange - 'daily', 'weekly', o 'monthly'
 * @returns {Array<Object>} Array de objetos con datos por período y ejercicio
 */
export const calculateExerciseWeightByPeriod = (executions, startDate, endDate, timeRange) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  // Obtener estadísticas por período según el rango temporal
  let periodStats;
  switch (timeRange) {
    case 'daily':
      periodStats = calculateDailyStats(executions, startDate, endDate);
      break;
    case 'weekly':
      periodStats = calculateWeeklyStats(executions, startDate, endDate);
      break;
    case 'monthly':
      periodStats = calculateMonthlyStats(executions, startDate, endDate);
      break;
    default:
      periodStats = calculateDailyStats(executions, startDate, endDate);
  }

  // Mapa para almacenar información de cada ejercicio único
  const exerciseMap = new Map(); // exerciseId -> { id, name, dataKey }

  // Primero, identificar todos los ejercicios únicos que tienen datos de peso
  executions.forEach((exec) => {
    if (exec.exercises && Array.isArray(exec.exercises)) {
      exec.exercises.forEach((ex) => {
        const exerciseId = ex.exerciseId || ex.id;
        const exerciseName = ex.exerciseName || ex.name || `Ejercicio #${exerciseId}`;
        const weight = getExerciseWeight(ex);

        if (exerciseId && weight != null) {
          if (!exerciseMap.has(exerciseId)) {
            exerciseMap.set(exerciseId, {
              id: exerciseId,
              name: exerciseName,
              dataKey: `exercise_${exerciseId}`
            });
          }
        }
      });
    }
  });

  // Generar datos por período
  return periodStats.map((period) => {
    const result = {
      // Crear label según el tipo de período
      periodKey: (() => {
        switch (timeRange) {
          case 'daily':
            return format(period.date, 'dd/MM', { locale: es });
          case 'weekly':
            return period.label || `S${period.weekNumber}`;
          case 'monthly':
            return period.shortLabel || format(period.monthStart, 'MMM', { locale: es });
          default:
            return 'N/A';
        }
      })(),
      date: period.date || period.weekStart || period.monthStart
    };

    // Inicializar todos los ejercicios con null
    exerciseMap.forEach((exerciseInfo) => {
      result[exerciseInfo.dataKey] = null;
    });

    // Procesar ejecuciones de este período
    const periodExecutions = period.executions || [];
    periodExecutions.forEach((exec) => {
      if (exec.exercises && Array.isArray(exec.exercises)) {
        exec.exercises.forEach((ex) => {
          const exerciseId = ex.exerciseId || ex.id;
          const weight = getExerciseWeight(ex);

          if (exerciseId && weight != null) {
            const exerciseInfo = exerciseMap.get(exerciseId);
            if (exerciseInfo) {
              const dataKey = exerciseInfo.dataKey;
              // Si no hay valor o el nuevo peso es mayor, actualizar
              if (result[dataKey] == null || weight > result[dataKey]) {
                result[dataKey] = weight;
              }
            }
          }
        });
      }
    });

    return result;
  });
};

/**
 * Obtiene información de los ejercicios únicos que tienen datos de peso.
 * @param {Array} executions - Array de ejecuciones
 * @returns {Array<Object>} Array de { id, name, dataKey }
 */
export const getExercisesWithWeightData = (executions) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  const exerciseMap = new Map();

  executions.forEach((exec) => {
    if (exec.exercises && Array.isArray(exec.exercises)) {
      exec.exercises.forEach((ex) => {
        const exerciseId = ex.exerciseId || ex.id;
        const exerciseName = ex.exerciseName || ex.name || `Ejercicio #${exerciseId}`;
        const weight = getExerciseWeight(ex);

        if (exerciseId && weight != null) {
          if (!exerciseMap.has(exerciseId)) {
            exerciseMap.set(exerciseId, {
              id: exerciseId,
              name: exerciseName,
              dataKey: `exercise_${exerciseId}`
            });
          }
        }
      });
    }
  });

  return Array.from(exerciseMap.values());
};

/**
 * Filtra ejecuciones por rango de fechas.
 * @param {Array} executions - Array de ejecuciones
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array} Ejecuciones filtradas
 */
export const filterExecutionsByDateRange = (executions, startDate, endDate) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  return executions.filter((exec) => {
    if (!exec.performedAt) return false;
    const execDate = parseISO(exec.performedAt);
    return isWithinInterval(execDate, { start: startDate, end: endDate });
  });
};

/**
 * Calcula métricas básicas (totales y promedios) de las ejecuciones.
 * @param {Array} sortedExecutions - Array de ejecuciones ordenadas
 * @returns {Object} Métricas básicas
 */
const calculateBasicMetrics = (sortedExecutions) => {
  const totalDurationSec = sortedExecutions.reduce((sum, exec) => sum + (exec.totalDurationSec || 0), 0);
  const totalExercises = sortedExecutions.reduce((sum, exec) => sum + (exec.exercises?.length || 0), 0);
  const count = sortedExecutions.length;

  return {
    totalWorkouts: count,
    totalDurationSec,
    totalExercises,
    averageDurationSec: count > 0 ? Math.round(totalDurationSec / count) : 0,
    averageExercisesPerRoutine: count > 0 ? totalExercises / count : 0
  };
};

/**
 * Calcula la distribución por día de la semana y buckets de tiempo.
 * @param {Array} sortedExecutions - Array de ejecuciones ordenadas
 * @returns {Object} Distribución por día y tiempo
 */
const calculateTimeDistribution = (sortedExecutions) => {
  const weekdayCounts = Array(7).fill(0);
  const timeBuckets = { night: 0, morning: 0, afternoon: 0, evening: 0 };

  sortedExecutions.forEach((exec) => {
    const execDate = new Date(exec.performedAt);
    weekdayCounts[execDate.getDay()] += 1;

    const hour = execDate.getHours();
    if (hour < 5) {
      timeBuckets.night += 1;
    } else if (hour < 12) {
      timeBuckets.morning += 1;
    } else if (hour < 18) {
      timeBuckets.afternoon += 1;
    } else {
      timeBuckets.evening += 1;
    }
  });

  const favoriteDayCount = Math.max(...weekdayCounts);
  const favoriteDayIndex = favoriteDayCount > 0 ? weekdayCounts.indexOf(favoriteDayCount) : null;
  
  const favoriteTimeBucket = Object.entries(timeBuckets).reduce(
    (acc, [bucket, value]) => {
      if (value > acc.value) {
        return { bucket, value };
      }
      return acc;
    },
    { bucket: null, value: -1 }
  ).bucket;

  return {
    weekdayDistribution: weekdayCounts,
    favoriteDayIndex,
    favoriteDayCount,
    favoriteTimeBucket,
    timeBuckets
  };
};

/**
 * Calcula métricas para los últimos 30 días y los 30 días anteriores.
 * @param {Array} sortedExecutions - Array de ejecuciones ordenadas
 * @returns {Object} Métricas de períodos
 */
const calculatePeriodMetrics = (sortedExecutions) => {
  const now = new Date();
  const currentPeriodStart = subDays(now, 29);
  const previousPeriodStart = subDays(currentPeriodStart, 30);
  const previousPeriodEnd = subDays(currentPeriodStart, 1);

  let workoutsLast30 = 0;
  let durationLast30Sec = 0;
  let workoutsPrev30 = 0;
  let durationPrev30Sec = 0;

  sortedExecutions.forEach((exec) => {
    const execDate = new Date(exec.performedAt);
    if (execDate >= currentPeriodStart && execDate <= now) {
      workoutsLast30 += 1;
      durationLast30Sec += exec.totalDurationSec || 0;
    } else if (execDate >= previousPeriodStart && execDate <= previousPeriodEnd) {
      workoutsPrev30 += 1;
      durationPrev30Sec += exec.totalDurationSec || 0;
    }
  });

  return {
    workoutsLast30,
    workoutsPrev30,
    durationLast30Sec,
    durationPrev30Sec
  };
};

/**
 * Calcula las rachas actual y más larga.
 * @param {Array} uniqueDays - Array de días únicos ordenados (YYYY-MM-DD)
 * @returns {Object} Rachas calculadas
 */
const calculateStreaks = (uniqueDays) => {
  let longestStreak = 0;
  let streak = 0;

  uniqueDays.forEach((day, index) => {
    if (index === 0) {
      streak = 1;
    } else {
      const prevDate = parseISO(`${uniqueDays[index - 1]}T00:00:00`);
      const currentDate = parseISO(`${day}T00:00:00`);
      if (differenceInCalendarDays(currentDate, prevDate) === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);
  });

  let currentStreak = 0;
  for (let i = uniqueDays.length - 1; i >= 0; i -= 1) {
    if (i === uniqueDays.length - 1) {
      currentStreak = 1;
    } else {
      const nextDate = parseISO(`${uniqueDays[i + 1]}T00:00:00`);
      const currentDate = parseISO(`${uniqueDays[i]}T00:00:00`);
      if (differenceInCalendarDays(nextDate, currentDate) === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Calcula métricas de días de descanso.
 * @param {Array} uniqueDays - Array de días únicos ordenados (YYYY-MM-DD)
 * @returns {Object} Métricas de descanso
 */
const calculateRestMetrics = (uniqueDays) => {
  const restGaps = [];
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prevDate = parseISO(`${uniqueDays[i - 1]}T00:00:00`);
    const currentDate = parseISO(`${uniqueDays[i]}T00:00:00`);
    const gap = differenceInCalendarDays(currentDate, prevDate) - 1;
    restGaps.push(Math.max(gap, 0));
  }
  
  return {
    longestRestDays: restGaps.length > 0 ? Math.max(...restGaps) : 0,
    averageRestDays: restGaps.length > 0 ? restGaps.reduce((sum, gap) => sum + gap, 0) / restGaps.length : 0
  };
};

/**
 * Calcula la rutina más repetida y ejercicios únicos.
 * @param {Array} sortedExecutions - Array de ejecuciones ordenadas
 * @returns {Object} Rutina más repetida y conteos únicos
 */
const calculateRoutineAndExerciseMetrics = (sortedExecutions) => {
  const uniqueRoutines = new Set();
  const uniqueExercises = new Set();
  const exerciseFrequency = new Map();
  const routineMap = new Map();

  sortedExecutions.forEach((exec) => {
    if (exec.routineName) {
      uniqueRoutines.add(exec.routineName);
      const currentCount = routineMap.get(exec.routineName) || 0;
      routineMap.set(exec.routineName, currentCount + 1);
    }

    if (Array.isArray(exec.exercises)) {
      exec.exercises.forEach((exercise) => {
        const identifier =
          exercise?.exerciseId ||
          exercise?.id ||
          exercise?.exercise?.id ||
          exercise?.exerciseName ||
          exercise?.name;
        if (identifier) {
          uniqueExercises.add(identifier);
        }
        // Priorizar exerciseName que ahora viene del backend
        const label = exercise?.exerciseName || exercise?.name || exercise?.exercise?.name;
        if (label) {
          exerciseFrequency.set(label, (exerciseFrequency.get(label) || 0) + 1);
        }
      });
    }
  });

  let mostRepeatedRoutine = '';
  let mostRepeatedRoutineCount = 0;
  routineMap.forEach((count, name) => {
    if (count > mostRepeatedRoutineCount) {
      mostRepeatedRoutine = name;
      mostRepeatedRoutineCount = count;
    }
  });

  const topExercises = Array.from(exerciseFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return {
    mostRepeatedRoutine,
    mostRepeatedRoutineCount,
    uniqueRoutineCount: uniqueRoutines.size,
    uniqueExerciseCount: uniqueExercises.size,
    topExercises
  };
};

/**
 * Calcula las sesiones más larga y más corta.
 * @param {Array} sortedExecutions - Array de ejecuciones ordenadas
 * @returns {Object} Sesiones más larga y más corta
 */
const calculateSessionExtremes = (sortedExecutions) => {
  let longestSessionExec = null;
  let longestDurationSec = 0;
  let shortestSessionExec = null;
  let shortestDurationSec = Infinity;

  sortedExecutions.forEach((exec) => {
    const durationSec = exec.totalDurationSec || 0;
    if (durationSec > 0) {
      if (durationSec > longestDurationSec) {
        longestDurationSec = durationSec;
        longestSessionExec = exec;
      }
      if (durationSec < shortestDurationSec) {
        shortestDurationSec = durationSec;
        shortestSessionExec = exec;
      }
    }
  });

  return {
    longestSession: longestSessionExec
      ? {
          id: longestSessionExec.id,
          durationSec: longestDurationSec,
          routineName: longestSessionExec.routineName,
          performedAt: longestSessionExec.performedAt
        }
      : null,
    shortestSession:
      shortestSessionExec && shortestDurationSec !== Infinity
        ? {
            id: shortestSessionExec.id,
            durationSec: shortestDurationSec,
            routineName: shortestSessionExec.routineName,
            performedAt: shortestSessionExec.performedAt
          }
        : null
  };
};

/**
 * Calcula mÃ©tricas globales y resaltados a partir del histÃ³rico de ejecuciones.
 * @param {Array} executions - Array de ejecuciones
 * @returns {Object} Conjunto de mÃ©tricas resumidas
 */
export const calculateExecutionInsights = (executions = []) => {
  const base = {
    totalWorkouts: 0,
    totalDurationSec: 0,
    totalExercises: 0,
    averageDurationSec: 0,
    averageExercisesPerRoutine: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteDayIndex: null,
    favoriteDayCount: 0,
    lastWorkoutDate: null,
    lastRoutineName: '',
    workoutsLast30: 0,
    workoutsPrev30: 0,
    durationLast30Sec: 0,
    durationPrev30Sec: 0,
    mostRepeatedRoutine: '',
    mostRepeatedRoutineCount: 0,
    uniqueRoutineCount: 0,
    uniqueExerciseCount: 0,
    weekdayDistribution: Array(7).fill(0),
    workoutsPerWeek: 0,
    durationPerWeekSec: 0,
    trackingDays: 0,
    averageRestDays: 0,
    longestRestDays: 0,
    favoriteTimeBucket: null,
    timeBuckets: { night: 0, morning: 0, afternoon: 0, evening: 0 },
    topExercises: [],
    longestSession: null,
    shortestSession: null
  };

  if (!executions || executions.length === 0) {
    return base;
  }

  const withDate = executions.filter((exec) => exec?.performedAt);
  if (withDate.length === 0) {
    return base;
  }

  const sortedAsc = [...withDate].sort(
    (a, b) => new Date(a.performedAt) - new Date(b.performedAt)
  );

  const uniqueDays = Array.from(
    new Set(sortedAsc.map((exec) => normalizeDateString(exec.performedAt)))
  );

  const basicMetrics = calculateBasicMetrics(sortedAsc);
  const timeDistribution = calculateTimeDistribution(sortedAsc);
  const periodMetrics = calculatePeriodMetrics(sortedAsc);
  const streaks = calculateStreaks(uniqueDays);
  const restMetrics = calculateRestMetrics(uniqueDays);
  const routineAndExerciseMetrics = calculateRoutineAndExerciseMetrics(sortedAsc);
  const sessionExtremes = calculateSessionExtremes(sortedAsc);

  const lastExecution = sortedAsc[sortedAsc.length - 1];
  const firstExecution = sortedAsc[0];

  const trackingDays =
    firstExecution && lastExecution
      ? Math.max(
          1,
          differenceInCalendarDays(
            new Date(lastExecution.performedAt),
            new Date(firstExecution.performedAt)
          ) + 1
        )
      : 1;
  const weeksTracked = Math.max(1, trackingDays / 7);
  const workoutsPerWeek = sortedAsc.length / weeksTracked;
  const durationPerWeekSec = basicMetrics.totalDurationSec / weeksTracked;

  return {
    ...basicMetrics,
    ...streaks,
    favoriteDayIndex: timeDistribution.favoriteDayIndex,
    favoriteDayCount: timeDistribution.favoriteDayCount,
    lastWorkoutDate: lastExecution?.performedAt ? new Date(lastExecution.performedAt) : null,
    lastRoutineName: lastExecution?.routineName || '',
    ...periodMetrics,
    ...routineAndExerciseMetrics,
    weekdayDistribution: timeDistribution.weekdayDistribution,
    workoutsPerWeek,
    durationPerWeekSec,
    trackingDays,
    ...restMetrics,
    favoriteTimeBucket: timeDistribution.favoriteTimeBucket,
    timeBuckets: timeDistribution.timeBuckets,
    ...sessionExtremes
  };
};

export default {
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
  calculateExecutionInsights
};





