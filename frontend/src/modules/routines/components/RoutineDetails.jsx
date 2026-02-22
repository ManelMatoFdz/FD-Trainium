/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import backend from '../../../backend';
import { handleResponse, Button, ButtonGroup, ConfirmModal, LoadingSpinner } from '../../common';
import users from '../../users';
import { FormattedMessage, useIntl } from 'react-intl';
import SavedUsers from './SavedUsers';
import { translateMuscle } from '../../common/components/muscleTranslations';
import FollowButton from "../../users/components/FollowButton";
import ImageZoom from '../../common/components/ImageZoom';

const toNumberOrNull = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const normalizeMuscles = (muscles) => {
  if (Array.isArray(muscles)) return muscles;
  if (typeof muscles === 'string') return muscles.split(',').map((m) => m.trim()).filter(Boolean);
  return [];
};

const getCardioInfo = (ex, formatDuration) => {
  const isCardio = ex.type === 'CARDIO';
  if (!isCardio) return { isCardio: false, cardioDistance: null, cardioDuration: null };

  const cardioDistance = toNumberOrNull(ex.sets ?? ex.cardioDistance ?? ex.distanceMeters);
  const rawDuration = toNumberOrNull(ex.repetitions ?? ex.cardioDuration ?? ex.durationSeconds);

  return {
    isCardio: true,
    cardioDistance,
    cardioDuration: rawDuration != null ? formatDuration(rawDuration) : null,
  };
};

const CardioMeta = ({ cardioDistance, cardioDuration }) => (
  <>
    <span className="text-muted fw-semibold cardio-badge">Cardio</span>
    {(Number.isFinite(cardioDistance) || cardioDuration) && (
        <span className="text-muted small ms-2">
            {Number.isFinite(cardioDistance) ? `Distancia: ${cardioDistance} m` : ''}
            {Number.isFinite(cardioDistance) && cardioDuration ? ' | ' : ''}
            {cardioDuration ? `Tiempo: ${cardioDuration}` : ''}
        </span>
    )}
  </>
);

const StrengthMeta = ({ repetitions, sets }) => {
  const hasRepetitions = typeof repetitions === 'number' && repetitions !== 0;
  const hasSets = typeof sets === 'number' && sets !== 0;

  if (!hasRepetitions && !hasSets) return null;

  return (
    <>
      {hasRepetitions && (
          <>
            <FormattedMessage
                id="project.routines.details.exerciseRepetitions"
                defaultMessage="Repeticiones"
            />: {repetitions}
          </>
      )}
      {hasRepetitions && hasSets && <> | </>}
      {hasSets && (
          <>
            <FormattedMessage
                id="project.routines.details.exerciseSets"
                defaultMessage="Series"
            />: {sets}
          </>
      )}
    </>
  );
};


