import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import backend from '../../../backend';
import users from '../../users';
import { handleResponse, Button, ButtonGroup, LoadingSpinner } from '../../common';
import { translateMuscle } from '../../common/components/muscleTranslations';
import PropTypes from "prop-types";

const getExerciseTypeBadge = (ex) => {
  const isTime = ex.type === "TIME";
  const isCardio = ex.type === "CARDIO";
  let badgeClass, messageId, defaultMsg;

  if (isCardio) {
    badgeClass = "text-bg-primary";
    messageId = "project.executions.exercise.type.cardio";
    defaultMsg = "Cardio";
  } else if (isTime) {
    badgeClass = "text-bg-warning";
    messageId = "project.executions.exercise.type.time";
    defaultMsg = "Tiempo";
  } else {
    badgeClass = "text-bg-success";
    messageId = "project.executions.exercise.type.reps";
    defaultMsg = "Repeticiones";
  }

  return (
      <span className={`badge rounded-pill ${badgeClass}`}>
      <FormattedMessage id={messageId} defaultMessage={defaultMsg} />
    </span>
  );
};



const CommentItem = ({
                       comment: c,
                       currentUser,
                       editingId,
                       openMenu,
                       setOpenMenu,
                       startEdit,
                       handleDeleteComment,
                       editRef,
                       handleSaveEdit,
                       intl,
                       menuRef,
                       setEditingId
                     }) => {
  const authorId = c.userId;
  const authorName = c.userName || (authorId ? `#${authorId}` : '');
  const isOwner = currentUser && authorId === currentUser.id;
  const isEditing = editingId === c.id;

  return (
      <div key={c.id} className="list-group-item d-flex flex-column gap-2">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
          <div>
            <div className="fw-semibold">
              {authorId ? (
                  <Link to={`/users/${authorId}`} className="text-decoration-none">
                    {authorName}
                  </Link>
              ) : (
                  authorName || `#${authorId}`
              )}
            </div>
            <div className="text-muted small">
              {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
            </div>
          </div>
          {isOwner && !isEditing && (
              <div className="comment-actions d-flex align-items-center" ref={menuRef}>
                <Button
                    variant="ghost"
                    className="btn-sm icon-only"
                    aria-label={intl.formatMessage({ id: 'project.executions.comments.actions', defaultMessage: 'Acciones del comentario' })}
                    title={intl.formatMessage({ id: 'project.executions.comments.actions', defaultMessage: 'Acciones del comentario' })}
                    onClick={() => setOpenMenu((prev) => (prev === c.id ? null : c.id))}
                >
                  <i className="fa fa-ellipsis-v" aria-hidden="true" />
                </Button>
                {openMenu === c.id && (
                    <div className="comment-menu shadow-sm">
                      <button
                          type="button"
                          className="comment-menu__item"
                          onClick={() => {
                            setOpenMenu(null);
                            startEdit(c);
                          }}
                      >
                        <i className="fa fa-pen" aria-hidden="true" />
                        <FormattedMessage id="project.executions.comments.edit" defaultMessage="Editar comentario" />
                      </button>
                      <button
                          type="button"
                          className="comment-menu__item text-danger"
                          onClick={() => {
                            setOpenMenu(null);
                            handleDeleteComment(c.id);
                          }}
                      >
                        <i className="fa fa-trash" aria-hidden="true" />
                        <FormattedMessage id="project.executions.comments.delete" defaultMessage="Eliminar comentario" />
                      </button>
                    </div>
                )}
              </div>
          )}
        </div>
        {!isEditing ? (
            <div>{c.text}</div>
        ) : (
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end comment-edit-row">
              <input
                  type="text"
                  className="form-control"
                  defaultValue={c.text}
                  ref={(el) => {
                    if (isEditing) editRef.current = el;
                  }}
              />
              <Button variant="primary" className="btn-sm" onClick={() => handleSaveEdit(c.id)}>
                <i className="fa fa-check me-1" aria-hidden="true" />
                <FormattedMessage id="project.executions.comments.save" defaultMessage="Guardar comentario" />
              </Button>
              <Button variant="outline" className="btn-sm" onClick={() => setEditingId(null)}>
                <i className="fa fa-times me-1" aria-hidden="true" />
                <FormattedMessage id="project.executions.comments.cancel" defaultMessage="Cancelar" />
              </Button>
            </div>
        )}
      </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userName: PropTypes.string,
    text: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userName: PropTypes.string,
  }),
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  openMenu: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setOpenMenu: PropTypes.func.isRequired,
  startEdit: PropTypes.func.isRequired,
  handleDeleteComment: PropTypes.func.isRequired,
  editRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  handleSaveEdit: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  menuRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  setEditingId: PropTypes.func.isRequired,
};

