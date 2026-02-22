import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import backend from '../../../backend';
import routines from '..';
import users from '../../users';
import RoutineTable from './RoutineTable';
import RoutineSearch from "./RoutineSearch";
import { handleResponse, Button, ConfirmModal, useUrlPagination } from '../../common';
import { FormattedMessage, useIntl } from 'react-intl';
import Paginacion from '../../common/components/Paginacion';

const RoutineList = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const canManage = useSelector(users.selectors.canManage);

  const [filters, setFilters] = useState({ name: "", level: "", category: "", muscles: [] });
  const [routineList, setRoutineList] = useState([]);
  const [loading, setLoading] = useState(false);

  const { page, setPage, resetPage } = useUrlPagination();
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, routineId: null, routineName: '' });

  const performSearch = useCallback(async (searchFilters) => {
    setLoading(true);
    try {
      const categoryId = searchFilters.category || null;
      const keywords = searchFilters.name || null;
      const level = searchFilters.level || null;
      const muscles = Array.isArray(searchFilters.muscles) ? searchFilters.muscles : [];

      const response = await backend.routineService.searchRoutines(categoryId, keywords, level, muscles, page);

      // Solo mostrar errores, no éxito en búsquedas
      handleResponse(response, { showSuccessToast: false });

      if (response.ok) {
        setRoutineList(response.payload.items);
        setExistMoreItems(response.payload.existMoreItems);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  const resetFilters = () => {
    setFilters({ name: "", level: "", category: "", muscles: [] });
  };

  useEffect(() => {
    // Cargar categorías
    const findAllCategories = () => {
      backend.routineService.findAllCategories((categories) => {
        dispatch(routines.actions.findAllCategoriesCompleted(categories));
      }, (errors) => {
        handleResponse({ ok: false, payload: errors }, { showSuccessToast: false });
      });
    };

    findAllCategories();
    // Búsqueda inicial sin filtros
    performSearch({ name: "", level: "", category: "", muscles: [] });
  }, [dispatch, performSearch]);

  const openDeleteModal = (routine) => {
    setDeleteModal({ isOpen: true, routineId: routine.id, routineName: routine.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, routineId: null, routineName: '' });
  };

  const handleDeleteConfirm = async () => {
    const response = await backend.routineService.remove(deleteModal.routineId);

    // handleResponse muestra automáticamente éxito o error
    handleResponse(response, {
      successMessage: intl.formatMessage({ id: 'project.routines.myList.deleteSuccess', defaultMessage: 'Rutina Eliminada.' })
    });

    if (response.ok) {
      dispatch(routines.actions.deleteCompleted(deleteModal.routineId));
      setRoutineList(routineList.filter(r => r.id !== deleteModal.routineId));
    }

    closeDeleteModal();
  };

  return (
    <div className="routine-page-wrapper container">
      <div className="routine-page-header">
        <h2 className="routine-page-title"><FormattedMessage id="project.routines.list.pageTitle" defaultMessage="Rutinas" /></h2>
      </div>
      <RoutineSearch
        filters={filters}
        setFilters={(f) => {
          setFilters(f);
          resetPage();
        }}
        resetFilters={() => {
          resetFilters();
          resetPage();
        }}
        onSearch={performSearch}
        useBackendSearch={true}
        rightActions={canManage ? (
          <Button variant="primary" icon="fa-plus" to="/routines/new">
            <FormattedMessage id="project.routines.list.newRoutineButton" defaultMessage="Nueva rutina" />
          </Button>
        ) : null}
      />
      <RoutineTable
        list={routineList}
        onDelete={openDeleteModal}
        isLoading={loading}
        loadingMessage={intl.formatMessage({ id: 'project.common.loading', defaultMessage: 'Cargando...' })}
      />

      <Paginacion page={page} existMoreItems={existMoreItems} setPage={setPage} />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={intl.formatMessage({
          id: 'project.routines.myList.confirmDelete',
          defaultMessage: '¿Eliminar esta rutina?'
        })}
        message={intl.formatMessage(
          {
            id: 'project.routines.delete.message',
            defaultMessage: 'Estás a punto de eliminar "{name}". Esta acción no se puede deshacer.'
          },
          { name: deleteModal.routineName }
        )}
        confirmText={intl.formatMessage({
          id: 'project.common.delete',
          defaultMessage: 'Eliminar'
        })}
        cancelText={intl.formatMessage({
          id: 'project.common.cancel',
          defaultMessage: 'Cancelar'
        })}
        variant="danger"
      />

    </div>
  );
};

export default RoutineList;
