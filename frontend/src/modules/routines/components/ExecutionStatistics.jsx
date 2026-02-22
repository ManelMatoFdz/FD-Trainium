import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts';
import { subDays, subWeeks, subMonths, format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateTotals,
  formatDuration,
  calculateExerciseWeightByPeriod,
  getExercisesWithWeightData
} from '../utils/executionStatsUtils';
import './css/ExecutionStatistics.css';
import {translateMuscle} from "../../common/components/muscleTranslations";

/**
 * Tooltip personalizado para los gráficos
 */
const CustomTooltip = ({ active, payload, label, intl }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p className="label"><strong>{label}</strong></p>
        {payload.map((entry) => (
          <p key={`${entry.dataKey}-${entry.name}`} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
            {entry.dataKey === 'duracion' && ` ${intl.formatMessage({ id: 'project.executions.statistics.unit.minutes', defaultMessage: 'min' })}`}
            {entry.dataKey === 'volumen' && ` ${intl.formatMessage({ id: 'project.executions.statistics.unit.kg', defaultMessage: 'kg' })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string,
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      color: PropTypes.string
    })
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  intl: PropTypes.object.isRequired
};


const accumulateMuscleSets = (totals, exercise) => {
  const muscles = exercise.muscles || [];
  const setsCount = exercise.setsDetails?.length ?? exercise.performedSets ?? 1;

  muscles.forEach((m) => {
    totals[m] = (totals[m] || 0) + setsCount;
  });
};

// Helper: recopila todos los músculos presentes en las ejecuciones
const collectAllMusclesFromExecutions = (executions) => {
  const all = new Set();
  executions.forEach((execution) => {
    (execution?.exercises || []).forEach((ex) => {
      (ex?.muscles || []).forEach((m) => all.add(m));
    });
  });
  return all;
};

// Helper: acumula sets por músculo solo para ejecuciones dentro del rango
const collectTotalsForRange = (executions, startDate, endDate) => {
  const totals = {};
  executions.forEach((execution) => {
    const execDate = new Date(execution?.performedAt || execution?.startedAt || 0);
    if (execDate >= startDate && execDate <= endDate) {
      (execution?.exercises || []).forEach((ex) => {
        accumulateMuscleSets(totals, ex);
      });
    }
  });
  return totals;
};


const CustomTooltip2 = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const validPayload = payload.filter(p => p.value != null);
    if (validPayload.length === 0) return null;

    return (
        <div className="custom-tooltip">
          <p className="label"><strong>{label}</strong></p>
          {validPayload.map((entry) => (
              <div
                key={entry.dataKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0.15rem 0'
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '9999px',
                    backgroundColor: entry.color,
                    flex: '0 0 auto'
                  }}
                />
                <span style={{ color: '#111827' }}>
                  {entry.name}: <strong>{Number(entry.value).toFixed(1)} kg</strong>
                </span>
              </div>
          ))}
        </div>
    );
  }
  return null;
};

CustomTooltip2.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
      PropTypes.shape({
        dataKey: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        color: PropTypes.string
      })
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const renderCustomTooltip2 = (props) => <CustomTooltip2 {...props} />;

/**
 * Componente de estadísticas con gráficos y resúmenes.
 * Muestra datos agregados por día/semana/mes con visualizaciones.
 * 
 * @param {Array} executions - Array de ejecuciones para calcular estadísticas
 */
const ExecutionStatistics = ({ executions = [] }) => {
  const intl = useIntl();
  const [timeRange, setTimeRange] = useState('monthly'); // daily, weekly, monthly
  // Si el rango inicial es mensual, el periodo debe ser suficientemente amplio
  // para que la gráfica de músculos no quede vacía por defecto.
  const [period, setPeriod] = useState(180); // días a mostrar
  const [maxExercises, setMaxExercises] = useState(8); // número máximo de ejercicios a mostrar

  // Calcular estadísticas según el rango seleccionado
  const stats = useMemo(() => {
    const now = new Date();
    let startDate, endDate, data;

    switch (timeRange) {
      case 'daily':
        startDate = subDays(now, period);
        endDate = now;
        data = calculateDailyStats(executions, startDate, endDate);
        break;
      
      case 'weekly':
        startDate = subWeeks(now, Math.ceil(period / 7));
        endDate = now;
        data = calculateWeeklyStats(executions, startDate, endDate);
        break;
      
      case 'monthly':
        startDate = subMonths(now, Math.ceil(period / 30));
        endDate = now;
        data = calculateMonthlyStats(executions, startDate, endDate);
        break;
      
      default:
        startDate = subDays(now, 30);
        endDate = now;
        data = calculateDailyStats(executions, startDate, endDate);
    }

    return {
      data,
      totals: calculateTotals(data)
    };
  }, [executions, timeRange, period]);

  // Preparar datos para los gráficos
  const chartData = useMemo(() => {
    return stats.data.map((item) => {
      let label;
      
      switch (timeRange) {
        case 'daily':
          label = format(item.date, 'dd/MM', { locale: es });
          break;
        case 'weekly':
          label = item.label || intl.formatMessage(
            { id: 'project.executions.statistics.weekLabel', defaultMessage: 'Semana {weekNumber}' },
            { weekNumber: item.weekNumber }
          );
          break;
        case 'monthly':
          label = item.shortLabel || format(item.monthStart, 'MMM', { locale: es });
          break;
        default:
          label = intl.formatMessage({ id: 'project.executions.statistics.notAvailable', defaultMessage: 'N/A' });
      }

      return {
        name: label,
        rutinas: item.routinesCompleted,
        duracion: item.totalDurationMin,
        ejercicios: item.totalExercises,
        volumen: item.totalVolume || 0
      };
    });
  }, [stats.data, timeRange]);

  const muscleRadarData = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    // definir rango de tiempo (normalizado a días completos)
    switch (timeRange) {
      case "daily":
        startDate = startOfDay(subDays(now, period));
        endDate = endOfDay(now);
        break;
      case "weekly":
        startDate = startOfDay(subWeeks(now, Math.ceil(period / 7)));
        endDate = endOfDay(now);
        break;
      case "monthly":
        startDate = startOfDay(subMonths(now, Math.ceil(period / 30)));
        endDate = endOfDay(now);
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
        endDate = endOfDay(now);
    }

    const totals = collectTotalsForRange(executions, startDate, endDate);
    const muscleKeys = Array.from(collectAllMusclesFromExecutions(executions));
    // Si no hay músculos en ninguna ejecución, devolvemos un eje neutro para que el gráfico no desaparezca.
    if (muscleKeys.length === 0) {
      return [{ muscle: '—', sets: 0 }];
    }

    // Convertir a array estable; rellenar con 0 si no hubo sets en el rango
    return muscleKeys
      .map((muscle) => ({
        muscle: translateMuscle(muscle, intl),
        sets: totals[muscle] || 0
      }))
      .sort((a, b) => a.muscle.localeCompare(b.muscle, 'es'));
  }, [executions, timeRange, period]);

  const hasMuscleData = useMemo(
    () => muscleRadarData.some((d) => (d.sets || 0) > 0),
    [muscleRadarData]
  );

  // Datos de peso por ejercicio
  const exerciseWeightData = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'daily':
        startDate = subDays(now, period);
        endDate = now;
        break;
      case 'weekly':
        startDate = subWeeks(now, Math.ceil(period / 7));
        endDate = now;
        break;
      case 'monthly':
        startDate = subMonths(now, Math.ceil(period / 30));
        endDate = now;
        break;
      default:
        startDate = subDays(now, 30);
        endDate = now;
    }

    return calculateExerciseWeightByPeriod(executions, startDate, endDate, timeRange);
  }, [executions, timeRange, period]);

  // Obtener lista de ejercicios con datos de peso
  const allExercisesWithWeight = useMemo(() => {
    return getExercisesWithWeightData(executions);
  }, [executions]);

  // Filtrar ejercicios según el máximo seleccionado
  const exercisesWithWeight = useMemo(() => {
    return allExercisesWithWeight.slice(0, maxExercises);
  }, [allExercisesWithWeight, maxExercises]);

  // Colores para las líneas de ejercicios
  const exerciseColors = [
    '#111827', '#2563eb', '#059669', '#dc2626', '#d97706',
    '#7c3aed', '#0891b2', '#be185d', '#16a34a', '#ea580c',
    '#0369a1', '#9333ea', '#0f766e', '#991b1b', '#854d0e'
  ];

  // Cambiar rango temporal
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Ajustar período por defecto según el rango
    switch (range) {
      case 'daily':
        setPeriod(30);
        break;
      case 'weekly':
        setPeriod(84); // ~12 semanas
        break;
      case 'monthly':
        setPeriod(180); // ~6 meses
        break;
      default:
        setPeriod(30);
    }
  };

  return (
    <div className="execution-statistics-container">
      <div className="statistics-header mb-4">
        <h5 className="mb-0">
          <i className="fas fa-chart-line me-2"></i>
          <FormattedMessage 
            id="project.executions.statistics.title" 
            defaultMessage="Estadísticas" 
          />
        </h5>
      </div>

      {/* Selector de rango temporal */}
      <div className="time-range-selector mb-4">
        <fieldset className="btn-group w-100">
          <legend className="visually-hidden">
            <FormattedMessage id="project.executions.statistics.timeRangeSelector" defaultMessage="Seleccionar rango temporal" />
          </legend>
          <button
            type="button"
            className={`btn ${timeRange === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleTimeRangeChange('daily')}
          >
            <FormattedMessage id="project.executions.statistics.daily" defaultMessage="Diaria" />
          </button>
          <button
            type="button"
            className={`btn ${timeRange === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleTimeRangeChange('weekly')}
          >
            <FormattedMessage id="project.executions.statistics.weekly" defaultMessage="Semanal" />
          </button>
          <button
            type="button"
            className={`btn ${timeRange === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleTimeRangeChange('monthly')}
          >
            <FormattedMessage id="project.executions.statistics.monthly" defaultMessage="Mensual" />
          </button>
        </fieldset>
      </div>

      {/* Tarjetas de resumen */}
      <div className="summary-cards row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totals.totalRoutines}</div>
              <div className="stat-label">
                <FormattedMessage 
                  id="project.executions.statistics.totalRoutines" 
                  defaultMessage="Rutinas" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatDuration(stats.totals.totalDurationSec)}</div>
              <div className="stat-label">
                <FormattedMessage 
                  id="project.executions.statistics.totalDuration" 
                  defaultMessage="Tiempo Total" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totals.totalExercises}</div>
              <div className="stat-label">
                <FormattedMessage 
                  id="project.executions.statistics.totalExercises" 
                  defaultMessage="Ejercicios" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon bg-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totals.averageDurationPerRoutine}m</div>
              <div className="stat-label">
                <FormattedMessage 
                  id="project.executions.statistics.averageDuration" 
                  defaultMessage="Promedio" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {chartData.length > 0 ? (
        <>
          {/* Gráfico de barras - Rutinas completadas */}
          <div className="chart-container mb-4">
            <h6 className="chart-title">
              <FormattedMessage 
                id="project.executions.statistics.routinesChart" 
                defaultMessage="Rutinas Completadas" 
              />
            <small className="text-muted" style={{ fontSize: '0.85rem' }}>Últimos 6 meses</small>
            </h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <YAxis stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <Tooltip content={<CustomTooltip intl={intl} />} />
                <Bar dataKey="rutinas" fill="#1a1a1a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de líneas - Duración */}
          <div className="chart-container mb-4">
            <h6 className="chart-title">
              <FormattedMessage 
                id="project.executions.statistics.durationChart" 
                defaultMessage="Duración Total (minutos)" 
              />
            </h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <YAxis stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <Tooltip content={<CustomTooltip intl={intl} />} />
                <Line 
                  type="monotone" 
                  dataKey="duracion" 
                  stroke="#28a745" 
                  strokeWidth={3}
                  dot={{ fill: '#28a745', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de líneas - Volumen Total */}
          <div className="chart-container mb-4">
            <h6 className="chart-title">
              <FormattedMessage 
                id="project.executions.statistics.volumeChart" 
                defaultMessage="Volumen Total Diario (kg)" 
              />
            </h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <YAxis stroke="#6c757d" style={{ fontSize: '0.85rem' }} />
                <Tooltip content={<CustomTooltip intl={intl} />} />
                <Line 
                  type="monotone" 
                  dataKey="volumen" 
                  stroke="#1a1a1a" 
                  strokeWidth={3}
                  dot={{ fill: '#1a1a1a', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Plot por Músculo */}
          <div className="chart-container mb-4">
            <div className="chart-header-with-selector d-flex justify-content-between align-items-center">
              <h6 className="chart-title mb-0">
                <FormattedMessage
                    id="project.executions.statistics.seriesChart"
                    defaultMessage="Trabajo por Músculo (Sets)"
                />
              </h6>
              <small className="text-muted" style={{ fontSize: '0.85rem' }}>Últimos 6 meses</small>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={muscleRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 12, fill: '#374151' }} />
                <PolarRadiusAxis
                    angle={30}
                    domain={[0, Math.max(...muscleRadarData.map(d => d.sets) || [1])]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Radar
                    name={intl.formatMessage({ id: "project.executions.statistics.sets", defaultMessage: "Sets" })}
                    dataKey="sets"
                    stroke="#1e3a8a"
                    fill="#1e3a8a"
                    fillOpacity={hasMuscleData ? 0.35 : 0}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de peso por ejercicio */}
          {exerciseWeightData.length > 0 && allExercisesWithWeight.length > 0 && (
            <div className="chart-container mb-4 chart-container-wide">
              <div className="chart-header-with-selector d-flex justify-content-between align-items-center">
                <h6 className="chart-title mb-0">
                  <FormattedMessage
                    id="project.executions.statistics.weightByExercise"
                    defaultMessage="Peso por Ejercicio (kg)"
                  />
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <label className="mb-0 small" style={{ fontWeight: 600, color: '#4b5563' }}>
                    <FormattedMessage
                      id="project.executions.statistics.maxExercises"
                      defaultMessage="Mostrar:"
                    />
                  </label>
                  <select
                    className="form-control form-control-sm"
                    style={{ 
                      width: 'auto', 
                      minWidth: '80px',
                      height: 'auto',
                      minHeight: '38px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#111827',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0',
                      textAlign: 'center',
                      lineHeight: '1.5'
                    }}
                    value={maxExercises}
                    onChange={(e) => setMaxExercises(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={allExercisesWithWeight.length}>Todos</option>
                  </select>
                </div>
              </div>
              <div className="exercise-weight-chart-wrapper">
                <ResponsiveContainer width="100%" height={550}>
                  <LineChart data={exerciseWeightData} margin={{ top: 15, right: 30, left: 10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="periodKey" 
                      stroke="#6c757d"
                      style={{ fontSize: '0.8125rem' }}
                      angle={-45}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis 
                      stroke="#6c757d"
                      style={{ fontSize: '0.8125rem' }}
                      label={{ 
                        value: 'Peso (kg)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: '0.875rem', fill: '#4b5563' }
                      }}
                    />
                    <Tooltip 
                      content={renderCustomTooltip2}
                      wrapperStyle={{ 
                        zIndex: 1000,
                        pointerEvents: 'none'
                      }}
                      cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
                      allowEscapeViewBox={{ x: false, y: false }}
                      isAnimationActive={false}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    {exercisesWithWeight.map((exercise, index) => (
                      (() => {
                        const color = exerciseColors[index % exerciseColors.length];
                        return (
                      <Line
                        key={exercise.dataKey}
                        type="monotone"
                        dataKey={exercise.dataKey}
                        name={exercise.name}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ fill: color, stroke: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: color, stroke: color, strokeWidth: 2, r: 6 }}
                        connectNulls={false}
                      />
                        );
                      })()
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-data-message">
          <i className="fas fa-chart-line fa-3x mb-3"></i>
          <p>
            <FormattedMessage 
              id="project.executions.statistics.noData" 
              defaultMessage="No hay datos para este período" 
            />
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutionStatistics;

ExecutionStatistics.propTypes = {
  executions: PropTypes.arrayOf(
    PropTypes.shape({
      performedAt: PropTypes.string,
      startedAt: PropTypes.string,
      finishedAt: PropTypes.string,
      totalDurationSec: PropTypes.number,
      exercises: PropTypes.arrayOf(
          PropTypes.shape({
            performedSets: PropTypes.number,
            setsDetails: PropTypes.array,
            exercise: PropTypes.shape({
              muscles: PropTypes.arrayOf(PropTypes.string)
            })
          })
      ),
      routineName: PropTypes.string,
    })
  ),
};
