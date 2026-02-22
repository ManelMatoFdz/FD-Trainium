import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import backend from '../../../backend';
import routines from '..';
import { isTrainer, isAdmin } from '../../users/selectors';
import { handleResponse, showError, Button } from '../../common';
import CategorySelector from './CategorySelector';
import { FormattedMessage, useIntl } from 'react-intl';
import * as selectors from "../../users/selectors";

// Mapeos de dificultad
const LEVEL_TEXT = {1: 'Fácil', 2: 'Básico', 3: 'Intermedio', 4: 'Avanzado', 5: 'Experto'};
const TEXT_TO_RATING = {
    'fácil': 1,
    'facil': 1,
    'básico': 2,
    'basico': 2,
    'intermedio': 3,
    'avanzado': 4,
    'experto': 5,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
};
const textToRating = (t) => {
    if (!t) return 0;
    const k = String(t).trim().toLowerCase();
    return TEXT_TO_RATING[k] || 0;
};

// Componente de fila de ejercicio para reducir la anidación en RoutineForm
const ExerciseRow = ({ ex, isChecked, onToggle, onSetsChange, onRepsChange, onCardioDistanceChange, onCardioMinutesChange, onCardioSecondsChange }) => {
    const handleItemClick = () => onToggle(ex.id);
    const handleCheckboxChange = () => onToggle(ex.id);
    const handleSets = (e) => onSetsChange(ex.id, e);
    const handleReps = (e) => onRepsChange(ex.id, e);
    const handleCardioDistance = (e) => {
        e.stopPropagation();
        onCardioDistanceChange(ex.id, e);
    };
    const handleCardioMinutes = (e) => {
        e.stopPropagation();
        onCardioMinutesChange(ex.id, e);
    };
    const handleCardioSeconds = (e) => {
        e.stopPropagation();
        onCardioSecondsChange(ex.id, e);
    };
    const isCardio = ex.type === 'CARDIO';
    
    const exerciseName = ex.name || `Ejercicio #${ex.id}`;
    const setsAriaLabel = `Series para ${exerciseName}`;
    const repsAriaLabel = `Repeticiones para ${exerciseName}`;
    let typeLabel;
    if (isCardio) {
        typeLabel = 'Cardio';
    } else if (ex.type === 'TIME') {
        typeLabel = 'Tiempo';
    } else {
        typeLabel = 'Repeticiones';
    }

    return (
        <button
            key={ex.id}
            type="button"
            className={`list-group-item list-group-item-action d-flex align-items-center ${isChecked ? 'selected' : ''}`}
            onClick={handleItemClick}
            style={{ background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}
        >
            <div className="custom-control custom-checkbox mr-3">
                <input
                    type="checkbox"
                    className="custom-control-input"
                    id={`ex-${ex.id}`}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    aria-label={exerciseName}
                />
                <label className="custom-control-label" htmlFor={`ex-${ex.id}`} aria-hidden="true">
                    <span className="sr-only">{exerciseName}</span>
                </label>
            </div>
            <div className="flex-grow-1">
                <div className="font-weight-bold">{exerciseName}</div>
                <div className="mt-1">
                    <span className="badge badge-primary mr-2">{typeLabel}</span>
                    {ex.material && (
                        <span className="badge badge-light border mr-2">Material: {ex.material}</span>
                    )}
                </div>
            </div>
            {isChecked && !isCardio && (
                <div className="w-100 pl-5 d-flex align-items-center">
                    <div className="form-group mb-0 mr-3">
                        <label htmlFor={`sets-${ex.id}`} className="sr-only">
                            <FormattedMessage id="project.routines.form.modal.sets" defaultMessage="Series" />
                        </label>
                        <input
                            type="number"
                            id={`sets-${ex.id}`}
                            className="form-control form-control-sm"
                            placeholder="Series"
                            min="1"
                            value={ex.sets ?? ''}
                            onChange={handleSets}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={setsAriaLabel}
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label htmlFor={`reps-${ex.id}`} className="sr-only">
                            <FormattedMessage id="project.routines.form.modal.repetitions" defaultMessage="Repeticiones" />
                        </label>
                        <input
                            type="number"
                            id={`reps-${ex.id}`}
                            className="form-control form-control-sm"
                            placeholder="Reps"
                            min="1"
                            value={ex.repetitions ?? ''}
                            onChange={handleReps}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={repsAriaLabel}
                        />
                    </div>
                </div>
            )}
            {isChecked && isCardio && (
                <div className="w-100 pl-5">
                    <div className="d-flex flex-wrap align-items-center" style={{ gap: '0.5rem' }}>
                        <div className="form-group mb-0" style={{ minWidth: '120px' }}>
                            <label htmlFor={`cardio-distance-${ex.id}`} className="sr-only">
                                <FormattedMessage id="project.routines.form.modal.cardioDistance" defaultMessage="Distancia (m)" />
                            </label>
                            <input
                                type="number"
                                id={`cardio-distance-${ex.id}`}
                                className="form-control form-control-sm"
                                placeholder="Distancia (m)"
                                min="0"
                                value={ex.cardioDistance ?? ''}
                                onChange={handleCardioDistance}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="form-group mb-0" style={{ minWidth: '110px' }}>
                            <label htmlFor={`cardio-minutes-${ex.id}`} className="sr-only">
                                <FormattedMessage id="project.routines.form.modal.cardioMinutes" defaultMessage="Minutos" />
                            </label>
                            <input
                                type="number"
                                id={`cardio-minutes-${ex.id}`}
                                className="form-control form-control-sm"
                                placeholder="Minutos"
                                min="0"
                                value={ex.cardioMinutes ?? ''}
                                onChange={handleCardioMinutes}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="form-group mb-0" style={{ minWidth: '110px' }}>
                            <label htmlFor={`cardio-seconds-${ex.id}`} className="sr-only">
                                <FormattedMessage id="project.routines.form.modal.cardioSeconds" defaultMessage="Segundos" />
                            </label>
                            <input
                                type="number"
                                id={`cardio-seconds-${ex.id}`}
                                className="form-control form-control-sm"
                                placeholder="Segundos"
                                min="0"
                                max="59"
                                value={ex.cardioSeconds ?? ''}
                                onChange={handleCardioSeconds}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="text-muted small mt-1">
                        <FormattedMessage id="project.routines.form.modal.cardioHint" defaultMessage="Cardio: indica distancia y tiempo deseados" />
                    </div>
                </div>
            )}
        </button>
    );
};

ExerciseRow.propTypes = {
    ex: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        name: PropTypes.string,
        material: PropTypes.string,
        sets: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        repetitions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        cardioDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        cardioMinutes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        cardioSeconds: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        type: PropTypes.string
    }).isRequired,
    isChecked: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onSetsChange: PropTypes.func.isRequired,
    onRepsChange: PropTypes.func.isRequired,
    onCardioDistanceChange: PropTypes.func.isRequired,
    onCardioMinutesChange: PropTypes.func.isRequired,
    onCardioSecondsChange: PropTypes.func.isRequired
};

