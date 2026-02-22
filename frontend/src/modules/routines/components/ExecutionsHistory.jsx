import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { LoadingSpinner } from '../../common';
import { formatDuration } from '../utils/executionStatsUtils';
import useUserExecutions from '../hooks/useUserExecutions';
import './css/ExecutionsHistory.css';

const ExecutionsHistory = () => {
  const { executions, loading } = useUserExecutions();
  const intl = useIntl();

  const orderedExecutions = useMemo(() => {
    return [...executions].sort((a, b) => {
      const dateA = a.performedAt ? new Date(a.performedAt).getTime() : 0;
      const dateB = b.performedAt ? new Date(b.performedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [executions]);

  const formatDateTime = (performedAt) => {
    if (!performedAt) {
      return intl.formatMessage({
        id: 'project.executions.noDate',
        defaultMessage: 'Fecha no disponible'
      });
    }

    const date = new Date(performedAt);
    return intl.formatDate(date, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

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

  if (executions.length === 0) {
    return (
      <div className="container mt-4">
        <div className="executions-history-header mb-4">
          <h3 className="page-title">
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <FormattedMessage
              id="project.executions.history.title"
              defaultMessage="Historial de entrenamientos"
            />
          </h3>
        </div>

        <div className="empty-state-card">
          <div className="empty-state-icon">
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>
          <h4 className="mb-3">
            <FormattedMessage
              id="project.executions.empty.title"
              defaultMessage="Aún no has completado ninguna rutina"
            />
          </h4>
          <p className="text-muted mb-4">
            <FormattedMessage
              id="project.executions.empty.description"
              defaultMessage="Cuando completes tu primera rutina, aquí verás tu progreso, estadísticas y calendario de entrenamientos."
            />
          </p>
          <Link to="/routines" className="btn btn-primary btn-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="me-2"
              style={{
                width: '20px',
                height: '20px',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
              />
            </svg>
            <FormattedMessage
              id="project.executions.empty.exploreRoutines"
              defaultMessage="Explorar Rutinas"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container executions-history-page">
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <FormattedMessage
              id="project.executions.history.title"
              defaultMessage="Historial de entrenamientos"
            />
          </h3>
          <p className="text-muted mt-2 mb-0">
            <FormattedMessage
              id="project.executions.history.subtitle"
              defaultMessage="Revisa tus sesiones completadas y vuelve rápidamente a los detalles que necesites."
            />
          </p>
        </div>
      </div>

      <div className="history-list-card">
        <div className="history-list-header">
          <div>
            <h5>
              <FormattedMessage
                id="project.executions.history.listTitle"
                defaultMessage="Historial completo"
              />
            </h5>
            <small className="text-muted d-block">
              <FormattedMessage
                id="project.executions.history.listSubtitle"
                defaultMessage="Todas tus rutinas registradas"
              />
            </small>
          </div>
          <span className="badge bg-dark text-uppercase history-count">
            {orderedExecutions.length}{' '}
            <FormattedMessage
              id="project.executions.total"
              defaultMessage="rutinas realizadas"
            />
          </span>
        </div>

        <div className="history-list">
          {orderedExecutions.map((exec) => (
            <Link
              key={exec.id}
              to={`/routines/executions/${exec.id}`}
              className="history-item"
            >
              <div className="history-item-info">
                <span className="history-item-day">
                  {exec.performedAt
                    ? intl.formatDate(new Date(exec.performedAt), {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })
                    : intl.formatMessage({
                        id: 'project.executions.noDate',
                        defaultMessage: 'Fecha no disponible'
                      })}
                </span>
                <strong className="history-item-title">{exec.routineName}</strong>
                <span className="history-item-date">
                  {formatDateTime(exec.performedAt)}
                </span>
              </div>
              <div className="history-item-meta">
                {exec.totalDurationSec ? (
                  <span className="meta-chip">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    {formatDuration(exec.totalDurationSec)}
                  </span>
                ) : null}
                <span className="meta-chip">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  {exec.exercises?.length || 0}{' '}
                  <FormattedMessage
                    id="project.executions.exercisesCount"
                    defaultMessage="ejercicios"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutionsHistory;

