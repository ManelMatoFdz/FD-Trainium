import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as exerciseService from '../../../backend/exerciseService';
import { handleResponse, Button, ConfirmModal, ButtonGroup, Table, LoadingSpinner, useNavigationWithLoading, useUrlPagination } from '../../common';
import users from '../../users';
import ExerciseSearch from "./ExerciseSearch";
import { FormattedMessage, useIntl } from 'react-intl';

const PendingExerciseList = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { navigateWithLoading, isLoading, loadingMessage } = useNavigationWithLoading();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = useSelector(users.selectors.isAdmin);

  const [filters, setFilters] = useState({});
  const { page, setPage, resetPage } = useUrlPagination();
  const [existMoreItems, setExistMoreItems] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exerciseToApprove, setExerciseToApprove] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, exerciseId: null, exerciseName: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const resp = await exerciseService.findPending({ ...filters, page });
      handleResponse(resp, { showSuccessToast: false });
      if (resp.ok) {
        setItems(resp.payload.items);
        setExistMoreItems(resp.payload.existMoreItems);
      }
      setLoading(false);
    };
    load();
  }, [filters, page]);

  const handleRowClick = (exercise) => {
    if (exercise.id) {
      navigateWithLoading(`/exercises/${exercise.id}`, 'Cargando detalles del ejercicio...');
    }
  };

  const onApprove = (id) => {
    setExerciseToApprove(id);
    setShowConfirmModal(true);
  };

  const handleConfirmApprove = async () => {
    setShowConfirmModal(false);
    if (!exerciseToApprove) return;

    const exerciseResponse = await exerciseService.findById(exerciseToApprove);
    handleResponse(exerciseResponse, { showSuccessToast: false });
    if (!exerciseResponse.ok) {
      setExerciseToApprove(null);
      return;
    }

    const response = await exerciseService.approve(exerciseToApprove, exerciseResponse.payload);
    handleResponse(response, {
      successMessage: intl.formatMessage({
        id: 'project.exercises.pending.approveSuccess',
        defaultMessage: 'Ejercicio aprobado correctamente.'
      })
    });

    if (response.ok) {
      setItems(items.filter(e => e.id !== exerciseToApprove));
    }

    setExerciseToApprove(null);
  };

  const handleCancelApprove = () => {
    setShowConfirmModal(false);
    setExerciseToApprove(null);
  };

  const openDeleteModal = (exercise) => {
    setDeleteModal({ isOpen: true, exerciseId: exercise.id, exerciseName: exercise.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, exerciseId: null, exerciseName: '' });
  };

  const handleDeleteConfirm = async () => {
    const response = await exerciseService.remove(deleteModal.exerciseId);
    handleResponse(response, {
      successMessage: intl.formatMessage({
        id: 'project.exercises.delete.success',
        defaultMessage: 'Ejercicio eliminado.'
      })
    });

    if (response.ok) {
      setItems(items.filter(e => e.id !== deleteModal.exerciseId));
    }

    closeDeleteModal();
  };

  return (
    <div className="routine-page-wrapper container">

      <ConfirmModal
        isOpen={showConfirmModal}
        title={intl.formatMessage({ id: 'project.exercises.pending.confirmApprove.title', defaultMessage: 'Aprobar ejercicio' })}
        message={intl.formatMessage({ id: 'project.exercises.pending.confirmApprove.message', defaultMessage: '¿Estás seguro de que quieres aprobar este ejercicio? Una vez aprobado, estará disponible para todos los usuarios.' })}
        onConfirm={handleConfirmApprove}
        onClose={handleCancelApprove}
        confirmText={intl.formatMessage({ id: 'project.exercises.pending.confirmApprove.confirm', defaultMessage: 'Aprobar' })}
        cancelText={intl.formatMessage({ id: 'project.exercises.pending.confirmApprove.cancel', defaultMessage: 'Cancelar' })}
        variant="success"
      />

      <div className="routine-page-header">
        <h2 className="routine-page-title">
          <FormattedMessage id="project.exercises.pending.pageTitle" defaultMessage="Ejercicios Pendientes" />
        </h2>
      </div>

      <ExerciseSearch
        filters={filters}
        setFilters={(f) => { setFilters(f); resetPage(); }}
        resetFilters={() => { setFilters({}); resetPage(); }}
        rightActions={
          <Button variant="secondary" to="/exercises">
            <FormattedMessage id="project.exercises.pending.viewApprovedButton" defaultMessage="Ver ejercicios aprobados" />
          </Button>
        }
      />

      <Table
        columns={[
          {
            key: 'id',
            header: <FormattedMessage id="project.exercises.list.tableHeaders.id" defaultMessage="ID" />,
            width: '80px',
            render: (row) => (
              <span className="trainium-table__cell--id">{row.id ?? '-'}</span>
            ),
          },
          {
            key: 'name',
            header: <FormattedMessage id="project.exercises.list.tableHeaders.name" defaultMessage="Nombre" />,
            render: (row) => (
              row.id ? (
                <Link to={`/exercises/${row.id}`}>
                  {row.name}
                </Link>
              ) : (
                <span>{row.name}</span>
              )
            ),
          },
          {
            key: 'material',
            header: <FormattedMessage id="project.exercises.list.tableHeaders.material" defaultMessage="Material" />,
            width: '220px',
            render: (row) => (
              <span className="trainium-table__text-truncate trainium-table__cell--secondary" title={row.material}>
                {row.material || '—'}
              </span>
            ),
          },
          {
            key: 'muscles',
            header: <FormattedMessage id="project.exercises.list.tableHeaders.muscles" defaultMessage="Grupos Musculares" />,
            width: '220px',
            render: (row) => (
              <span className="trainium-table__text-truncate trainium-table__cell--secondary" title={row.muscles}>
                {row.muscles || '—'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            width: '160px',
            align: 'right',
            render: (row) => {
              if (!isAdmin) return null;

              return (
                <ButtonGroup
                  primaryActions={[
                    {
                      label: <FormattedMessage id="project.exercises.pending.tableActions.approve" defaultMessage="Aprobar" />,
                      variant: 'success',
                      size: 'sm',
                      icon: 'fa-check',
                      onClick: () => row.id && onApprove(row.id),
                      disabled: !row.id,
                      ariaLabel: 'Aprobar ejercicio',
                    },
                  ]}
                  dropdownActions={[
                    {
                      label: <FormattedMessage id="project.exercises.list.tableActions.edit" defaultMessage="Editar" />,
                      icon: 'fa-edit',
                      onClick: () => row.id && navigate(`/exercises/${row.id}/edit`),
                      disabled: !row.id,
                    },
                    {
                      label: <FormattedMessage id="project.exercises.list.tableActions.delete" defaultMessage="Eliminar" />,
                      icon: 'fa-trash-alt',
                      variant: 'danger',
                      onClick: () => row.id && openDeleteModal(row),
                      disabled: !row.id,
                    },
                  ]}
                  dropdownLabel={intl.formatMessage({ id: 'project.common.moreActions', defaultMessage: 'Más acciones' })}
                />
              );
            },
          },
        ]}
        data={items || []}
        isLoading={loading}
        loadingMessage={intl.formatMessage({ id: 'project.exercises.list.loading', defaultMessage: 'Cargando...' })}
        emptyMessage={<FormattedMessage id="project.exercises.pending.tableEmpty" defaultMessage="No hay ejercicios pendientes." />}
        onRowClick={handleRowClick}
      />

      {/* Modal de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={intl.formatMessage({
          id: 'project.exercises.delete.confirm',
          defaultMessage: '¿Eliminar este ejercicio?'
        })}
        message={intl.formatMessage(
          {
            id: 'project.exercises.delete.message',
            defaultMessage: 'Estás a punto de eliminar "{name}". Esta acción no se puede deshacer.'
          },
          { name: deleteModal.exerciseName }
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

      {/* Paginación */}
      <div className="d-flex justify-content-between mt-3">
        <div>
          {page > 0 && (
            <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 0))}>
              <FormattedMessage id="project.exercises.list.pagination.previous" defaultMessage="Anterior" />
            </Button>
          )}
        </div>
        <div>
          {existMoreItems && (
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              <FormattedMessage id="project.exercises.list.pagination.next" defaultMessage="Siguiente" />
            </Button>
          )}
        </div>
      </div>
      {isLoading && (
        <LoadingSpinner
          message={loadingMessage}
          size="md"
          overlay={true}
        />
      )}
    </div>
  );
};

export default PendingExerciseList;