import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import backend from '../../../backend';
import routines from '..';
import RoutineTable from './RoutineTable';
import { handleResponse, Button, ConfirmModal, useUrlPagination } from '../../common';
import { FormattedMessage, useIntl } from 'react-intl';
import Paginacion from '../../common/components/Paginacion';

const SavedRoutineList = () => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const [routineList, setRoutineList] = useState([]);

    const { page, setPage } = useUrlPagination();
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, routineId: null, routineName: '' });


    const [loading, setLoading] = useState(false);

    const loadSaved = useCallback(async () => {
        setLoading(true);
        try {
            const response = await backend.routineService.savedRoutines(page);
            handleResponse(response, { showSuccessToast: false });
            if (response.ok) {
                const block = response.payload;
                setRoutineList(block.items || []);
                setExistMoreItems(block.existMoreItems);
            }
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        // Cargar categorías por si el listado las muestra con nombre
        const findAllCategories = () => {
            backend.routineService.findAllCategories((categories) => {
                dispatch(routines.actions.findAllCategoriesCompleted(categories));
            }, (errors) => {
                handleResponse({ ok: false, payload: errors }, { showSuccessToast: false });
            });
        };

        findAllCategories();
        loadSaved();
    }, [dispatch, loadSaved]);

    const openDeleteModal = (routine) => {
        setDeleteModal({ isOpen: true, routineId: routine.id, routineName: routine.name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, routineId: null, routineName: '' });
    };

    const handleDeleteConfirm = async () => {
        const response = await backend.routineService.remove(deleteModal.routineId);
        handleResponse(response, {
            successMessage: intl.formatMessage({ id: 'project.routines.myList.deleteSuccess', defaultMessage: 'Rutina Eliminada.' })
        });
        if (response.ok) {
            dispatch(routines.actions.deleteCompleted(deleteModal.routineId));
            // También quitarla del listado local si estaba guardada
            setRoutineList(prev => prev.filter(r => r.id !== deleteModal.routineId));
        }

        closeDeleteModal();
    };

    return (
        <div className="routine-page-wrapper container">
            <div className="routine-page-header d-flex align-items-center justify-content-between">
                <h2 className="routine-page-title">
                    <FormattedMessage id="project.routines.savedList.pageTitle" defaultMessage="Rutinas guardadas" />
                </h2>

                <Button variant="secondary" icon="fa-arrow-left" to="/routines">
                    <FormattedMessage id="project.routines.savedList.backAll" defaultMessage="Ver todas" />
                </Button>
            </div>

            <RoutineTable list={routineList} onDelete={openDeleteModal} isLoading={loading} loadingMessage={intl.formatMessage({ id: 'project.common.loading', defaultMessage: 'Cargando...' })} />

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

export default SavedRoutineList;
