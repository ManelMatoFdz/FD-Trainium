import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import backend from '../../../backend';
import { handleResponse, showError } from '../../common';

/**
 * Hook reutilizable para obtener todas las ejecuciones del usuario autenticado.
 * Devuelve la lista ordenada (más recientes primero) y el estado de carga.
 */
const useUserExecutions = () => {
  const intl = useIntl();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    const loadExecutions = async () => {
      try {
        setLoading(true);
        const response = await backend.routineExecutionService.findByUser();
        handleResponse(response, { showSuccessToast: false });

        if (!isSubscribed) {
          return;
        }

        if (response.ok) {
          const sorted = (response.payload || [])
            .filter((exec) => !!exec)
            .sort((a, b) => {
              const dateA = new Date(a.performedAt || 0);
              const dateB = new Date(b.performedAt || 0);
              return dateB - dateA;
            });

          setExecutions(sorted);
        } else {
          showError(
            intl.formatMessage({
              id: 'project.executions.loadError',
              defaultMessage: 'No se pudieron cargar las rutinas realizadas.'
            })
          );
        }
      } catch (error) {
        console.error('Error loading executions:', error);
        if (isSubscribed) {
          showError(
            intl.formatMessage({
              id: 'project.executions.loadError',
              defaultMessage: 'No se pudieron cargar las rutinas realizadas.'
            })
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadExecutions();

    return () => {
      isSubscribed = false;
    };
  }, [intl]);

  return { executions, loading };
};

export default useUserExecutions;
