import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { format, parseISO } from 'date-fns';
import { getExecutionsForDate, formatDuration } from '../utils/executionStatsUtils';
import './css/ExecutionCalendar.css';
import 'react-calendar/dist/Calendar.css';

/**
 * Calendario interactivo para visualizar ejecuciones registradas.
 * Puede renderizarse en modo independiente (con contenedor y detalles)
 * o incrustado dentro de otras tarjetas (variant="embedded").
 */
const ExecutionCalendar = ({
  executions = [],
  onSelectDate,
  selectedDate: externalSelectedDate,
  onDateChange,
  showHeader = true,
  showDayDetails = true,
  variant = 'standalone'
}) => {
  const intl = useIntl();
  const [internalSelectedDate, setInternalSelectedDate] = useState(new Date());
  const selectedDate = externalSelectedDate || internalSelectedDate;
  const isEmbedded = variant === 'embedded';

  // Mapear locale de react-intl a react-calendar
  // Nota: Para gallego, react-intl usa 'es-ES' como locale de formateo,
  // pero podemos detectar el idioma real verificando el navegador
  const getCalendarLocale = () => {
    // Intentar detectar el idioma real del navegador
    const browserLocale = navigator.languages?.[0] ||
                          navigator.language || navigator.userLanguage || 'en';
    const browserLocaleCode = browserLocale.toLowerCase().split(/[_-]+/)[0];
    
    // react-calendar usa códigos como 'es', 'en', etc.
    switch (browserLocaleCode) {
      case 'es':
        return 'es';
      case 'gl':
        // react-calendar puede no soportar 'gl', usar 'es' como fallback
        // ya que es similar y compatible
        return 'es';
      case 'en':
      default:
        return 'en';
    }
  };

  const calendarLocale = getCalendarLocale();

  // Agrupar ejecuciones por día para acceso rápido
  const executionsByDay = useMemo(() => {
    const map = new Map();

    executions.forEach((exec) => {
      if (!exec?.performedAt) return;
      const execDate = parseISO(exec.performedAt);
      const dateKey = format(execDate, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(exec);
    });

    return map;
  }, [executions]);

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateKey = format(date, 'yyyy-MM-dd');
    return executionsByDay.has(dateKey) ? 'has-executions' : null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayExecutions = executionsByDay.get(dateKey);

    if (dayExecutions && dayExecutions.length > 0) {
      return <div className="execution-badge">{dayExecutions.length}</div>;
    }
    return null;
  };

  const handleDateChange = (date) => {
    if (onDateChange) {
      onDateChange(date);
    } else {
      setInternalSelectedDate(date);
    }
    if (onSelectDate) {
      onSelectDate(date);
    }
  };

  const selectedDayExecutions = useMemo(() => {
    if (!showDayDetails) {
      return [];
    }
    return getExecutionsForDate(executions, selectedDate);
  }, [executions, selectedDate, showDayDetails]);

  return (
    <div className={`execution-calendar-container${isEmbedded ? ' calendar-embedded' : ''}`}>
      {showHeader && (
        <div className="calendar-header mb-3">
          <h5 className="mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="me-2"
              style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
              />
            </svg>
            <FormattedMessage
              id="project.executions.calendar.title"
              defaultMessage="Calendario de Rutinas"
            />
          </h5>
        </div>
      )}

      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale={calendarLocale}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="custom-calendar"
          showNeighboringMonth
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {showDayDetails && (
        <div className="selected-day-details">
          <div className="detail-header">
            <strong>
              <FormattedMessage
                id="project.executions.calendar.selectedDate"
                defaultMessage="Rutinas del {date}"
                values={{
                  date: intl.formatDate(selectedDate, {
                    day: 'numeric',
                    month: 'long'
                  })
                }}
              />
            </strong>
          </div>

          <div className="executions-list">
            {selectedDayExecutions.length === 0 ? (
              <div className="text-center text-muted py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: '36px', height: '36px', marginBottom: '0.5rem', opacity: 0.6 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <p className="mb-0">
                  <FormattedMessage
                    id="project.executions.calendar.noExecutions"
                    defaultMessage="No hay rutinas registradas este día"
                  />
                </p>
              </div>
            ) : (
              selectedDayExecutions.map((exec) => (
                <Link key={exec.id} to={`/routines/executions/${exec.id}`} className="execution-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="routine-name">{exec.routineName}</div>
                      <div className="execution-time text-muted small">
                        {exec.performedAt ? format(parseISO(exec.performedAt), 'HH:mm') : ''}
                      </div>
                    </div>
                    <div className="execution-stats">
                      {exec.totalDurationSec && (
                        <span className="badge">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          {formatDuration(exec.totalDurationSec)}
                        </span>
                      )}
                      {exec.exercises && exec.exercises.length > 0 && (
                        <span className="badge">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                            />
                          </svg>
                          {exec.exercises.length}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ExecutionCalendar.propTypes = {
  executions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      performedAt: PropTypes.string,
      routineName: PropTypes.string,
      totalDurationSec: PropTypes.number,
      exercises: PropTypes.array
    })
  ),
  onSelectDate: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
  showHeader: PropTypes.bool,
  showDayDetails: PropTypes.bool,
  variant: PropTypes.oneOf(['standalone', 'embedded'])
};

export default ExecutionCalendar;