const renderSetRow = (s, isTime) => (
    <tr key={s.index}>
      <td style={{ width: '60px' }}>{s.index}</td>
      <td>{isTime ? (s.seconds ?? '-') : (s.reps ?? '-')}</td>
      <td>{s.weight ?? '-'}</td>
    </tr>
);


const renderSetsDetailsTable = (setsDetails, isTime) => (
    <table className="table table-sm mb-0">
      <thead>
      <tr>
        <th>#</th>
        <th>
          {isTime ? (
              <FormattedMessage id="project.executions.exercise.seconds" defaultMessage="Segundos" />
          ) : (
              <FormattedMessage id="project.executions.exercise.repsShort" defaultMessage="Reps" />
          )}
        </th>
        <th><FormattedMessage id="project.executions.exercise.weight" defaultMessage="Peso (kg)" /></th>
      </tr>
      </thead>
      <tbody>
      {setsDetails.map(s => renderSetRow(s, isTime))}
      </tbody>
    </table>
);

const renderCardioDetails = (ex, formatDuration) => (
    <div className="d-flex flex-column gap-2 align-items-start">
    <span className="badge text-bg-primary px-3 py-2" style={{ fontSize: '1rem' }}>
      <FormattedMessage
          id="project.executions.exercise.distanceValue"
          defaultMessage="Distancia: {value} m"
          values={{ value: ex.distanceMeters != null ? ex.distanceMeters : '-' }}
      />
    </span>
      <span className="badge text-bg-secondary px-3 py-2" style={{ fontSize: '1rem' }}>
      <FormattedMessage
          id="project.executions.exercise.timeValue"
          defaultMessage="Tiempo: {value}"
          values={{ value: formatDuration(ex.durationSeconds) + " min" }}
      />
    </span>
    </div>
);

const renderExerciseDetails = (ex, isCardio, isTime, formatDuration) => {
  if (isCardio) {
    return renderCardioDetails(ex, formatDuration);
  }

  if (Array.isArray(ex.setsDetails) && ex.setsDetails.length > 0) {
    return renderSetsDetailsTable(ex.setsDetails, isTime);
  }

  return <span className="text-muted">-</span>;
};


