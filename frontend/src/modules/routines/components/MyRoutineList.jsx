import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import backend from '../../../backend';
import routines from '..';
import RoutineTable from './RoutineTable';
import users from '../../users';
import RoutineSearch, { useRoutineFilter } from "./RoutineSearch";
import { FormattedMessage, useIntl } from 'react-intl';
import Paginacion from '../../common/components/Paginacion';
import { handleResponse, Button, ConfirmModal, useUrlPagination } from '../../common';

const MyRoutineList = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const list = useSelector(routines.selectors.getList);
  const canManage = useSelector(users.selectors.canManage);

  const [backendErrors, setBackendErrors] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [loading, setLoading] = useState(false);

  const { page, setPage, resetPage } = useUrlPagination();
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, routineId: null, routineName: '' });

  const { filters, setFilters, filteredList, resetFilters } = useRoutineFilter(list);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        backend.routineService.findAllCategories((categories) => {
          dispatch(routines.actions.findAllCategoriesCompleted(categories));
        }, (errors) => {
          handleResponse({ ok: false, payload: errors }, { showSuccessToast: false });
        });

        // Cargar mis rutinas (paginado)
        const response = await backend.routineService.myRoutines(page);
        handleResponse(response, { showSuccessToast: false });
        if (response.ok) {
          dispatch(routines.actions.findAllCompleted(response.payload.items || []));
          setExistMoreItems(response.payload.existMoreItems);
        }
      } finally {
        setLoading(false);
      }
    };

    // Respetamos la condición original
    if (canManage) {
      load();
    }
  }, [dispatch, canManage, page]);

  const openDeleteModal = (routine) => {
    setDeleteModal({ isOpen: true, routineId: routine.id, routineName: routine.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, routineId: null, routineName: '' });
  };

  const handleDeleteConfirm = async () => {
    const response = await backend.routineService.remove(deleteModal.routineId);

    handleResponse(response, {
      successMessage: intl.formatMessage({ id: 'project.routines.myList.deleteSuccess', defaultMessage: 'Rutina eliminada.' })
    });

    if (response.ok) {
      dispatch(routines.actions.deleteCompleted(deleteModal.routineId));
      setSuccessMsg(intl.formatMessage({ id: 'project.routines.myList.deleteSuccess', defaultMessage: 'Rutina eliminada.' }));
    } else {
      setBackendErrors(response.payload);
    }

    closeDeleteModal();
  };

  return (
    <div className="routine-page-wrapper container">
      <div className="routine-page-header">
        <h2 className="routine-page-title m-0"><FormattedMessage id="project.routines.myList.pageTitle" defaultMessage="Mis Rutinas" /></h2>
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
        rightActions={canManage ? (
          <Button variant="primary" icon="fa-plus" to="/routines/new">
            <FormattedMessage id="project.routines.myList.newRoutineButton" defaultMessage="Nueva rutina" />
          </Button>
        ) : null}
      />
      <RoutineTable
        list={filteredList}
        onDelete={openDeleteModal}
        backendErrors={backendErrors}
        successMsg={successMsg}
        setBackendErrors={setBackendErrors}
        setSuccessMsg={setSuccessMsg}
        showVisibility={true}
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

export default MyRoutineList;
