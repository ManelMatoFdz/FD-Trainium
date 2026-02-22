import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { LoadingSpinner } from '../../common';
import ExecutionStatistics from './ExecutionStatistics';
import ExecutionCalendar from './ExecutionCalendar';
import useUserExecutions from '../hooks/useUserExecutions';
import {
  calculateExecutionInsights,
  formatDuration,
  getExecutionsForDate
} from '../utils/executionStatsUtils';
import './css/RoutineStatistics.css';

const RoutineStatistics = () => {
  const { executions, loading } = useUserExecutions();
  const intl = useIntl();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const orderedExecutions = useMemo(() => {
    if (!executions || executions.length === 0) {
      return [];
    }

    return [...executions].sort((a, b) => {
      const dateA = a.performedAt ? new Date(a.performedAt).getTime() : 0;
      const dateB = b.performedAt ? new Date(b.performedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [executions]);

  useEffect(() => {
    if (!orderedExecutions.length) {
      return;
    }

    const latest = orderedExecutions[0];
    if (!latest?.performedAt) {
      return;
    }

    const latestDate = new Date(latest.performedAt);
    setSelectedDate((current) => {
      if (current && current.toDateString() === latestDate.toDateString()) {
        return current;
      }
      return latestDate;
    });
  }, [orderedExecutions]);

  const selectedDayExecutions = useMemo(() => {
    if (!orderedExecutions.length || !selectedDate) {
      return [];
    }
    return getExecutionsForDate(orderedExecutions, selectedDate);
  }, [orderedExecutions, selectedDate]);

  const insights = useMemo(
    () => calculateExecutionInsights(executions),
    [executions]
  );

  const weekdayLabels = [
    intl.formatMessage({ id: 'project.statistics.weekday.0', defaultMessage: 'Domingo' }),
    intl.formatMessage({ id: 'project.statistics.weekday.1', defaultMessage: 'Lunes' }),
    intl.formatMessage({ id: 'project.statistics.weekday.2', defaultMessage: 'Martes' }),
    intl.formatMessage({ id: 'project.statistics.weekday.3', defaultMessage: 'Miércoles' }),
    intl.formatMessage({ id: 'project.statistics.weekday.4', defaultMessage: 'Jueves' }),
    intl.formatMessage({ id: 'project.statistics.weekday.5', defaultMessage: 'Viernes' }),
    intl.formatMessage({ id: 'project.statistics.weekday.6', defaultMessage: 'Sábado' })
  ];

  const favoriteDayLabel =
    insights.favoriteDayIndex !== null
      ? weekdayLabels[insights.favoriteDayIndex]
      : '—';

  const formatTrend = (current, previous) => {
    if (previous === 0) {
      return {
        trend: current > 0 ? 'up' : 'neutral',
        text: intl.formatMessage({
          id: 'project.statistics.trend.newData',
          defaultMessage: 'Nuevo periodo'
        })
      };
    }

    const diff = ((current - previous) / previous) * 100;
    const formatted = intl.formatNumber(diff, {
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero'
    });

    return {
      trend: diff >= 0 ? 'up' : 'down',
      text: intl.formatMessage(
        {
          id: 'project.statistics.trend.change',
          defaultMessage: '{value}% frente a los 30 días anteriores'
        },
        { value: formatted }
      )
    };
  };

  const sessionsTrend = formatTrend(
    insights.workoutsLast30,
    insights.workoutsPrev30
  );
  const durationTrend = formatTrend(
    Math.round(insights.durationLast30Sec / 60),
    Math.round(insights.durationPrev30Sec / 60)
  );

  const dayDistribution = insights.weekdayDistribution || [];
  const favoriteTimeBucket = insights.favoriteTimeBucket;
  const favoriteTimeLabel = favoriteTimeBucket
    ? intl.formatMessage({
        id: `project.statistics.timeOfDay.${favoriteTimeBucket}`,
        defaultMessage: favoriteTimeBucket
      })
    : '—';
  const totalMinutesPerWeek = Math.round((insights.durationPerWeekSec || 0) / 60);
  const topExercises = insights.topExercises || [];

  if (loading) {
    return (
      <div className="container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '60vh' }}
        >
          <LoadingSpinner
            overlay={false}
            size="md"
            message={intl.formatMessage({
              id: 'project.executions.loading',
              defaultMessage: 'Cargando historial...'
            })}
          />
        </div>
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <div className="container routine-stats-page">
        <div className="stats-empty-card">
          <h3>
            <FormattedMessage
              id="project.statistics.empty.title"
              defaultMessage="Todavía no hay estadísticas"
            />
          </h3>
          <p className="text-muted">
            <FormattedMessage
              id="project.statistics.empty.description"
              defaultMessage="Completa tu primera rutina para desbloquear gráficas, rachas y comparativas."
            />
          </p>
          <Link to="/routines" className="btn btn-primary btn-lg">
            <FormattedMessage
              id="project.executions.empty.exploreRoutines"
              defaultMessage="Explorar Rutinas"
            />
          </Link>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      id: 'project.statistics.summary.totalWorkouts',
      defaultMessage: 'Entrenamientos',
      value: intl.formatNumber(insights.totalWorkouts)
    },
    {
      id: 'project.statistics.summary.totalTime',
      defaultMessage: 'Tiempo total',
      value: formatDuration(insights.totalDurationSec)
    },
    {
      id: 'project.statistics.summary.avgDuration',
      defaultMessage: 'Duración media',
      value: formatDuration(insights.averageDurationSec)
    },
    {
      id: 'project.statistics.summary.avgExercises',
      defaultMessage: 'Ejercicios medios',
      value: intl.formatNumber(insights.averageExercisesPerRoutine || 0, {
        maximumFractionDigits: 1
      })
    }
  ];

  const renderSessionRecord = (session) => {
    if (!session) {
      return (
        <p className="mb-0 text-muted">
          <FormattedMessage
            id="project.statistics.records.noDuration"
            defaultMessage="Aún no hay datos suficientes."
          />
        </p>
      );
    }

    return (
      <>
        <strong>{session.routineName || '-'}</strong>
        <p className="mb-1 text-muted">
          {formatDuration(session.durationSec)}
          {' · '}
          {session.performedAt
            ? intl.formatDate(new Date(session.performedAt), {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            : ''}
        </p>
        <Link to={`/routines/executions/${session.id || ''}`} className="record-link">
          <FormattedMessage
            id="project.statistics.dayActivity.viewDetails"
            defaultMessage="Ver detalle"
          />
        </Link>
      </>
    );
  };

  return (
    <div className="container routine-stats-page">
      <div className="executions-history-header mb-4">
        <div>
          <h3 className="page-title mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="me-2"
              style={{
                width: '28px',
                height: '28px',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <FormattedMessage
              id="project.statistics.title"
              defaultMessage="Estadísticas y gráficas"
            />
          </h3>
          <p className="text-muted mt-2 mb-0">
            <FormattedMessage
              id="project.statistics.subtitle"
              defaultMessage="Analiza tus hábitos de entrenamiento con métricas avanzadas y gráficas interactivas."
            />
          </p>
        </div>
      </div>

      <div className="row g-4 stats-layout">
        <div className="col-12 col-xl-8">
          <div className="row g-3 stats-summary">
            {summaryCards.map((card) => (
              <div className="col-6 col-md-3" key={card.id}>
                <div className="summary-card">
                  <span className="summary-label">
                    <FormattedMessage id={card.id} defaultMessage={card.defaultMessage} />
                  </span>
                  <strong className="summary-value">{card.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.consistency"
                  defaultMessage="Consistencia y ritmo"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-3 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.consistency.avgPerWeek"
                      defaultMessage="Entrenamientos/semana"
                    />
                  </span>
                  <strong className="metric-value">
                    {intl.formatNumber(insights.workoutsPerWeek || 0, {
                      maximumFractionDigits: 1
                    })}
                  </strong>
                  <small className="metric-hint text-muted">
                    <FormattedMessage
                      id="project.statistics.consistency.tracking"
                      defaultMessage="Basado en {days} días"
                      values={{ days: insights.trackingDays || 0 }}
                    />
                  </small>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.consistency.minutesPerWeek"
                      defaultMessage="Min/semana"
                    />
                  </span>
                  <strong className="metric-value">{intl.formatNumber(totalMinutesPerWeek)}</strong>
                  <small className="metric-hint text-muted">
                    <FormattedMessage
                      id="project.statistics.consistency.minutesHint"
                      defaultMessage="Tiempo acumulado semanal"
                    />
                  </small>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.consistency.averageRest"
                      defaultMessage="Descanso medio"
                    />
                  </span>
                  <strong className="metric-value">
                    {intl.formatNumber(insights.averageRestDays || 0, {
                      maximumFractionDigits: 1
                    })}
                  </strong>
                  <small className="metric-hint text-muted">
                    <FormattedMessage
                      id="project.statistics.consistency.restHint"
                      defaultMessage="Días entre sesiones"
                    />
                  </small>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.consistency.longestRest"
                      defaultMessage="Mayor descanso"
                    />
                  </span>
                  <strong className="metric-value">
                    {intl.formatNumber(insights.longestRestDays || 0)}
                  </strong>
                  <small className="metric-hint text-muted">
                    <FormattedMessage
                      id="project.statistics.consistency.longestRestHint"
                      defaultMessage="Días sin entrenar"
                    />
                  </small>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.highlights"
                  defaultMessage="Destacados"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-3 col-sm-6">
                <div className="insight-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.highlights.currentStreak"
                      defaultMessage="Racha actual"
                    />
                  </span>
                  <strong className="insight-value">
                    {intl.formatNumber(insights.currentStreak)}{' '}
                    <small className="text-muted">
                      <FormattedMessage
                        id="project.statistics.highlights.days"
                        defaultMessage="días"
                      />
                    </small>
                  </strong>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="insight-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.highlights.longestStreak"
                      defaultMessage="Mejor racha"
                    />
                  </span>
                  <strong className="insight-value">
                    {intl.formatNumber(insights.longestStreak)}{' '}
                    <small className="text-muted">
                      <FormattedMessage
                        id="project.statistics.highlights.days"
                        defaultMessage="días"
                      />
                    </small>
                  </strong>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="insight-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.highlights.favoriteDay"
                      defaultMessage="Día con más actividad"
                    />
                  </span>
                  <strong className="insight-value">{favoriteDayLabel}</strong>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="insight-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.highlights.topRoutine"
                      defaultMessage="Rutina más repetida"
                    />
                  </span>
                  <strong className="insight-value">
                    {insights.mostRepeatedRoutine || '—'}
                  </strong>
                  {insights.mostRepeatedRoutineCount > 0 && (
                    <small className="text-muted">
                      {intl.formatMessage(
                        {
                          id: 'project.statistics.highlights.topRoutineCount',
                          defaultMessage: '{count} veces'
                        },
                        { count: insights.mostRepeatedRoutineCount }
                      )}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.weekdayDistribution"
                  defaultMessage="Actividad semanal"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-7">
                <ul className="weekday-distribution">
                  {weekdayLabels.map((label, index) => {
                    const dayCount = dayDistribution[index] || 0;
                    const percentage =
                      insights.totalWorkouts > 0
                        ? Math.round((dayCount / insights.totalWorkouts) * 100)
                        : 0;
                    return (
                      <li key={label}>
                        <span className="weekday-label">{label}</span>
                        <div className="weekday-bar">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="weekday-value">
                          {dayCount}{' '}
                          <FormattedMessage
                            id="project.statistics.weekdayDistribution.legend"
                            defaultMessage="sesiones"
                          />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="col-md-5">
                <div className="time-of-day-card h-100">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.timeOfDay.title"
                      defaultMessage="Horario preferido"
                    />
                  </span>
                  <strong className="metric-value">{favoriteTimeLabel}</strong>
                  <small className="metric-hint text-muted">
                    <FormattedMessage
                      id="project.statistics.timeOfDay.subtitle"
                      defaultMessage="Distribución por franjas"
                    />
                  </small>
                  <div className="time-of-day-distribution">
                    {['morning', 'afternoon', 'evening', 'night'].map((bucket) => (
                      <div key={bucket} className="time-of-day-row">
                        <span className="weekday-label">
                          <FormattedMessage
                            id={`project.statistics.timeOfDay.${bucket}`}
                            defaultMessage={bucket}
                          />
                        </span>
                        <span className="weekday-value">
                          {insights.timeBuckets?.[bucket] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.diversity"
                  defaultMessage="Diversidad de entrenamiento"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-4 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.diversity.uniqueRoutines"
                      defaultMessage="Rutinas distintas"
                    />
                  </span>
                  <strong className="metric-value">
                    {intl.formatNumber(insights.uniqueRoutineCount || 0)}
                  </strong>
                </div>
              </div>
              <div className="col-md-4 col-sm-6">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.diversity.uniqueExercises"
                      defaultMessage="Ejercicios distintos"
                    />
                  </span>
                  <strong className="metric-value">
                    {intl.formatNumber(insights.uniqueExerciseCount || 0)}
                  </strong>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-chip">
                  <span className="metric-label">
                    <FormattedMessage
                      id="project.statistics.diversity.topExercises"
                      defaultMessage="Top ejercicios"
                    />
                  </span>
                  {topExercises.length === 0 ? (
                    <small className="metric-hint text-muted">
                      <FormattedMessage
                        id="project.statistics.diversity.topExercises.empty"
                        defaultMessage="Todavía no hay datos."
                      />
                    </small>
                  ) : (
                    <ul className="top-exercise-list">
                      {topExercises.map((exercise, index) => {
                        const exerciseLabel = exercise.name || '—';
                        return (
                          <li key={`${exerciseLabel}-${index}`}>
                            <span>{exerciseLabel}</span>
                          <span className="badge badge-light">{exercise.count}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.trends"
                  defaultMessage="Tendencia de actividad"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="trend-card">
                  <div className="trend-body">
                    <span className="trend-label">
                      <FormattedMessage
                        id="project.statistics.trend.last30"
                        defaultMessage="Sesiones en los últimos 30 días"
                      />
                    </span>
                    <strong className="trend-value">
                      {intl.formatNumber(insights.workoutsLast30)}
                    </strong>
                    <span className={`trend-variation trend-${sessionsTrend.trend}`}>
                      {sessionsTrend.text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="trend-card">
                  <div className="trend-body">
                    <span className="trend-label">
                      <FormattedMessage
                        id="project.statistics.trend.duration30"
                        defaultMessage="Minutos entrenados en los últimos 30 días"
                      />
                    </span>
                    <strong className="trend-value">
                      {intl.formatNumber(Math.round(insights.durationLast30Sec / 60))}
                    </strong>
                    <span className={`trend-variation trend-${durationTrend.trend}`}>
                      {durationTrend.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.charts"
                  defaultMessage="Gráficas"
                />
              </h4>
            </div>
            <ExecutionStatistics executions={executions} />
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.section.records"
                  defaultMessage="Récords personales"
                />
              </h4>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="record-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.records.longestSession"
                      defaultMessage="Sesión más larga"
                    />
                  </span>
                  {renderSessionRecord(insights.longestSession)}
                </div>
              </div>
              <div className="col-md-6">
                <div className="record-card">
                  <span className="insight-label">
                    <FormattedMessage
                      id="project.statistics.records.shortestSession"
                      defaultMessage="Sesión más corta"
                    />
                  </span>
                  {renderSessionRecord(insights.shortestSession)}
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section mt-4">
            <div className="section-header mb-3">
              <h4>
                <FormattedMessage
                  id="project.statistics.highlights.lastWorkout"
                  defaultMessage="Último entrenamiento"
                />
              </h4>
            </div>
            <div className="last-workout-card">
              {insights.lastWorkoutDate ? (
                <>
                  <strong>{insights.lastRoutineName || '-'}</strong>
                  <p className="mb-0 text-muted">
                    {intl.formatDate(insights.lastWorkoutDate, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </>
              ) : (
                <p className="mb-0 text-muted">
                  <FormattedMessage
                    id="project.statistics.highlights.noLastWorkout"
                    defaultMessage="Aún no has registrado entrenamientos"
                  />
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <aside className="stats-sidebar">
            <div className="stats-calendar-card">
              <div className="sidebar-card-header">
                <h5 className="mb-1">
                  <FormattedMessage
                    id="project.statistics.calendar.title"
                    defaultMessage="Calendario de actividad"
                  />
                </h5>
                <small className="text-muted">
                  <FormattedMessage
                    id="project.statistics.calendar.subtitle"
                    defaultMessage="Selecciona un día para ver los entrenamientos registrados."
                  />
                </small>
              </div>
              <ExecutionCalendar
                executions={executions}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                showHeader={false}
                showDayDetails={false}
                variant="embedded"
              />
            </div>

            <div className="stats-day-card">
              <div className="sidebar-card-header">
                <h6 className="mb-0">
                  <FormattedMessage
                    id="project.executions.calendar.selectedDate"
                    defaultMessage="Rutinas del {date}"
                    values={{
                      date: intl.formatDate(selectedDate, {
                        dateStyle: 'long'
                      })
                    }}
                  />
                </h6>
              </div>

              {selectedDayExecutions.length === 0 ? (
                <p className="text-muted text-center mb-0">
                  <FormattedMessage
                    id="project.statistics.dayActivity.empty"
                    defaultMessage="No registraste entrenamientos este día."
                  />
                </p>
              ) : (
                <div className="stats-day-list">
                  {selectedDayExecutions.map((exec) => (
                    <div key={exec.id} className="stats-day-item">
                      <div className="stats-day-item-main">
                        <strong>{exec.routineName}</strong>
                        <span className="stats-day-time">
                          {exec.performedAt
                            ? intl.formatTime(new Date(exec.performedAt), {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '—'}
                        </span>
                      </div>
                      <div className="stats-day-meta">
                        {exec.totalDurationSec ? (
                          <span>{formatDuration(exec.totalDurationSec)}</span>
                        ) : null}
                        <span>
                          {exec.exercises?.length || 0}{' '}
                          <FormattedMessage
                            id="project.executions.exercisesCount"
                            defaultMessage="ejercicios"
                          />
                        </span>
                      </div>
                      <Link
                        to={`/routines/executions/${exec.id}`}
                        className="stats-day-link"
                      >
                        <FormattedMessage
                          id="project.statistics.dayActivity.viewDetails"
                          defaultMessage="Ver detalle"
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RoutineStatistics;