// Formulario de Rutina con selector de ejercicios (modal + búsqueda)
const RoutineForm = () => {
    const {routineId} = useParams();
    const isEdit = Boolean(routineId);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(state => state.user);
    const user_type = useSelector(selectors.getUser);

    const [name, setName] = useState('');
    const [level, setLevel] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState('');
    const [category, setCategory] = useState(''); // category id (string vacía o id)
    // Guardamos el nombre de categoría si viene como texto y aún no sabemos su id
    const [pendingCategoryName, setPendingCategoryName] = useState(null);
    const [exercises, setExercises] = useState(''); // IDs coma-separados
    const [openPublic, setOpenPublic] = useState(false);
    const formRef = useRef();
    const intl = useIntl();
    // Nuevo: flag para mostrar errores solo tras intentar enviar
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    // Añadir estado para categorías (solo para fallback visual)
    const [categories, setCategories] = useState([]); // [{id, name}]

    // Estado UI para modal de ejercicios
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [exerciseResults, setExerciseResults] = useState([]); // [{id,name,material,repetitions, sets}]
    const [exercisePage, setExercisePage] = useState(0);
    const [exerciseHasMore, setExerciseHasMore] = useState(false);
    const [loadingExercises, setLoadingExercises] = useState(false);
    const exerciseListRef = useRef(null);
    const [modalSelected, setModalSelected] = useState(new Set()); // Set<number>
    const [selectedExerciseList, setSelectedExerciseList] = useState([]); // [{id,name?}]
    const [levelRating, setLevelRating] = useState(0);
    const [levelHover, setLevelHover] = useState(0);

    // Guard de acceso: solo entrenadores/administradores
    const canManage = useSelector((state) => {
        return isTrainer(state) || isAdmin(state);
    });

    useEffect(() => {
        if (canManage === false) {
            navigate('/routines');
        }
    }, [canManage, navigate]);

    const csvToIdArray = (csv) =>
        csv
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((s) => Number(s))
            .filter((n) => !Number.isNaN(n));

    const idsToCsv = (ids) => Array.from(new Set(ids)).join(',');

    const toNumberOrNull = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return Number.isNaN(num) ? null : num;
    };

    // Helpers para reducir complejidad del efecto de carga
    const getCategoryIdString = (cat) => {
        if (typeof cat === 'number') return String(cat);
        if (typeof cat === 'string' && /^\d+$/.test(cat.trim())) return cat.trim();
        return '';
    };

    const applyCategoryFromItem = (item) => {
        if (!(item.category != null || item.categoryName)) {
            setCategory('');
            return;
        }

        const catIdStr = getCategoryIdString(item.category);
        if (!catIdStr) {
            const nameGuess = item.categoryName || item.category;
            if (nameGuess) setPendingCategoryName(String(nameGuess).trim());
            return;
        }

        setCategory(catIdStr);

        const fallbackName = item.categoryName || (pendingCategoryName ?? undefined);
        setCategories((prev) => {
            const exists = prev.some((c) => String(c.id) === catIdStr);
            return exists ? prev : [...prev, {id: Number(catIdStr), name: fallbackName}];
        });
    };

    const applyExercisesFromItem = (item) => {
        const csv = Array.isArray(item.exercises)
            ? item.exercises.map((e) => e.exerciseId).join(',')
            : '';
        setExercises(csv);
        const list = Array.isArray(item.exercises)
            ? item.exercises.map((e) => {
                const type = (e.type || '').toUpperCase();
                const distanceVal = toNumberOrNull(e.sets ?? e.cardioDistance ?? e.distanceMeters);
                const durationSeconds = toNumberOrNull(e.repetitions ?? e.cardioDuration ?? e.durationSeconds);
                return ({
                    id: e.id,
                    name: e.name,
                    repetitions: e.repetitions,
                    sets: e.sets,
                    material: e.material,
                    type: e.type,
                    ...(type === 'CARDIO'
                        ? {
                            cardioDistance: distanceVal ?? '',
                            cardioMinutes: durationSeconds != null ? Math.floor(durationSeconds / 60) : '',
                            cardioSeconds: durationSeconds != null ? durationSeconds % 60 : '',
                        }
                        : {}),
                });
            })
            : [];
        setSelectedExerciseList(list);
    };

    const applyBasicsFromItem = (item) => {
        setName(item.name || '');
        setLevel(item.level || '');
        setDescription(item.description || '');
        setMaterials(item.materials || '');
        setOpenPublic(item.openPublic ?? true); // true si no viene
        setLevelRating(textToRating(item.level));
    };

    const applyRoutineItem = (item) => {
        applyBasicsFromItem(item);
        applyCategoryFromItem(item);
        applyExercisesFromItem(item);
        dispatch(routines.actions.findByIdCompleted(item));
    };

    // --- Handlers para evitar anidaciones profundas en JSX ---
    const updateExerciseField = (exerciseId, field, value) => {
        setExerciseResults((prev) =>
            prev.map((i) => (i.id === exerciseId ? { ...i, [field]: value } : i))
        );
    };

    const buildCardioDefaults = (data = {}) => {
        const distanceRaw = data.cardioDistance ?? data.sets ?? data.distanceMeters ?? '';
        const minutesRaw = data.cardioMinutes ?? '';
        const secondsRaw = data.cardioSeconds ?? '';
        const distanceValue = toNumberOrNull(distanceRaw);
        const minutesValue = toNumberOrNull(minutesRaw);
        const secondsValue = toNumberOrNull(secondsRaw);
        const hasDurationInput = minutesRaw !== '' || secondsRaw !== '';
        let durationSeconds = hasDurationInput
            ? Math.max(0, (minutesValue || 0) * 60 + (secondsValue || 0))
            : null;

        if (!hasDurationInput && (data.repetitions !== undefined && data.repetitions !== null)) {
            const storedDuration = toNumberOrNull(data.repetitions);
            if (storedDuration !== null) {
                durationSeconds = storedDuration;
            }
        }

        const hasDuration = durationSeconds != null;

        const computedMinutes = hasDuration
            ? Math.floor(durationSeconds / 60)
            : '';

        const computedSeconds = hasDuration
            ? durationSeconds % 60
            : '';

        const cardioMinutes = minutesRaw !== ''
            ? minutesRaw
            : computedMinutes;

        const cardioSeconds = secondsRaw !== ''
            ? secondsRaw
            : computedSeconds;

        return {
            cardioDistance: distanceRaw ?? '',
            cardioMinutes,
            cardioSeconds,
            distanceValue,
            durationSeconds,
        };
    };

    const onSetsChange = (exerciseId, e) => {
        updateExerciseField(exerciseId, 'sets', e.target.value);
    };

    const onRepsChange = (exerciseId, e) => {
        updateExerciseField(exerciseId, 'repetitions', e.target.value);
    };

    const onCardioDistanceChange = (exerciseId, e) => {
        updateExerciseField(exerciseId, 'cardioDistance', e.target.value);
    };

    const onCardioMinutesChange = (exerciseId, e) => {
        updateExerciseField(exerciseId, 'cardioMinutes', e.target.value);
    };

    const onCardioSecondsChange = (exerciseId, e) => {
        updateExerciseField(exerciseId, 'cardioSeconds', e.target.value);
    };

    // Cargar datos iniciales si es edición
    useEffect(() => {
        const load = async () => {
            if (!isEdit) {
                dispatch(routines.actions.clearCurrent());
                return;
            }
            const response = await backend.routineService.findById(routineId);
            if (response.ok) {
                const item = response.payload;
                applyRoutineItem(item);
            }
            handleResponse(response, { showSuccessToast: false });
        };
        load();
    }, [dispatch, isEdit, routineId]);

    // Cargar categorías y llevarlas al store para CategorySelector
    useEffect(() => {
        const loadCategories = async () => {
            const resp = await backend.categoryService.findAll();
            if (resp.ok) {
                const cats = resp.payload || [];
                setCategories(cats);
                dispatch(routines.actions.findAllCategoriesCompleted(cats));
            } else {
                console.error('Error al cargar categorías:', resp.payload);
            }
        };
        loadCategories();
    }, [dispatch]);

    // Cuando tengamos categorías y solo disponíamos del nombre, mapeamos a id
    useEffect(() => {
        if (!category && pendingCategoryName && categories && categories.length > 0) {
            const found = categories.find(c => String(c.name).trim().toLowerCase() === pendingCategoryName.trim().toLowerCase());
            if (found) setCategory(String(found.id));
        }
    }, [categories, category, pendingCategoryName]);

    // Sincronizar chips si el usuario edita manualmente el CSV
    useEffect(() => {
        csvToIdArray(exercises);
    }, [exercises]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        const form = formRef.current;

        // Validaciones custom previas
        const missingLevel = (levelRating || 0) < 1;
        const missingExercises = (selectedExerciseList?.length || 0) < 1;

        if (description && description.length > 255) {
            showError([{
                message: intl.formatMessage({
                    id: 'project.routines.form.description.tooLong',
                    defaultMessage: 'La descripción supera el máximo de 255 caracteres.'
                })
            }]);
            return;
        }

        // Forzar estilos de validación nativos (Nombre, Categoría required)
        if (!form.checkValidity() || missingLevel || missingExercises) {
            form.classList.add('was-validated');
            return;
        }

        const levelToSend = LEVEL_TEXT[levelRating] || (level ? level.trim() : '');
        const exercisesPayload = selectedExerciseList.map((ex) => {
            const base = {
                id: ex.id,
                name: ex.name,
                material: ex.material,
                type: ex.type,
            };
            if ((ex.type || '').toUpperCase() === 'CARDIO') {
                const distance = toNumberOrNull(ex.cardioDistance ?? ex.sets);
                const duration = toNumberOrNull(ex.cardioMinutes) != null || toNumberOrNull(ex.cardioSeconds) != null
                    ? Math.max(0, (toNumberOrNull(ex.cardioMinutes) || 0) * 60 + (toNumberOrNull(ex.cardioSeconds) || 0))
                    : toNumberOrNull(ex.repetitions);
                return {
                    ...base,
                    repetitions: null,
                    sets: null,
                    distanceMeters: distance,
                    durationSeconds: duration,
                };
            }
            return {
                ...base,
                repetitions: toNumberOrNull(ex.repetitions),
                sets: toNumberOrNull(ex.sets),
            };
        });

        const payload = {
            name: name.trim(),
            level: levelToSend,
            description: description.trim(),
            materials: materials.trim(),
            exercises: exercisesPayload,
            category: category ? Number(category) : null,
            openPublic,
        };

        const response = isEdit
            ? await backend.routineService.update(routineId, payload)
            : await backend.routineService.create(payload);

        //solo salta si se permiten duplicados
        if (!response.ok) {
            const errorMsg = response.payload?.[0]?.message || '';
            if (errorMsg.includes('ejercicio repetido') || errorMsg.includes('DuplicateExerciseInRoutineException')) {
                showError([{
                    message: intl.formatMessage({
                        id: 'project.routines.form.error.duplicateExercise',
                        defaultMessage: 'La rutina contiene ejercicios repetidos. Por favor, elimina los duplicados antes de guardar.'
                    })
                }]);
                return;
            }
        }

        handleResponse(response, {
            successMessage: isEdit
                ? intl.formatMessage({
                    id: 'project.routines.form.updateSuccess',
                    defaultMessage: 'Rutina actualizada correctamente'
                })
                : intl.formatMessage({
                    id: 'project.routines.form.createSuccess',
                    defaultMessage: 'Rutina creada correctamente'
                })
        });

        if (response.ok) {
            dispatch(routines.actions.saveCompleted(response.payload));
            navigate('/routines');
        }
    };

    // Modal ejercicios
    const openExerciseModal = async () => {
        setModalSelected(new Set(csvToIdArray(exercises)));
        setExercisePage(0);
        setExerciseHasMore(false);
        await fetchExercises(exerciseSearch, 0, true);
        setShowExerciseModal(true);
    };

    const closeExerciseModal = () => setShowExerciseModal(false);

    const fetchExercises = async (search, page = 0, replace = false) => {
        setLoadingExercises(true);
        const response = await backend.exerciseService.find({ name: search, page });

        if (response.ok) {
            const payload = response.payload || {};
            let rawItems = [];

            if (Array.isArray(payload?.items)) {
                rawItems = payload.items;
            } else if (Array.isArray(payload)) {
                rawItems = payload;
            }

            const selectedMap = new Map(selectedExerciseList.map((e) => [e.id, e]));
            const items = rawItems
                .filter((e) => (String(e.type || 'REPS').toUpperCase() !== 'TIME'))
                .map((e) => {
                    const prev = selectedMap.get(e.id);
                    const resolvedType = String(e.type || prev?.type || 'REPS').toUpperCase();
                    const cardioDefaults = resolvedType === 'CARDIO' ? buildCardioDefaults({ ...prev }) : {};
                    return {
                        id: e.id,
                        name: e.name,
                        material: e.material,
                        repetitions: prev?.repetitions ?? null,
                        sets: prev?.sets ?? null,
                        type: resolvedType,
                        ...(resolvedType === 'CARDIO'
                            ? {
                                cardioDistance: cardioDefaults.cardioDistance,
                                cardioMinutes: cardioDefaults.cardioMinutes,
                                cardioSeconds: cardioDefaults.cardioSeconds,
                            }
                            : {}),
                    };
                });

            setExerciseResults((prev) => {
                const base = replace ? [] : prev;
                const merged = [...base];
                const seen = new Set(base.map((i) => i.id));
                items.forEach((it) => {
                    if (!seen.has(it.id)) {
                        merged.push(it);
                        seen.add(it.id);
                    }
                });
                return merged;
            });

            setExerciseHasMore(Boolean(payload.existMoreItems));
            setExercisePage(page);
        }

        handleResponse(response, { showSuccessToast: false });
        setLoadingExercises(false);
    };

    const toggleModalSelection = (exerciseId) => {
        setModalSelected((prev) => {
            const next = new Set(prev);
            if (next.has(exerciseId)) next.delete(exerciseId);
            else next.add(exerciseId);
            return next;
        });
    };

    const applyModalSelection = () => {
        const ids = Array.from(modalSelected);
        setExercises(idsToCsv(ids));
        const resultMap = new Map(exerciseResults.map((e) => [e.id, e]));
        const newList = ids.map((id) => {
            const found = resultMap.get(id);
            const prev = selectedExerciseList.find((e) => e.id === id);
            const type = String(found?.type || prev?.type || 'REPS').toUpperCase();
            const mergedData = { ...(prev || {}), ...(found || {}) };
            const cardioDefaults = type === 'CARDIO' ? buildCardioDefaults(mergedData) : {};
            const { cardioDistance, cardioMinutes, cardioSeconds, distanceValue, durationSeconds } = cardioDefaults;
            return {
                id,
                name: found?.name || prev?.name,
                repetitions: type === 'CARDIO'
                    ? null
                    : (found?.repetitions ?? prev?.repetitions ?? null),
                sets: type === 'CARDIO'
                    ? null
                    : (found?.sets ?? prev?.sets ?? null),
                material: found?.material || prev?.material,
                type,
                ...(type === 'CARDIO' ? { cardioDistance, cardioMinutes, cardioSeconds } : {}),
                ...(type === 'CARDIO' ? { distanceMeters: distanceValue, durationSeconds } : {}),
            };
        });
        setSelectedExerciseList(newList);
        setShowExerciseModal(false);
    };

    // --- Búsqueda en vivo con debounce para ejercicios en el modal ---
    useEffect(() => {
        if (!showExerciseModal) return; // solo cuando el modal está abierto
        const handle = setTimeout(() => {
            fetchExercises(exerciseSearch, 0, true);
        }, 400); // debounce 400ms
        return () => clearTimeout(handle);
    }, [exerciseSearch, showExerciseModal]);

    const handleExerciseScroll = (e) => {
        if (loadingExercises || !exerciseHasMore) return;
        const target = e.target;
        if (!target) return;
        const threshold = 60;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;
        if (nearBottom) {
            fetchExercises(exerciseSearch, exercisePage + 1, false);
        }
    };

    const handleRemoveSelected = (id) => {
        const ids = csvToIdArray(exercises).filter((x) => x !== id);
        setExercises(idsToCsv(ids));
        setSelectedExerciseList((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <div className="container mt-4 routine-form-narrow">
            {user_type.role === 'TRAINER' && !user_type?.isPremium && !isEdit && (
                <div className="alert alert-info mb-4">
                    <i className="fas fa-chart-bar me-2"></i>
                    <strong>
                        <FormattedMessage
                            id="project.premium.basicAccount.title"
                            defaultMessage="Cuenta Básica"
                        />
                    </strong> -
                    <FormattedMessage
                        id="project.premium.basicAccount.currentLimits"
                        defaultMessage=" Límites actuales:"
                    />
                    <br/>
                    <small>
                        • <FormattedMessage
                        id="project.premium.limits.routines.short"
                        defaultMessage="Rutinas: 3"
                    /> &nbsp;|&nbsp;
                        • <FormattedMessage
                        id="project.premium.limits.exercisesPerRoutine.short"
                        defaultMessage="Ejercicios por rutina: 5"
                    /> &nbsp;|&nbsp;
                        • <FormattedMessage
                        id="project.premium.limits.exerciseCreation.short"
                        defaultMessage="Crear ejercicios: No permitido"
                    />
                    </small>
                    <button
                        className="btn btn-sm btn-primary ms-2"
                        onClick={() => navigate('/users/view-profile')}
                    >
                        <FormattedMessage
                            id="project.premium.upgrade.button"
                            defaultMessage="Mejorar a Premium"
                        />
                    </button>
                </div>
            )}

            {!user?.isPremium && selectedExerciseList.length > 5 && (
                <div className="alert alert-warning mb-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>
                        <FormattedMessage
                            id="project.premium.limitReached.title"
                            defaultMessage="Límite alcanzado"
                        />
                    </strong> -
                    <FormattedMessage
                        id="project.premium.limitReached.exercisesPerRoutine"
                        defaultMessage=" Máximo 5 ejercicios por rutina en cuenta básica."
                    />
                </div>
            )}

            <div className="card routine-form-card routine-form-modern mb-4">
                <h2 className="card-header mb-0">{isEdit ?
                    <FormattedMessage id="project.routines.form.title.edit" defaultMessage="Editar rutina"/> :
                    <FormattedMessage id="project.routines.form.title.new" defaultMessage="Nueva rutina"/>}</h2>
                <div className="card-body pt-4">
                    <form ref={formRef} className="needs-validation" noValidate onSubmit={handleSubmit}>
                        <div className="rf-row">
                            {/* Nombre */}
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label"><FormattedMessage id="project.routines.form.name.label"
                                                                              defaultMessage="Nombre"/></label>
                                <input className="form-control h-eq" placeholder={intl.formatMessage({
                                    id: "project.routines.form.name.placeholder",
                                    defaultMessage: "Nombre de la rutina"
                                })} value={name} onChange={(e) => setName(e.target.value)} required/>
                                <div className="invalid-feedback"><FormattedMessage
                                    id="project.routines.form.name.required" defaultMessage="Requerido"/></div>
                            </div>
                            {/* Dificultad */}
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label"><FormattedMessage id="project.routines.form.level.label"
                                                                              defaultMessage="Dificultad"/></label>
                                <div className="difficulty-box w-100">
                                    <div className="rating-stars d-flex align-items-center mb-0">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                className="btn btn-link p-0"
                                                style={{cursor: 'pointer', border: 'none', background: 'none', padding: '0.25rem'}}
                                                aria-label={`Dificultad ${n}`}
                                                onMouseEnter={() => setLevelHover(n)}
                                                onMouseLeave={() => setLevelHover(0)}
                                                onClick={() => setLevelRating(n)}
                                            >
                                                <i className={`${(levelHover || levelRating) >= n ? 'fas' : 'far'} fa-star`} />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="small text-muted"
                                          style={{minWidth: '95px'}}>{LEVEL_TEXT[levelRating] ||
                                        <FormattedMessage id="project.routines.form.level.unassigned"
                                                          defaultMessage="Sin asignar"/>}</span>
                                </div>
                                {/* input hidden para validación nativa ya no marca rojo hasta submit */}
                                <input
                                    type="number"
                                    value={levelRating}
                                    min={1}
                                    max={5}
                                    required
                                    readOnly
                                    hidden
                                />
                                {attemptedSubmit && (levelRating || 0) < 1 && (
                                    <div className="invalid-feedback d-block">
                                        <FormattedMessage id="project.routines.form.level.required"
                                                          defaultMessage="Selecciona una dificultad"/>
                                    </div>
                                )}
                            </div>
                            {/* Descripción con contador 0/255 */}
                            <div className="rf-col-12 rf-field">
                                <label className="rf-label"><FormattedMessage
                                    id="project.routines.form.description.label" defaultMessage="Descripción"/></label>
                                <div className="position-relative">
                    <textarea
                        rows="3"
                        className="form-control"
                        placeholder={intl.formatMessage({
                            id: "project.routines.form.description.placeholder",
                            defaultMessage: "Descripción breve de la rutina"
                        })}
                        value={description}
                        maxLength={255}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                                    <span className="position-absolute small text-muted" style={{right: 8, bottom: 8}}>
                      {`${description?.length || 0}/255`}
                    </span>
                                </div>
                                <small className="form-text text-muted"><FormattedMessage
                                    id="project.routines.form.description.hint"
                                    defaultMessage="Máximo 255 caracteres."/></small>
                            </div>

                            {/* Categoría (preseleccionada en edición) */}
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label"><FormattedMessage id="project.routines.form.category.label"
                                                                              defaultMessage="Categoría"/></label>
                                <CategorySelector
                                    id="categoryId"
                                    value={category}
                                    required
                                    className={attemptedSubmit && !category ? 'is-invalid' : ''}
                                    onChange={e => setCategory(e.target.value)}
                                />
                                <div className="invalid-feedback"><FormattedMessage
                                    id="project.routines.form.category.required"
                                    defaultMessage="Selecciona una categoría"/></div>
                            </div>
                            {/* Ejercicios */}
                            <div className="rf-col-12 rf-field">
                                <label className="rf-label d-block"><FormattedMessage
                                    id="project.routines.form.exercises.label" defaultMessage="Ejercicios"/></label>
                                <Button type="button" variant="ghost" icon="fa-plus" onClick={openExerciseModal} className="mb-3">
                                    <FormattedMessage id="project.routines.form.exercises.add"
                                                      defaultMessage="Añadir ejercicio"/>
                                </Button>
                                <input
                                    type="number"
                                    value={selectedExerciseList.length}
                                    min={1}
                                    required
                                    readOnly
                                    hidden
                                />
                                {attemptedSubmit && (selectedExerciseList?.length || 0) < 1 && (
                                    <div className="invalid-feedback d-block">
                                        <FormattedMessage id="project.routines.form.exercises.required"
                                                          defaultMessage="Debes seleccionar al menos un ejercicio"/>
                                    </div>
                                )}
                                <div id="selectedExercises" className="rf-chip-area">
                                    {selectedExerciseList.length > 0 ? (
                                        <div className="selected-exercises-panel">
                                            <div className="sep-header">
                                                <h6 className="sep-title mb-0">
                                                    Seleccionados{' '}
                                                    <span className="badge-count">{selectedExerciseList.length}</span>
                                                </h6>
                                            </div>
                                            <div className="selected-exercises-list">
                                                {selectedExerciseList.map((e) => (
                                                    <span key={e.id} className="exercise-chip rounded-pill"
                                                          title={e.name || `Ejercicio #${e.id}`}>
                            {e.name || `Ejercicio #${e.id}`}
                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-10 ml-2"
                                                            onClick={() => handleRemoveSelected(e.id)}
                                                            title="Quitar"
                                                            style={{lineHeight: 1}}
                                                        >
                              <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="selected-exercises-panel">
                                            <div className="sep-header">
                                                <h6 className="sep-title mb-0">Seleccionados <span
                                                    className="badge-count">0</span></h6>
                                            </div>
                                            <div className="text-muted small" style={{padding: '.25rem .25rem .5rem'}}>
                                                Aún no has añadido ejercicios. Usa "Añadir ejercicio" para comenzar.
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <br/>
                                {/* Visibilidad */}
                                <div className="rf-col-12 rf-field">
                                    <label className="rf-label"><FormattedMessage
                                        id="project.routines.form.visibility.label"
                                        defaultMessage="Visibilidad"/></label>
                                    <select
                                        className="custom-select select-placeholder"
                                        value={String(openPublic)} // asegura que siempre sea 'true' o 'false'
                                        onChange={(e) => setOpenPublic(e.target.value === 'true')}
                                    >
                                        <option value="" disabled>Selecciona visibilidad</option>
                                        <option value="true">
                                            <FormattedMessage id="project.routines.form.visibility.public"
                                                              defaultMessage="Pública"/>
                                        </option>
                                        <option value="false">
                                            <FormattedMessage id="project.routines.form.visibility.private"
                                                              defaultMessage="Privada"/>
                                        </option>
                                    </select>
                                    <div className="invalid-feedback">
                                        <FormattedMessage id="project.routines.form.visibility.required"
                                                          defaultMessage="Selecciona una visibilidad"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="rf-actions mt-1">
                            <Button type="submit" variant="primary" icon="fa-save">
                                <FormattedMessage id="project.routines.form.actions.save" defaultMessage="Guardar"/>
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/routines')}>
                                <FormattedMessage id="project.routines.form.actions.cancel" defaultMessage="Cancelar"/>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {showExerciseModal && (
                <dialog id="exerciseModal" className="modal fade show d-block exercise-modal" open
                     style={{backgroundColor: 'rgba(0,0,0,.55)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title mb-0"><FormattedMessage
                                    id="project.routines.form.modal.title" defaultMessage="Añadir ejercicios"/></h5>
                                <button type="button" className="close" aria-label="Close" onClick={closeExerciseModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={intl.formatMessage({
                                            id: "project.routines.form.modal.search.placeholder",
                                            defaultMessage: "Buscar ejercicio..."
                                        })}
                                        value={exerciseSearch}
                                        onChange={(e) => setExerciseSearch(e.target.value)}
                                    />
                                </div>
                                <div
                                    className="border rounded"
                                    style={{maxHeight: '50vh', overflowY: 'auto'}}
                                    onScroll={handleExerciseScroll}
                                    ref={exerciseListRef}
                                >
                                    {exerciseResults.length === 0 ? (
                                        <div className="text-center text-muted p-4"><FormattedMessage
                                            id="project.routines.form.modal.noExercises"
                                            defaultMessage="No hay ejercicios."/></div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {exerciseResults.map((ex) => (
                                                <ExerciseRow
                                                    key={ex.id}
                                                    ex={ex}
                                                    isChecked={modalSelected.has(ex.id)}
                                                    onToggle={toggleModalSelection}
                                                    onSetsChange={onSetsChange}
                                                    onRepsChange={onRepsChange}
                                                    onCardioDistanceChange={onCardioDistanceChange}
                                                    onCardioMinutesChange={onCardioMinutesChange}
                                                    onCardioSecondsChange={onCardioSecondsChange}
                                                />
                                            ))}
                                            {loadingExercises && (
                                                <div className="text-center text-muted py-2 small">
                                                    <FormattedMessage id="project.routines.form.modal.loading" defaultMessage="Cargando m s ejercicios..." />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                            <div className="modal-footer">
                                <Button type="button" variant="outline" onClick={closeExerciseModal}>
                                    <FormattedMessage id="project.routines.form.actions.cancel"
                                                      defaultMessage="Cancelar"/>
                                </Button>
                                <Button type="button" variant="primary" icon="fa-plus" onClick={applyModalSelection}>
                                    <FormattedMessage id="project.routines.form.modal.addSelected"
                                                      defaultMessage="Añadir seleccionados"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default RoutineForm;
