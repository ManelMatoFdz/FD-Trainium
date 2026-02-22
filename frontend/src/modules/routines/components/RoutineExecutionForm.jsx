import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import backend from '../../../backend';
import { handleResponse, Button, LoadingSpinner } from '../../common';

const RoutineExecutionForm = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Timing (auto + manual override)
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef(null);
  const [manualDurationEnabled, setManualDurationEnabled] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualSeconds, setManualSeconds] = useState('');

  const toNumberOrNull = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  };

  const pickFirstNumber = (...vals) => {
    for (const v of vals) {
      const num = toNumberOrNull(v);
      if (num !== null) return num;
    }
    return null;
  };

  const mapExerciseForForm = (ex) => {
    const type = (ex.type === 'TIME' || ex.type === 'REPS' || ex.type === 'CARDIO') ? ex.type : 'REPS';

    if (type === 'CARDIO') {
      const distancePreset = pickFirstNumber(ex.sets, ex.cardioDistance, ex.distanceMeters);
      const durationPreset = pickFirstNumber(ex.repetitions, ex.cardioDuration, ex.durationSeconds);
      const hasDistance = distancePreset !== null;
      const hasDuration = durationPreset !== null;
      const minutes = hasDuration ? Math.floor(durationPreset / 60) : '';
      const seconds = hasDuration ? durationPreset % 60 : '';
      return {
        exerciseId: ex.id,
        name: ex.name,
        type,
        distanceMeters: hasDistance ? distancePreset : '',
        durationMinutes: minutes,
        durationSeconds: seconds,
        distancePreset,
        durationPreset,
        notes: '',
        setsDetails: [],
      };
    }

    const initialSets = Number.isFinite(ex.sets) && ex.sets > 0 ? ex.sets : 1;
    const defaultPerSet =
      Number.isFinite(ex.repetitions) && ex.repetitions > 0
        ? ex.repetitions
        : '';

    const setsDetails = Array.from({ length: initialSets }).map((_, i) => ({
      index: i + 1,
      reps: type === 'REPS' ? defaultPerSet : undefined,
      seconds: type === 'TIME' ? defaultPerSet : undefined,
      weight: '',
    }));

    return {
      exerciseId: ex.id,
      name: ex.name,
      type,
      setsDetails,
      notes: '',
    };
  };


  // Carga la rutina al montar el componente
  useEffect(() => {
    const loadRoutine = async () => {
      const response = await backend.routineService.findById(routineId);
      handleResponse(response, { showSuccessToast: false });

      if (response.ok) {
        const data = response.payload;
        setRoutine(data);
        setExercises((data.exercises || []).map(mapExerciseForForm));
      }

      setLoading(false);
    };
    loadRoutine();
  }, [routineId]);

  // Start timing when component mounts
  useEffect(() => {
    const now = new Date();
    setStartedAt(now.toISOString());
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Validación por ejercicio
  const validateExercise = (exercise) => {
    const errors = {};

    if (exercise.type === 'CARDIO') {
      const hasDistance = exercise.distanceMeters !== '' && exercise.distanceMeters !== null && exercise.distanceMeters !== undefined;
      const distanceVal = Number(exercise.distanceMeters);
      const invalidDistance = hasDistance && (Number.isNaN(distanceVal) || distanceVal < 0);

      const hasDuration = (exercise.durationMinutes !== '' && exercise.durationMinutes !== null && exercise.durationMinutes !== undefined)
        || (exercise.durationSeconds !== '' && exercise.durationSeconds !== null && exercise.durationSeconds !== undefined);
      const minutes = Number(exercise.durationMinutes || 0);
      const seconds = Number(exercise.durationSeconds || 0);
      const invalidSeconds = hasDuration && (Number.isNaN(seconds) || seconds < 0 || seconds > 59);
      const invalidMinutes = hasDuration && (Number.isNaN(minutes) || minutes < 0);

      if (invalidDistance) {
        errors.distanceMeters = 'Distancia inválida';
      }
      if (hasDuration && (invalidMinutes || invalidSeconds)) {
        errors.duration = 'Duración inválida';
      }
      return errors;
    }

    const totalSets = Array.isArray(exercise.setsDetails)
      ? exercise.setsDetails.length
      : 0;

    if (totalSets < 1) {
      errors.setsDetails = 'Debes indicar al menos 1 serie';
      return errors;
    }

    (exercise.setsDetails || []).forEach((s, idx) => {
      const setIndex = idx + 1;

      if (exercise.type === 'TIME') {
        const invalidSeconds = !s.seconds || Number(s.seconds) <= 0;
        if (invalidSeconds) {
          errors[`set_${setIndex}_seconds`] = 'Segundos inválidos';
        }
      }

      if (exercise.type === 'REPS') {
        const invalidReps = !s.reps || Number(s.reps) <= 0;
        if (invalidReps) {
          errors[`set_${setIndex}_reps`] = 'Repeticiones inválidas';
        }
      }

      const invalidWeight = s.weight !== '' && Number(s.weight) < 0;
      if (invalidWeight) {
        errors[`set_${setIndex}_weight`] = 'El peso no puede ser negativo';
      }
    });

    return errors;
  };

  // Cambios en campos
  const handleChangeNote = (index, value) => {
    const updated = [...exercises];
    updated[index].notes = value;
    setExercises(updated);
  };

  const handleCardioFieldChange = (index, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSetRow = (exIndex) => {
    if (exercises[exIndex]?.type === 'CARDIO') return;
    setExercises((prev) => prev.map((item, idx) => {
      if (idx !== exIndex) return item;
      const rows = Array.isArray(item.setsDetails) ? [...item.setsDetails] : [];
      const nextIndex = rows.length + 1;
      const newRow = {
        index: nextIndex,
        reps: item.type === 'REPS' ? '' : undefined,
        seconds: item.type === 'TIME' ? '' : undefined,
        weight: ''
      };
      return { ...item, setsDetails: [...rows, newRow] };
    }));
  };

  const removeSetRow = (exIndex) => {
    if (exercises[exIndex]?.type === 'CARDIO') return;
    setExercises((prev) => prev.map((item, idx) => {
      if (idx !== exIndex) return item;
      const rows = Array.isArray(item.setsDetails) ? item.setsDetails : [];
      if (rows.length <= 1) return item;
      return { ...item, setsDetails: rows.slice(0, -1) };
    }));
  };

  const handleSetFieldChange = (exIndex, setIndex, field, value) => {
    if (exercises[exIndex]?.type === 'CARDIO') return;
    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exIndex];
      const rows = [...ex.setsDetails];
      const row = { ...rows[setIndex] };
      row[field] = value;
      rows[setIndex] = row;
      ex.setsDetails = rows;
      return next;
    });
  };

  // Validación general
  const validateForm = () => {
    const errors = {};
    exercises.forEach((ex, i) => {
      const e = validateExercise(ex);
      if (Object.keys(e).length > 0) errors[i] = e;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    const totalDurationSec = manualDurationEnabled
      ? (Number(manualMinutes) * 60 + Number(manualSeconds || 0)) || 0
      : Math.max(0, Math.round(elapsedSec));

    const adaptExercise = (ex) => {
      if (ex.type === 'CARDIO') {
        const meters = ex.distanceMeters !== '' ? Number(ex.distanceMeters) : null;
        const hasDurationInput = (ex.durationMinutes !== '' && ex.durationMinutes !== null && ex.durationMinutes !== undefined)
          || (ex.durationSeconds !== '' && ex.durationSeconds !== null && ex.durationSeconds !== undefined);
        let totalSeconds = null;
        if (hasDurationInput) {
          const minutes = Number(ex.durationMinutes || 0);
          const seconds = Number(ex.durationSeconds || 0);
          totalSeconds = (!Number.isNaN(minutes) && !Number.isNaN(seconds))
            ? (minutes * 60 + seconds)
            : null;
        }

        return {
          exerciseId: ex.exerciseId,
          type: ex.type,
          distanceMeters: meters,
          durationSeconds: totalSeconds,
          notes: ex.notes?.trim() || '',
          setsDetails: [],
        };
      }

      const performedSets = ex.setsDetails.length;

      const sum = ex.setsDetails.reduce(
        (acc, s) => acc + Number((ex.type === 'TIME' ? s.seconds : s.reps) || 0),
        0
      );

      let weightUsed = 0;
      for (let i = ex.setsDetails.length - 1; i >= 0; i--) {
        const w = Number(ex.setsDetails[i].weight);
        if (!Number.isNaN(w) && w > 0) {
          weightUsed = w;
          break;
        }
      }
      return {
        exerciseId: ex.exerciseId,
        type: ex.type,
        performedSets,
        performedReps: sum,
        weightUsed,
        notes: ex.notes?.trim() || '',
        setsDetails: ex.setsDetails.map((s) => {
          let repsValue;
          let secondsValue;

          if (ex.type === 'REPS') {
            repsValue = s.reps ? Number(s.reps) : undefined;
          }

          if (ex.type === 'TIME') {
            secondsValue = s.seconds ? Number(s.seconds) : undefined;
          }

          const weightValue = s.weight !== '' ? Number(s.weight) : undefined;

          return {
            index: s.index,
            reps: repsValue,
            seconds: secondsValue,
            weight: weightValue,
          };
        }),
      };
    };

    const payload = {
      routineId: routine.id,
      startedAt: startedAt || undefined,
      finishedAt: new Date().toISOString(),
      totalDurationSec,
      exercises: exercises.map(adaptExercise),
    };

    const response = await backend.routineExecutionService.create(payload);
    setSaving(false);
    // Toast de éxito al guardar
    handleResponse(response, { 
      successMessage: intl.formatMessage({
        id: 'project.routines.execution.saveSuccess',
        defaultMessage: 'Rutina realizada correctamente.'
      })
    });
    if (response.ok) {
      navigate(`/routines/${routineId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <LoadingSpinner overlay={true} size="md" message="" />
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <FormattedMessage id="project.routines.execution.notFound" defaultMessage="No se encontró la rutina." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{routine.name}</h3>
        <Button
          variant="secondary"
          icon="fa-arrow-left"
          onClick={() => navigate(`/routines/${routineId}`)}
        >
          <FormattedMessage id="project.routines.execution.back" defaultMessage="Volver" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Timing summary and manual override */}
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <span><FormattedMessage id="project.routines.execution.timing" defaultMessage="Duración de la ejecución" /></span>
            <span className="text-muted">
              {manualDurationEnabled ? (
                <FormattedMessage id="project.routines.execution.duration.manual" defaultMessage="Duración manual" />
              ) : (
                <FormattedMessage id="project.routines.execution.duration.auto" defaultMessage="Duración automática" />
              )}
            </span>
          </div>
          <div className="card-body">
            {!manualDurationEnabled && (
              <div className="mb-2">
                <strong><FormattedMessage id="project.routines.execution.elapsed" defaultMessage="Transcurrido:" /> </strong>
                {new Date(elapsedSec * 1000).toISOString().substring(11, 19)}
              </div>
            )}
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="manualDurationSwitch"
                     checked={manualDurationEnabled}
                     onChange={(e) => setManualDurationEnabled(e.target.checked)} />
              <label className="form-check-label" htmlFor="manualDurationSwitch">
                <FormattedMessage id="project.routines.execution.setManualDuration" defaultMessage="Establecer duración manual" />
              </label>
            </div>
            {manualDurationEnabled && (
              <div className="row g-2 align-items-end">
                <div className="col-auto">
                  <label className="form-label" htmlFor="manualMinutesInput"><FormattedMessage id="project.routines.execution.minutes" defaultMessage="Minutos" /></label>
                  <input type="number" min="0" className="form-control" id="manualMinutesInput" value={manualMinutes}
                         onChange={(e) => setManualMinutes(e.target.value)} />
                </div>
                <div className="col-auto">
                  <label className="form-label" htmlFor="manualSecondsInput"><FormattedMessage id="project.routines.execution.seconds" defaultMessage="Segundos" /></label>
                  <input type="number" min="0" max="59" className="form-control" id="manualSecondsInput" value={manualSeconds}
                         onChange={(e) => setManualSeconds(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-light">
            <FormattedMessage id="project.routines.execution.title" defaultMessage="Registra tu ejecución" />
          </div>

          <div className="card-body">
            {exercises.map((ex, i) => {
              const errors = formErrors[i] || {};
              const isTime = ex.type === 'TIME';
              const isCardio = ex.type === 'CARDIO';
              return (
                <div key={ex.exerciseId} className="border rounded p-3 mb-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-semibold mb-0">{ex.name}</h6>
                    {(() => {
                      let badgeClass, badgeText;
                      if (isCardio) {
                        badgeClass = 'text-bg-primary';
                        badgeText = 'Cardio';
                      } else if (isTime) {
                        badgeClass = 'text-bg-warning';
                        badgeText = 'Tiempo';
                      } else {
                        badgeClass = 'text-bg-success';
                        badgeText = 'Repeticiones';
                      }
                      return <span className={`badge rounded-pill ${badgeClass}`}>{badgeText}</span>;
                    })()}
                  </div>

                  {!isCardio && (
                    <>
                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>{isTime ? 'Segundos' : 'Reps'}</th>
                              <th><FormattedMessage id="project.routines.execution.weight" defaultMessage="Peso (kg)" /></th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.setsDetails.map((row, sIdx) => (
                              <tr key={row.index}>
                                <td style={{width: '60px'}}>{row.index}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    className={[
                                      "form-control",
                                      "form-control-sm",
                                      errors[`set_${sIdx + 1}_${isTime ? 'seconds' : 'reps'}`] && "is-invalid"
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    value={isTime ? (row.seconds ?? '') : (row.reps ?? '')}
                                    onChange={(e) =>
                                      handleSetFieldChange(
                                        i,
                                        sIdx,
                                        isTime ? 'seconds' : 'reps',
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    className={[
                                      "form-control",
                                      "form-control-sm",
                                      errors[`set_${sIdx + 1}_weight`] && "is-invalid"
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    value={row.weight ?? ''}
                                    onChange={(e) => handleSetFieldChange(i, sIdx, 'weight', e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="d-flex gap-2 mb-3">
                        <Button type="button" variant="outline" icon="fa-plus" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addSetRow(i); }}>
                          <FormattedMessage id="project.routines.execution.addSet" defaultMessage="A�adir serie" />
                        </Button>
                        <Button type="button" variant="outline" icon="fa-minus" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSetRow(i); }}>
                          <FormattedMessage id="project.routines.execution.removeSet" defaultMessage="Quitar �ltima" />
                        </Button>
                      </div>
                    </>
                  )}

                  {isCardio && (
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label" htmlFor={`cardioDistance-${i}`}>Distancia (m)</label>
                        <input
                          type="number"
                          min="0"
                          id={`cardioDistance-${i}`}
                          className={['form-control', errors.distanceMeters && 'is-invalid'].filter(Boolean).join(' ')}
                          value={ex.distanceMeters}
                          placeholder={ex.distancePreset != null ? ex.distancePreset : ''}
                          onChange={(e) => handleCardioFieldChange(i, 'distanceMeters', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" htmlFor={`cardioMinutes-${i}`}>Minutos</label>
                        <input
                          type="number"
                          min="0"
                          id={`cardioMinutes-${i}`}
                          className={['form-control', errors.duration && 'is-invalid'].filter(Boolean).join(' ')}
                          value={ex.durationMinutes}
                          placeholder={ex.durationPreset != null ? Math.floor(ex.durationPreset / 60) : ''}
                          onChange={(e) => handleCardioFieldChange(i, 'durationMinutes', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" htmlFor={`cardioSeconds-${i}`}>Segundos</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          id={`cardioSeconds-${i}`}
                          className={['form-control', errors.duration && 'is-invalid'].filter(Boolean).join(' ')}
                          value={ex.durationSeconds}
                          placeholder={ex.durationPreset != null ? ex.durationPreset % 60 : ''}
                          onChange={(e) => handleCardioFieldChange(i, 'durationSeconds', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor={`exerciseNotes-${i}`}>
                        <FormattedMessage id="project.routines.execution.notes" defaultMessage="Notas" />
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`exerciseNotes-${i}`}
                        maxLength="200"
                        value={ex.notes}
                        onChange={(e) => handleChangeNote(i, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary" icon="fa-save" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>

                <output aria-live="polite" className="visually-hidden">
                  <FormattedMessage id="project.routines.execution.saving" defaultMessage="Guardando..." />
                </output>
              </>
            ) : (
              <FormattedMessage id="project.routines.execution.submit" defaultMessage="Guardar ejecución" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoutineExecutionForm;
