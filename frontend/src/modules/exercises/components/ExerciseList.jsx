import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import exercises from '..';
import * as exerciseService from '../../../backend/exerciseService';
import { handleResponse, Button, ButtonGroup, ConfirmModal, Table, LoadingSpinner, useNavigationWithLoading, useUrlPagination } from '../../common';
import users from '../../users';
import ExerciseSearch from "./ExerciseSearch";
import { FormattedMessage, useIntl } from 'react-intl';
import Paginacion from '../../common/components/Paginacion';
import { translateMuscle } from '../../common/components/muscleTranslations';

const { actions, selectors } = exercises;

const ExerciseList = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { navigateWithLoading, isLoading, loadingMessage } = useNavigationWithLoading();
    const items = useSelector(selectors.getList);
    const loading = useSelector(selectors.isLoading);

    const isAdmin = useSelector(users.selectors.isAdmin);
    const isTrainer = useSelector(users.selectors.isTrainer);

    const [filters, setFilters] = useState({});
    const { page, setPage, resetPage } = useUrlPagination();
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, exerciseId: null, exerciseName: '' });

    useEffect(() => {
        const load = async () => {
            dispatch(actions.setLoading(true));
            const resp = await exerciseService.find({ ...filters, page });
            handleResponse(resp, { showSuccessToast: false });
            if (resp.ok) {
                dispatch(actions.findAllCompleted(resp.payload.items));
                setExistMoreItems(resp.payload.existMoreItems);
            }
            dispatch(actions.setLoading(false));
        };
        load();
    }, [dispatch, filters, page]);

    const openDeleteModal = (exercise) => {
        setDeleteModal({ isOpen: true, exerciseId: exercise.id, exerciseName: exercise.name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, exerciseId: null, exerciseName: '' });
    };

    const handleRowClick = (exercise) => {
        if (exercise.id) {
            navigateWithLoading(`/exercises/${exercise.id}`, 'Cargando detalles del ejercicio...');
        }
    };

    const handleDeleteConfirm = async () => {
        // Intentar eliminar primero
        const deleteResp = await exerciseService.remove(deleteModal.exerciseId);

        if (deleteResp.ok) {
            handleResponse(deleteResp, {
                successMessage: intl.formatMessage({
                    id: 'project.exercises.delete.success',
                    defaultMessage: 'Ejercicio eliminado correctamente.'
                })
            });
            dispatch(actions.deleteCompleted(deleteModal.exerciseId));
            closeDeleteModal();
            return;
        }

        // Si no se puede eliminar (p.ej. pertenece a una rutina)
        if (deleteResp.status === 400) {
            const exercise = items.find(e => e.id === deleteModal.exerciseId);
            if (exercise) {
                const rejectResp = await exerciseService.reject(deleteModal.exerciseId, exercise);
                if (rejectResp.ok) {
                    handleResponse(rejectResp, {
                        successMessage: intl.formatMessage({
                            id: 'project.exercises.reject.success',
                            defaultMessage: 'Ejercicio marcado como rechazado.'
                        })
                    });
                    dispatch(actions.updateCompleted({
                        ...exercise,
                        status: 'REJECTED'
                    }));
                } else if (rejectResp.status === 403) {
                    handleResponse(rejectResp, {
                        errorMessage: intl.formatMessage({
                            id: 'project.exercises.reject.forbidden',
                            defaultMessage: 'No tienes permisos para rechazar este ejercicio.'
                        })
                    });
                } else {
                    handleResponse(rejectResp);
                }
            }
        } else {
            handleResponse(deleteResp);
        }

        closeDeleteModal();
    };

    const handleSortChange = (e) => {
        setFilters((f) => ({ ...f, sort: e.target.value }));
        resetPage();
    };

    return (
        <div className="routine-page-wrapper container">

            <div className="routine-page-header">
                <h2 className="routine-page-title"><FormattedMessage id="project.exercises.list.pageTitle" defaultMessage="Ejercicios" /></h2>
            </div>

            {/* Filtros y ordenación */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <div className="ms-auto d-none">
                    <select className="form-select" onChange={handleSortChange} value={filters.sort || ''}>
                        <option value="">Ordenar</option>
                        <option value="name,asc">Nombre (A-Z)</option>
                        <option value="name,desc">Nombre (Z-A)</option>
                    </select>
                </div>
            </div>

            <ExerciseSearch
                filters={filters}
                setFilters={(f) => {
                    setFilters(f);
                    resetPage();
                }}
                resetFilters={() => {
                    setFilters({});
                    resetPage();
                }}
                rightActions={
                    <>
                        {isAdmin && (
                            <Button variant="secondary" to="/exercises/pending">
                                <FormattedMessage id="project.exercises.list.pendingExercisesButton" defaultMessage="Ejercicios pendientes" />
                            </Button>
                        )}
                        {(isAdmin || isTrainer) && (
                            <Button variant="primary" icon="fa-plus" to="/exercises/new">
                                <FormattedMessage id="project.exercises.list.newExerciseButton" defaultMessage="Nuevo ejercicio" />
                            </Button>
                        )}
                    </>
                }
            />

            <Table
                columns={[
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
                        width: '360px',
                        render: (row) => {
                            const muscles = Array.isArray(row.muscles) ? row.muscles : [];
                            return muscles.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {muscles.map((m) => (
                                        <span key={m} className="trainium-table__badge">
                                            {translateMuscle(m, intl)}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="trainium-table__cell--secondary">—</span>
                            );
                        },
                    },
                    {
                        key: 'actions',
                        header: '',
                        width: '80px',
                        align: 'right',
                        render: (row) => {
                            if (!isAdmin) return null;

                            return (
                                <ButtonGroup
                                    primaryActions={[]}
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
                                    dropdownLabel={intl.formatMessage({ id: 'project.common.actions', defaultMessage: 'Acciones' })}
                                />
                            );
                        },
                    },
                ]}
                data={items || []}
                isLoading={loading}
                loadingMessage={intl.formatMessage({ id: 'project.exercises.list.loading', defaultMessage: 'Cargando...' })}
                onRowClick={handleRowClick}
            />

            {/* Paginación */}
            <Paginacion page={page} existMoreItems={existMoreItems} setPage={setPage} />

            {/* Modal de confirmación */}
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

export default ExerciseList;