const RoutineDetails = () => {
  const {routineId} = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const currentUser = useSelector(users.selectors.getUser);
  const isAdmin = useSelector(users.selectors.isAdmin);

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState({isOpen: false});
  const [showSavedUsers, setShowSavedUsers] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const formatCardioDuration = (seconds) => {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) return null;
    const mins = Math.floor(total / 60);
    const secs = Math.floor(total % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await backend.routineService.findById(routineId);
      handleResponse(response, {showSuccessToast: false});

      if (response.ok) {
        setRoutine(response.payload);
        const savedResp = await backend.routineService.savedRoutines();
        if (savedResp.ok) {
          const block = savedResp.payload || {items: []};
          const savedList = Array.isArray(block.items) ? block.items : [];
          const saved = savedList.some((r) => r.id === response.payload.id);
          setIsSaved(saved);
        }
      }
      setLoading(false);
    };
    load();
  }, [routineId]);

  if (loading) return (
    <div className="container mt-4">
      <LoadingSpinner overlay={true} size="md" message="" />
    </div>
  );
  if (!routine) return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <FormattedMessage id="project.routines.details.notFound"
                            defaultMessage="No se ha encontrado la rutina solicitada."/>
        </div>
        <Button variant="secondary" icon="fa-arrow-left" onClick={() => navigate('/routines')}>
          <FormattedMessage id="project.routines.details.back" defaultMessage="Volver"/>
        </Button>
      </div>
  );

  const {name, level, description, category, categoryName, exercises} = routine;
  const canManage = isAdmin || (currentUser && currentUser.id === routine.userId);
  const isUser = currentUser.role === 'USER' || currentUser.role === 'ADMIN';
  const canFollow = (currentUser.role === 'USER' || currentUser.role === 'TRAINER') && routine.userId !== currentUser.id && routine.userRole !== 'ADMIN';

  const openDeleteModal = () => {
    setDeleteModal({isOpen: true});
  };

  const closeDeleteModal = () => {
    setDeleteModal({isOpen: false});
  };

  const handleDeleteConfirm = async () => {
    const response = await backend.routineService.remove(routine.id);
    handleResponse(response, {successMessage: 'Rutina eliminada correctamente'});
    if (response.ok) navigate('/routines');
  };

  return (

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
          <h3 className="mb-0">{name}</h3>
          <ButtonGroup
              primaryActions={[
                {
                  label: <FormattedMessage id="project.routines.details.back" defaultMessage="Volver"/>,
                  variant: 'secondary',
                  icon: 'fa-arrow-left',
                  onClick: () => navigate('/routines')
                },
                ...(isUser ? [
                  {
                    label: <FormattedMessage id="project.routines.details.execute" defaultMessage="Realizar rutina"/>,
                    variant: 'primary',
                    icon: 'fa-play',
                    onClick: () => navigate(`/routines/${routine.id}/execute`)
                  }
                ] : []),
                ...(canManage ? [
                  {
                    label: <FormattedMessage id="project.routines.details.savedUsers" defaultMessage="Ver guardados"/>,
                    variant: 'ghost',
                    icon: 'fa-users',
                    onClick: () => setShowSavedUsers(true)
                  }
                ] : [])
              ]}
              dropdownActions={[
                ...(isUser || currentUser.role === 'TRAINER' ? [
                  isSaved ? {
                    label: <FormattedMessage id="project.routines.details.unsave" defaultMessage="Eliminar de guardados"/>,
                    icon: 'fa-bookmark',
                    onClick: async () => {
                      const response = await backend.routineService.unsave(routine.id);
                      handleResponse(response, {
                        successMessage: intl.formatMessage({
                          id: 'project.routines.details.unsaveSuccess',
                          defaultMessage: 'Rutina eliminada de guardados'
                        })
                      });
                      if (response.ok) setIsSaved(false);
                    }
                  } : {
                    label: <FormattedMessage id="project.routines.details.save" defaultMessage="Guardar rutina"/>,
                    icon: 'fa-bookmark',
                    variant: 'success',
                    onClick: async () => {
                      const response = await backend.routineService.save(routine.id);
                      handleResponse(response, {
                        successMessage: intl.formatMessage({
                          id: 'project.routines.details.saveSuccess',
                          defaultMessage: 'Rutina guardada correctamente'
                        })
                      });
                      if (response.ok) setIsSaved(true);
                    }
                  }
                ] : []),
                ...(canManage ? [
                  {
                    label: <FormattedMessage id="project.routines.details.edit" defaultMessage="Editar"/>,
                    icon: 'fa-edit',
                    onClick: () => navigate(`/routines/${routine.id}/edit`)
                  },
                  {
                    label: <FormattedMessage id="project.routines.details.delete" defaultMessage="Eliminar"/>,
                    icon: 'fa-trash-alt',
                    variant: 'danger',
                    onClick: openDeleteModal
                  }
                ] : [])
              ]}
              dropdownLabel={intl.formatMessage({id: 'project.common.moreActions', defaultMessage: 'Más acciones'})}
          />
        </div>

        <div className="card routine-detail-card mb-4">
          <div className="card-header">
            <FormattedMessage id="project.routines.details.infoTitle" defaultMessage="Información de la rutina"/>
          </div>
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-md-3 fw-semibold">
                <FormattedMessage id="project.routines.details.level" defaultMessage="Nivel"/>
              </div>
              <div className="col-md-9">{level || '-'}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-3 fw-semibold">
                <FormattedMessage id="project.routines.details.category" defaultMessage="Categoría"/>
              </div>
              <div className="col-md-9">{categoryName || category || '-'}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-3 fw-semibold">
                <FormattedMessage id="project.routines.details.creator" defaultMessage="Creador"/>
              </div>
              <div className="col-md-9">
                <div className="d-flex align-items-center" style={{gap: '1rem'}}>
                  <div>{routine.userName || routine.user || 'Desconocido'}</div>
                  {canFollow && (
                      <FollowButton userId={routine.userId} />
                  )}
                </div>
              </div>
            </div>
            {description && (
                <div className="row">
                  <div className="col-md-3 fw-semibold">
                    <FormattedMessage id="project.routines.details.description" defaultMessage="Descripción"/>
                  </div>
                  <div className="col-md-9">{description}</div>
                </div>
            )}
          </div>
        </div>

        <div className="card routine-detail-card">
          <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <FormattedMessage id="project.routines.details.exercisesTitle" defaultMessage="Ejercicios"/> (
            {Array.isArray(exercises) ? exercises.length : 0})
          </span>
          </div>
          <div className="card-body p-0">
            {Array.isArray(exercises) && exercises.length > 0 ? (
                <div className="list-group list-group-flush">
                  {exercises.map((ex, index) => {
                    const { isCardio, cardioDistance, cardioDuration } = getCardioInfo(ex, formatCardioDuration);
                    const muscles = normalizeMuscles(ex.muscles);

                    return (
                      <div
                        key={`${ex.id}-${index}`}
                        className={`list-group-item exercise-item ${ex.status === 'REJECTED' ? 'rejected' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold d-flex align-items-center gap-2">
                              {ex.name || `Ejercicio #${ex.id}`}
                              {ex.status === 'REJECTED' && (
                                <span className="badge bg-danger-subtle text-danger fw-semibold ms-1">
                                  <i className="fa fa-ban me-1"></i>
                                  {' '}
                                  Rechazado
                                </span>
                              )}
                            </div>

                            {ex.description && (
                              <div className="text-muted small mb-1">{ex.description}</div>
                            )}

                            {muscles.length > 0 && (
                              <div className="muscle-tags mb-1">
                                {muscles.map((m, i) => (
                                  <span key={`${m}-${i}-${ex.id}`} className="muscle-tag">
                                    {translateMuscle(m, intl)}
                                  </span>
                                ))}
                              </div>
                            )}
                            <small className="text-muted">
                              {ex.material && (
                                <>
                                  <FormattedMessage
                                    id="project.routines.details.exerciseMaterial"
                                    defaultMessage="Material"
                                  />: {ex.material}{' | '}
                                </>
                              )}
                              {isCardio
                                  ? <CardioMeta cardioDistance={cardioDistance} cardioDuration={cardioDuration} />
                                  : <StrengthMeta repetitions={ex.repetitions} sets={ex.sets} />}
                            </small>
                          </div>

                          {ex.image && (
                              <button
                                  type="button"
                                  className="p-0 border-0 bg-transparent rounded ms-3"
                                  onClick={() => setZoomImage(ex.image)}
                                  style={{ cursor: 'zoom-in' }}
                                  aria-label={`Ampliar ${ex.name}`}
                              >
                                <img
                                    src={ex.image}
                                    alt={ex.name}
                                    style={{ width: '120px', height: 'auto', display: 'block' }}
                                />
                              </button>
                          )}


                        </div>
                      </div>
                    );
                  })}
                </div>
            ) : (
                <div className="p-3 text-muted">
                  <FormattedMessage id="project.routines.details.noExercises"
                                    defaultMessage="No hay ejercicios en esta rutina."/>
                </div>
            )}
          </div>
        </div>

        {showSavedUsers && <SavedUsers routineId={routine.id} onClose={() => setShowSavedUsers(false)}/>}

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
                { name: routine.name }
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

        <style>{`
          .muscle-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .muscle-tag {
            background-color: #e9f2ff;
            color: #004a99;
            border-radius: 12px;
            padding: 3px 10px;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1px solid #cfe0ff;
            white-space: nowrap;
          }
          .cardio-badge {
            font-size: 0.88rem;
            padding: 6px 6px;
          }
          
          .btn-outline-warning:hover,
          .btn-outline-warning:focus,
          .btn-outline-warning:active,
          .btn-outline-warning:active:focus {
            color: #fff !important;
          }
        `}</style>
        {zoomImage && <ImageZoom src={zoomImage} onClose={() => setZoomImage(null)} />}

      </div>

  );
};

export default RoutineDetails;

RoutineDetails.propTypes = {};