const RoutineExecutionDetail = () => {
  const { executionId } = useParams();
  const location = useLocation();
  const [execution, setExecution] = useState(null);
  const currentUser = useSelector(users.selectors.getUser);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [likers, setLikers] = useState([]);
  const [likersLoading, setLikersLoading] = useState(false);
  const [exercisesDetails, setExercisesDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentRef] = useState(() => ({ current: null }));
  const [editingId, setEditingId] = useState(null);
  const [editRef] = useState(() => ({ current: null }));
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const intl = useIntl();

  const resolveUserId = (c) =>
    c?.userId ?? c?.user?.id ?? c?.user?.userId ?? c?.userID;

  const resolveUserName = (c) =>
    c?.userName ?? c?.user?.userName ?? c?.user?.name ?? c?.user?.username;

  const normalizeComment = (c) => ({
    ...c,
    userId: resolveUserId(c),
    userName: resolveUserName(c),
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);


  useEffect(() => {
    const loadExecution = async () => {
      const st = location?.state;
      // Prefer public endpoint when coming from feed or public profile to avoid 403 errors
      const preferPublic = !!st?.fromPublicProfile || !!st?.fromFeed;
      let response;
      
      if (preferPublic) {
        // Try public endpoint first
        response = await backend.routineExecutionService.findPublicById(executionId);
        // If public fails, try private (owner viewing their own)
        if (!response.ok) {
          response = await backend.routineExecutionService.findById(executionId);
        }
      } else {
        // Try private endpoint first (e.g., from history)
        response = await backend.routineExecutionService.findById(executionId);
        // If private fails (403), try public
        if (!response.ok) {
          response = await backend.routineExecutionService.findPublicById(executionId);
        }
      }
      handleResponse(response, { showSuccessToast: false });
      if (response.ok) {
        const exec = response.payload;
        setExecution(exec);

        // Load exercise details
        const details = {};
        await Promise.all(
          (exec.exercises || []).map(async (ex) => {
            const r = await backend.exerciseService.findById(ex.exerciseId);
            if (r.ok) details[ex.exerciseId] = r.payload;
          })
        );
        setExercisesDetails(details);

        // Load comments
        setCommentsLoading(true);
        const commentsResp = await backend.routineExecutionService.getComments(executionId);
        if (commentsResp.ok) {
          const normalized = (commentsResp.payload || []).map(normalizeComment);
          setComments(normalized);
        }
        setCommentsLoading(false);
      }
      setLoading(false);
    };
    loadExecution();
  }, [executionId, location?.state]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <LoadingSpinner overlay={true} size="md" message="" />
      </div>
    );
  }

  const backTarget = (() => {
    const st = location?.state;
    if (st?.fromFeed) {
        return '/feed';
    }
    return st?.fromPublicProfile && st?.userId
        ? `/users/${st.userId}`
        : '/routines/executions';
  })();

  if (!execution) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning shadow-sm">
          <FormattedMessage id="project.executions.detail.notFound" defaultMessage="No se encontró la ejecución." />
        </div>
        <Button variant="secondary" icon="fa-arrow-left" onClick={() => navigate(backTarget)} className="mt-3">
          <FormattedMessage id="project.executions.detail.back" defaultMessage="Volver al historial" />
        </Button>
      </div>
    );
  }

  const toggleLike = async () => {
    if (!execution) return;
    setLikeLoading(true);
    const call = execution.likedByCurrentUser ? backend.routineExecutionService.unlike : backend.routineExecutionService.like;
    const response = await call(execution.id);
    handleResponse(response, { showSuccessToast: false });
    if (response.ok) {
      setExecution(response.payload);
    }
    setLikeLoading(false);
  };

  const openLikers = async () => {
    if (!execution) return;
    setShowLikers(true);
    setLikersLoading(true);
    const resp = await backend.routineExecutionService.getLikers(execution.id);
    if (resp.ok) setLikers(Array.isArray(resp.payload) ? resp.payload : []);
    setLikersLoading(false);
  };

  const handleAddComment = async () => {
    if (!execution || !newCommentRef.current) return;
    const text = newCommentRef.current.value?.trim();
    if (!text) return;
    const resp = await backend.routineExecutionService.addComment(execution.id, text);
    handleResponse(resp, { showSuccessToast: false });
    if (resp.ok) {
      const enriched = normalizeComment({
        ...resp.payload,
        userId: resolveUserId(resp.payload) ?? currentUser?.id,
        userName: resolveUserName(resp.payload) ?? currentUser?.userName,
      });
      setComments((prev) => [enriched, ...prev]);
      newCommentRef.current.value = '';
    }
  };

  const handleDeleteComment = async (commentId) => {
    const resp = await backend.routineExecutionService.deleteComment(commentId);
    handleResponse(resp, { showSuccessToast: false });
    if (resp.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    if (editRef.current) {
      editRef.current.value = comment.text;
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editRef.current) return;
    const text = editRef.current.value?.trim();
    const resp = await backend.routineExecutionService.updateComment(commentId, text);
    handleResponse(resp, { showSuccessToast: false });
    if (resp.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? normalizeComment({ ...c, ...resp.payload }) : c))
      );
      setEditingId(null);
    }
  };

  const formatDuration = (totalSeconds) => {
    const total = Number(totalSeconds);
    if (!Number.isFinite(total) || total < 0) return '-';
    const minutes = Math.floor(total / 60);
    const seconds = Math.round(total % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const sanitizeNote = (note, exerciseName) => {
    if (!note) return '';
    if (!exerciseName) return note;
    const escaped = exerciseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleaned = note.replace(new RegExp(escaped, 'gi'), '').trim();
    return cleaned || note;
  };

  const renderExercises = () => {
    if (!execution?.exercises?.length) {
      return (
        <p className="text-muted">
          <FormattedMessage id="project.executions.detail.noExercises" defaultMessage="No hay ejercicios registrados." />
        </p>
      );
    }

    const musclesView = (muscles) =>
      muscles.length > 0 ? (
        <div className="muscle-tags">
          {muscles.map((m) => (
            <span key={m} className="muscle-tag">
              {translateMuscle(m, intl)}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-muted">-</span>
      );

    const hasDetails = execution.exercises.some((ex) => Array.isArray(ex.setsDetails) && ex.setsDetails.length > 0);
    if (!hasDetails) {
      return (
        <div className="table-responsive shadow-sm rounded-4 border border-light-subtle">
          <table className="table align-middle mb-0">
                        <thead className="table-light">
              <tr>
                <th><i className="fa fa-dumbbell me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.name" defaultMessage="Ejercicio" /></th>
                <th><i className="fa fa-bolt me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.muscles" defaultMessage="Músculos" /></th>
                <th><i className="fa fa-tags me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.type" defaultMessage="Tipo" /></th>
                <th><i className="fa fa-road me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.distance" defaultMessage="Distancia (m)" /></th>
                <th><i className="fa fa-clock me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.time" defaultMessage="Tiempo" /></th>
                <th><i className="fa fa-layer-group me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.sets" defaultMessage="Series" /></th>
                <th><i className="fa fa-redo me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.reps" defaultMessage="Reps" /></th>
                <th><i className="fa fa-weight-hanging me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.weight" defaultMessage="Peso (kg)" /></th>
                <th><i className="fa fa-sticky-note me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.notes" defaultMessage="Notas" /></th>
              </tr>
            </thead>
            <tbody>
              {execution.exercises.map((ex) => {
                const info = exercisesDetails[ex.exerciseId];
                const muscles = Array.isArray(info?.muscles) ? info.muscles : [];
                const isCardio = ex.type === "CARDIO";
                const exerciseName = info?.name || `#${ex.exerciseId}`;
                const noteText = sanitizeNote(ex.notes, exerciseName);
                const distanceText = isCardio && ex.distanceMeters != null ? `${ex.distanceMeters} m` : "-";
                const durationText = isCardio ? `${formatDuration(ex.durationSeconds)} min` : "-";
                return (
                  <tr key={ex.exerciseId}>
                    <td className="fw-semibold">{exerciseName}</td>
                    <td>{musclesView(muscles)}</td>
                    <td>
                      {getExerciseTypeBadge(ex)}
                    </td>
                    <td>
                    {isCardio ? (
                        <span className="badge text-bg-primary px-3 py-2" style={{ fontSize: '1rem' }}>{distanceText}</span>
                      ) : (
                        distanceText
                      )}
                    </td>
                    <td>
                      {isCardio ? (
                        <span className="badge text-bg-secondary px-3 py-2" style={{ fontSize: '1rem' }}>{durationText}</span>
                      ) : (
                        durationText
                      )}
                    </td>
                    <td><span className="badge text-bg-secondary">{ex.performedSets ?? "-"}</span></td>
                    <td><span className="badge text-bg-info text-white">{ex.performedReps ?? "-"}</span></td>
                    <td><span className="badge text-bg-light border">{ex.weightUsed ?? 0}</span></td>
                    <td className="text-muted small">{noteText || ex.notes || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="table-responsive shadow-sm rounded-4 border border-light-subtle">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th><i className="fa fa-dumbbell me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.name" defaultMessage="Ejercicio" /></th>
              <th><i className="fa fa-bolt me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.muscles" defaultMessage="Músculos" /></th>
              <th><i className="fa fa-tags me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.type" defaultMessage="Tipo" /></th>
              <th><i className="fa fa-list-ol me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.setsDetail" defaultMessage="Detalle series" /></th>
              <th><i className="fa fa-sticky-note me-2" aria-hidden="true" /> <FormattedMessage id="project.executions.exercise.notes" defaultMessage="Notas" /></th>
            </tr>
          </thead>
          <tbody>
            {execution.exercises.map((ex) => {
              const info = exercisesDetails[ex.exerciseId];
                const muscles = Array.isArray(info?.muscles) ? info.muscles : [];
                const isTime = ex.type === 'TIME';
                const isCardio = ex.type === 'CARDIO';
                const exerciseName = info?.name || `#${ex.exerciseId}`;
                const noteText = sanitizeNote(ex.notes, exerciseName);
                return (
                  <tr key={ex.exerciseId}>
                  <td className="fw-semibold">{exerciseName}</td>
                  <td>{musclesView(muscles)}</td>
                  <td>
                    {getExerciseTypeBadge(ex)}
                  </td>
                  <td style={{ verticalAlign: 'top' }} className="text-start">
                    {renderExerciseDetails(ex, isCardio, isTime, formatDuration)}
                  </td>
                  <td className="text-muted small">{noteText || ex.notes || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderComments = () => {
    if (commentsLoading) {
      return <LoadingSpinner overlay={false} size="sm" message="" />;
    }
    if (comments.length === 0) {
      return (
        <p className="text-muted">
          <FormattedMessage id="project.executions.comments.empty" defaultMessage="Aâ”œâ•‘n no hay comentarios." />
        </p>
      );
    }
    return (
      <div className="list-group list-group-flush">
        {comments.map((c) => <CommentItem key={c.id} comment={c} currentUser={currentUser} editingId={editingId} openMenu={openMenu} setOpenMenu={setOpenMenu} startEdit={startEdit} handleDeleteComment={handleDeleteComment} editRef={editRef} handleSaveEdit={handleSaveEdit} menuRef={menuRef} intl={intl} />)}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
        <div>
          <div className="d-inline-flex align-items-center gap-2">
            <span className="badge rounded-pill text-bg-primary px-3 py-2 shadow-sm">
              <i className="fa fa-dumbbell me-2" aria-hidden="true" />
              <FormattedMessage id="project.executions.title" defaultMessage="Historial de rutinas" />
            </span>
          </div>
          <h3 className="fw-bold mt-2 mb-0">{execution.routineName}</h3>
          <div className="text-muted small">
            {execution.performedAt
              ? new Date(execution.performedAt).toLocaleString()
              : intl.formatMessage({ id: 'project.executions.noDate', defaultMessage: 'No disponible' })}
          </div>
        </div>
        <ButtonGroup
          className="execution-actions"
          primaryActions={[
            {
              label: (execution.likesCount ?? 0).toString(),
              variant: execution.likedByCurrentUser ? 'danger' : 'outline',
              className: !execution.likedByCurrentUser ? 'text-danger border-danger' : '',
              icon: 'fa-heart',
              disabled: likeLoading,
              onClick: toggleLike
            },
            ...(currentUser && execution && currentUser.id === execution.userId ? [
              {
                label: <FormattedMessage id="project.routines.details.savedUsers" defaultMessage="Ver" />,
                variant: 'ghost',
                icon: 'fa-users',
                onClick: openLikers
              }
            ] : []),
            {
              label: <FormattedMessage id="project.executions.detail.back" defaultMessage="Volver" />,
              variant: 'secondary',
              icon: 'fa-arrow-left',
              onClick: () => navigate(backTarget)
            }
          ]}
        />
      </div>

      <div className="card shadow-sm border-0 mb-4 overflow-hidden">
        <div className="card-body bg-light">
          <div className="d-flex flex-wrap gap-4 align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center time-pill-row">
              <div className="time-pill">
                <span className="label"><i className="fa fa-stopwatch me-1" aria-hidden="true" /><FormattedMessage id="project.executions.detail.duration.label" defaultMessage="Duraciâ”œâ”‚n" /></span>
                <span className="value">
                  {Number.isFinite(execution.totalDurationSec)
                    ? new Date((execution.totalDurationSec || 0) * 1000).toISOString().substring(11, 19)
                    : '--:--:--'}
                </span>
              </div>
              {execution.startedAt && (
                <div className="time-pill">
                  <span className="label"><i className="fa fa-play-circle me-1" aria-hidden="true" /><FormattedMessage id="project.executions.detail.start.label" defaultMessage="Inicio" /></span>
                  <span className="value">{new Date(execution.startedAt).toLocaleTimeString()}</span>
                </div>
              )}
              {execution.finishedAt && (
                <div className="time-pill">
                  <span className="label"><i className="fa fa-flag-checkered me-1" aria-hidden="true" /><FormattedMessage id="project.executions.detail.end.label" defaultMessage="Fin" /></span>
                  <span className="value">{new Date(execution.finishedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <i className="fa fa-calendar-alt" aria-hidden="true" />
              <span>
                {execution.performedAt
                  ? new Date(execution.performedAt).toLocaleString()
                  : intl.formatMessage({ id: 'project.executions.noDate', defaultMessage: 'No disponible' })}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <div className="info-chip">
              <i className="fa fa-dumbbell me-2" aria-hidden="true" />
              <FormattedMessage id="project.executions.detail.exercises" defaultMessage="Ejercicios realizados" />: {' '}
              <strong>{execution.exercises?.length ?? 0}</strong>
            </div>
            {Number.isFinite(execution.totalDurationSec) && (
              <div className="info-chip">
                <i className="fa fa-clock me-2" aria-hidden="true" />
                {new Date((execution.totalDurationSec || 0) * 1000).toISOString().substring(11, 19)}
              </div>
            )}
          </div>

          <h5 className="mt-4 mb-3">
            <FormattedMessage id="project.executions.detail.exercises" defaultMessage="Ejercicios realizados" />
          </h5>

          {renderExercises()}
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light fw-semibold">
          <FormattedMessage id="project.executions.comments.title" defaultMessage="Comentarios" />
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary mb-2">
              <FormattedMessage id="project.executions.comments.add" defaultMessage="Publicar" />
            </label>
            <div className="input-group shadow-sm comment-input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa fa-comment-dots text-primary" aria-hidden="true" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={intl.formatMessage({ id: 'project.executions.comments.add', defaultMessage: 'Publicar' })}
                ref={(el) => (newCommentRef.current = el)}
              />
              <Button variant="primary" className="input-group-text border-0 publish-btn" onClick={handleAddComment}>
                <i className="fa fa-paper-plane" aria-hidden="true" />
                <FormattedMessage id="project.executions.comments.add" defaultMessage="Publicar" />
              </Button>
            </div>
          </div>

          {renderComments()}
        </div>
      </div>

    <style>{`
        .gradient-panel {
          background: linear-gradient(120deg, #0d6efd 0%, #6f42c1 50%, #0dcaf0 100%);
        }
        .info-chip {
          background: #f5f7fb;
          border: 1px solid #e7ebf3;
          color: #344054;
          border-radius: 999px;
          padding: 6px 14px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }
        .info-chip i {
          margin-right: 4px;
        }
        .badge.rounded-pill i {
          margin-right: 6px;
        }
        .info-chip + .info-chip {
          margin-left: 8px;
        }
        .time-pill-row + .text-muted i {
          margin-right: 6px;
        }
        table {
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background-color: #f8f9fa;
          color: #333;
          font-weight: 600;
        }
        td {
          vertical-align: middle;
        }
        .muscle-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .time-pill {
          background: #fff;
          border: 1px solid #e7ebf3;
          border-radius: 12px;
          padding: 8px 12px;
          display: inline-flex;
          flex-direction: column;
          min-width: 130px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .time-pill .label {
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.04em;
          color: #6c757d;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .time-pill .value {
          font-weight: 700;
          font-size: 1rem;
          color: #1f2a44;
        }
        .time-pill-row {
          gap: 14px;
          row-gap: 12px;
        }
        .time-pill-row .time-pill {
          margin-right: 6px;
        }
        .comment-input-group {
          gap: 10px;
        }
        .comment-actions {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .comment-actions .trainium-btn {
          min-width: 34px;
          height: 34px;
          border-radius: 12px;
          padding: 0.35rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        }
        .comment-actions .trainium-btn:hover {
          background: #e5e7eb;
        }
        .comment-actions .trainium-btn i {
          margin-right: 0 !important;
          font-size: 0.95rem;
          color: #1f2937;
        }
        .comment-menu {
          position: absolute;
          top: 44px;
          right: 0;
          background: #11131a;
          border: 1px solid #1f2530;
          border-radius: 12px;
          min-width: 180px;
          z-index: 5;
          padding: 6px 0;
          box-shadow: 0 12px 26px rgba(0,0,0,0.3);
        }
        .comment-menu__item {
          width: 100%;
          border: none;
          background: transparent;
          color: #e9edf5;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
          font-size: 0.9rem;
        }
        .comment-menu__item:hover {
          background: rgba(255,255,255,0.08);
          cursor: pointer;
        }
        .comment-input-group .trainium-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .comment-input-group .trainium-btn .trainium-btn__icon,
        .comment-input-group .trainium-btn i {
          margin-right: 10px !important;
        }
        .publish-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.5rem 0.9rem;
          min-width: 130px;
        }
        .comment-edit-row {
          gap: 10px;
        }
        .muscle-tag {
          background-color: #edf4ff;
          color: #004a99;
          border-radius: 14px;
          padding: 4px 10px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #cfe0ff;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        .card {
          border-radius: 10px;
        }
        .btn-outline-secondary {
          border-radius: 8px;
        }
        .execution-actions.trainium-button-group {
          gap: 0.9rem;
        }
        .execution-actions.trainium-button-group .btn {
          min-width: 120px;
        }
        @media (max-width: 576px) {
          .execution-actions.trainium-button-group {
            gap: 0.65rem;
            width: 100%;
          }
          .execution-actions.trainium-button-group .btn {
            flex: 1 1 auto;
          }
        }
      `}</style>
      {showLikers && (
        <div className="confirm-modal-overlay">
          <button
            type="button"
            className="confirm-modal-backdrop"
            aria-label={intl.formatMessage({ id: 'project.common.errorDialog.close', defaultMessage: 'Cerrar ventana' })}
            onClick={() => setShowLikers(false)}
            style={{
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'transparent'
            }}
          />
          <dialog
            className="confirm-modal"
            open
            aria-labelledby="likers-title"
          >
            <div
              className="confirm-modal__content"
            >
              <h2 id="likers-title" className="confirm-modal__title">
                <FormattedMessage id="project.executions.likers.title" defaultMessage="A quiâ”œÂ®n le gusta" />
              </h2>

              {likersLoading ? (
                <div className="py-3 text-center">
                  <LoadingSpinner overlay={false} size="sm" message="" />
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {likers.length === 0 ? (
                    <div className="text-muted"><FormattedMessage id="project.executions.likers.empty" defaultMessage="Nadie aâ”œâ•‘n" /></div>
                  ) : (
                    likers.map((name) => (
                      <div
                        key={name}
                        className="list-group-item d-flex align-items-center gap-3"
                      >
                        <i className="fa fa-user" aria-hidden="true"></i>
                        <div className="fw-semibold">{name}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="confirm-modal__actions">
                <Button
                  variant="outline"
                  onClick={() => setShowLikers(false)}
                  fullWidth
                >
                  <FormattedMessage id="project.common.errorDialog.close" defaultMessage="Cerrar" />
                </Button>
              </div>
            </div>
          </dialog>
        </div>
      )}

    </div>
  );
};

export default RoutineExecutionDetail;
