import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import backend from '../../../backend';
import { handleResponse, showError, LoadingSpinner } from '../../common';

const RoutineExecutionsList = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const intl = useIntl();

  useEffect(() => {
    const loadExecutions = async () => {
      const response = await backend.routineExecutionService.findByUser();
      handleResponse(response, { showSuccessToast: false });
      if (response.ok) {
        setExecutions(response.payload || []);
      } else {
        showError(
          intl.formatMessage({
            id: 'project.executions.loadError',
            defaultMessage: 'No se pudieron cargar las rutinas realizadas.'
          })
        );
      }
      setLoading(false);
    };
    loadExecutions();
  }, [intl]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <LoadingSpinner overlay={true} size="md" message="" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="routine-page-title">
          <FormattedMessage id="project.executions.title" defaultMessage="Historial de rutinas" />
        </h3>
      </div>

      {executions.length === 0 ? (
        <div className="alert alert-info shadow-sm">
          <FormattedMessage id="project.executions.empty" defaultMessage="Aún no has registrado ninguna rutina." />
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <ul className="list-group list-group-flush">
            {executions.map((exec) => (
              <Link
                key={exec.id}
                to={`/routines/executions/${exec.id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 px-4"
              >
                <div>
                  <strong className="fs-5 text-dark">{exec.routineName}</strong>
                  <div className="text-muted small">
                    {exec.performedAt
                      ? new Date(exec.performedAt).toLocaleString()
                      : intl.formatMessage({ id: 'project.executions.noDate', defaultMessage: 'Fecha no disponible' })}
                  </div>
                </div>
                <span className="exercise-badge">
                  {exec.exercises?.length || 0}{' '}
                  <FormattedMessage id="project.executions.exercisesCount" defaultMessage="ejercicios" />
                </span>
              </Link>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        .list-group-item {
          background-color: #ffffff;
          border: none;
          border-bottom: 1px solid #f1f1f1;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
          transform: translateY(-1px);
        }

        .exercise-badge {
          background-color: #e9f2ff;
          color: #004a99;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          min-width: 80px;
          text-align: center;
        }

        .card {
          border-radius: 10px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RoutineExecutionsList;
