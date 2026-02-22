import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import exercises from "..";
import * as exerciseService from "../../../backend/exerciseService";
import { handleResponse, showError, Button } from "../../common";
import { FormattedMessage, useIntl } from 'react-intl';
import Select from "react-select";
import * as selectors from "../../users/selectors";
import { translateMuscle } from '../../common/components/muscleTranslations';

const {actions} = exercises;

const ExerciseForm = () => {
    const formRef = useRef();
    const user_type = useSelector(selectors.getUser);
    const intl = useIntl();
    const {exerciseId} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isEdit = Boolean(exerciseId);

    // Opciones de músculos internacionalizadas
    const muscleOptions = useMemo(() => [
        { value: "CHEST", label: translateMuscle("CHEST", intl) },
        { value: "BACK", label: translateMuscle("BACK", intl) },
        { value: "SHOULDERS", label: translateMuscle("SHOULDERS", intl) },
        { value: "BICEPS", label: translateMuscle("BICEPS", intl) },
        { value: "TRICEPS", label: translateMuscle("TRICEPS", intl) },
        { value: "LEGS", label: translateMuscle("LEGS", intl) },
        { value: "GLUTES", label: translateMuscle("GLUTES", intl) },
        { value: "ABS", label: translateMuscle("ABS", intl) },
        { value: "CALVES", label: translateMuscle("CALVES", intl) },
        { value: "FOREARMS", label: translateMuscle("FOREARMS", intl) },
    ], [intl]);

    const exerciseTypeOptions = useMemo(() => [
        { value: "REPS", label: intl.formatMessage({ id: "project.exercises.form.type.reps", defaultMessage: "Repeticiones / series" }) },
        { value: "TIME", label: intl.formatMessage({ id: "project.exercises.form.type.time", defaultMessage: "Tiempo" }) },
        { value: "CARDIO", label: intl.formatMessage({ id: "project.exercises.form.type.cardio", defaultMessage: "Cardio (distancia/tiempo)" }) },
    ], [intl]);

    const [exercise, setExercise] = useState({
        name: "",
        material: "",
        muscles: [],
        image: "",
        description: "",
        type: "REPS"
    });

    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (exerciseId) {
            exerciseService.findById(exerciseId).then((resp) => {
            if (resp.ok) {
                const payload = resp.payload;

                let muscles = [];

                if (Array.isArray(payload.muscles)) {
                muscles = payload.muscles;
                } else if (payload.muscles) {
                muscles = payload.muscles.split(",");
                }

                setExercise({
                ...payload,
                muscles,
                type: payload.type || "REPS"
                });

                setPreview(payload.image || null);
            }
            });
        }
    }, [exerciseId]);

    const handleChange = (ev) => {
        const {name, value, type} = ev.target;
        setExercise((prev) => ({...prev, [name]: type === 'number' ? Number(value) : value}));
    };

    // Para el input de la imagen
    const handleFileChange = async (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        processImageFile(file);
    };

    const processImageFile = (file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showError(
                intl.formatMessage({
                    id: "project.exercises.form.image.error.invalidType",
                    defaultMessage: "Por favor, selecciona un archivo de imagen válido.",
                })
            );
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showError(
                intl.formatMessage({
                    id: "project.exercises.form.image.error.tooLarge",
                    defaultMessage: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
                })
            );
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Full = reader.result;
            const mimeType = base64Full.match(/data:(.*);base64/)?.[1] || 'image/png';

            setPreview(base64Full); // vista previa

            setExercise((prev) => ({
                ...prev,
                image: base64Full,
                imageMimeType: mimeType, // tipo de imagen
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setIsDragging(false);

        const file = ev.dataTransfer.files[0];
        if (file) {
            processImageFile(file);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setExercise((prev) => ({
            ...prev,
            image: "",
            imageMimeType: "",
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        if (!isFormValid()) {
            return showRequiredFieldsError();
        }
        return isEdit ? handleEdit() : handleCreate();
    };

    const isFormValid = () => {
        const form = formRef.current;
        if (!form) return false;

        const valid = form.checkValidity();
        if (!valid) {
            form.classList.add("was-validated");
        }
        return valid;
    };

    const showRequiredFieldsError = () => {
        showError(
            intl.formatMessage({
                id: "project.common.form.requiredFields",
                defaultMessage: "Por favor, completa todos los campos obligatorios.",
            })
        );
    };

    const buildExercisePayload = () => ({
        name: exercise.name,
        material: exercise.material,
        muscles: exercise.muscles,
        description: exercise.description,
        status: exercise.status,
        type: exercise.type || "REPS",
    });

    const uploadImageIfNeeded = async (id) => {
        if (!exercise.image) return;

        await exerciseService.updateExerciseImage(
            id,
            exercise.image.split(",")[1],
            exercise.imageMimeType || "image/png"
        );
    };

    const handleSuccessNavigation = (timeout) => {
        setTimeout(() => navigate("/exercises"), timeout);
    };

    const handleEdit = async () => {
        const resp = await exerciseService.update(exerciseId, buildExercisePayload());

        handleResponse(resp, {
            successMessage: intl.formatMessage({
                id: "project.exercises.form.success.update",
                defaultMessage: "Ejercicio actualizado.",
            }),
        });

        if (!resp.ok) return;

        dispatch(actions.saveCompleted(resp.payload));
        await uploadImageIfNeeded(exerciseId);
        handleSuccessNavigation(800);
    };

    const isDuplicate = (resp) =>
        !resp.ok &&
        resp.payload?.error?.includes("DuplicateExerciseException");

    const handleCreate = async () => {
        const resp = await exerciseService.create(buildExercisePayload());

        if (isDuplicate(resp)) {
            return showError(
                intl.formatMessage({
                    id: "project.exercises.form.error.duplicate",
                    defaultMessage: "Ya existe un ejercicio con ese nombre.",
                })
            );
        }

        const isPending = resp.ok && resp.payload?.status === "PENDING";

        handleResponse(resp, {
            successMessage: isPending
                ? intl.formatMessage({
                    id: "project.exercises.form.success.pending",
                    defaultMessage: "Ejercicio pendiente de validación.",
                })
                : intl.formatMessage({
                    id: "project.exercises.form.success.create",
                    defaultMessage: "Ejercicio creado.",
                }),
        });

        if (!resp.ok) return;

        await uploadImageIfNeeded(resp.payload.id);
        dispatch(actions.saveCompleted(resp.payload));

        handleSuccessNavigation(1200);
    };

  return (
    <div className="container mt-4 routine-form-narrow">
        {user_type.role === 'TRAINER' && !user_type?.isPremium && !isEdit && (
            <div className="alert alert-warning mb-4">
                <i className="fas fa-crown me-2"></i>
                <strong>
                    <FormattedMessage
                        id="project.premium.basicAccount.title"
                        defaultMessage="Cuenta Básica"
                    />
                </strong> -
                <FormattedMessage
                    id="project.premium.basicAccount.exercise.message"
                    defaultMessage=" No puedes crear ejercicios."
                />
                <button
                    className="btn btn-sm btn-warning ms-2"
                    onClick={() => navigate('/users/view-profile')}
                >
                    <FormattedMessage
                        id="project.premium.become.button"
                        defaultMessage="Hazte Premium"
                    />
                </button>
            </div>
        )}

            <div className="card routine-form-card routine-form-modern mb-4">
                <h2 className="card-header mb-0">{isEdit ?
                    <FormattedMessage id="project.exercises.form.title.edit" defaultMessage="Editar ejercicio"/>
                    : <FormattedMessage id="project.exercises.form.title.new" defaultMessage="Nuevo ejercicio"/>}</h2>
                <div className="card-body pt-4">
                    <form ref={formRef} className="needs-validation" noValidate onSubmit={handleSubmit}>
                        <div className="rf-row">
                            {/* Nombre */}
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label"><FormattedMessage id="project.exercises.form.name.label"
                                                                              defaultMessage="Nombre"/></label>
                                <input
                                    type="text"
                                    className="form-control h-eq"
                                    placeholder={intl.formatMessage({
                                        id: "project.exercises.form.name.placeholder",
                                        defaultMessage: "Nombre del ejercicio"
                                    })}
                                    name="name"
                                    value={exercise.name}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback"><FormattedMessage
                                    id="project.exercises.form.name.required" defaultMessage="Requerido"/></div>
                            </div>

                            {/* Material */}
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label"><FormattedMessage id="project.exercises.form.material.label"
                                                                              defaultMessage="Material"/></label>
                                <input
                                    type="text"
                                    className="form-control h-eq"
                                    placeholder={intl.formatMessage({
                                        id: "project.exercises.form.material.placeholder",
                                        defaultMessage: "Material necesario (opcional)"
                                    })}
                                    name="material"
                                    value={exercise.material}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <br/>

                        {/* Grupos musculares + tipo */}
                        <div className="rf-row">
                            <div className="rf-col-6 rf-field">
                                <label className="rf-label">
                                    <FormattedMessage
                                        id="project.exercises.form.muscles.label"
                                        defaultMessage="Grupos musculares"
                                    />
                                </label>
                                <Select
                                    isMulti
                                    name="muscles"
                                    options={muscleOptions}
                                    value={muscleOptions.filter((o) =>
                                        (exercise.muscles || []).includes(o.value)
                                    )}
                                    onChange={(selected) => {
                                        const valueAsArray = selected.map((s) => s.value);
                                        setExercise({ ...exercise, muscles: valueAsArray });
                                    }}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    />
                            </div>

                            <div className="rf-col-6 rf-field">
                                <label className="rf-label">
                                    <FormattedMessage
                                        id="project.exercises.form.type.label"
                                        defaultMessage="Tipo de ejercicio"
                                    />
                                </label>
                                <Select
                                    name="type"
                                    options={exerciseTypeOptions}
                                    value={exerciseTypeOptions.find((o) => o.value === (exercise.type || "REPS"))}
                                    onChange={(opt) => setExercise({ ...exercise, type: opt?.value || "REPS" })}
                                    classNamePrefix="select"
                                    className="basic-single-select"
                                />
                                {/* hidden input to keep native validation */}
                                <input type="text" value={exercise.type || "REPS"} required readOnly hidden />
                                <div className="invalid-feedback">
                                    <FormattedMessage id="project.common.form.requiredFields" defaultMessage="Por favor, completa todos los campos obligatorios." />
                                </div>
                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="rf-col-12 rf-field" style={{ marginTop: "12px" }}>
                            <label className="rf-label mb-2">
                                <FormattedMessage id="project.exercises.form.image.label" defaultMessage="Imagen" />
                                <span className="text-muted ms-2" style={{ fontSize: "0.875rem", fontWeight: "normal" }}>
                                    (<FormattedMessage id="project.exercises.form.image.optional" defaultMessage="Opcional" />)
                                </span>
                            </label>

                            {!preview ? (
                                <button
                                    type="button"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleImageClick}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(); }}
                                    style={{
                                        border: `2px dashed ${isDragging ? '#007bff' : '#dee2e6'}`,
                                        borderRadius: "12px",
                                        padding: "2.5rem 1.5rem",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        backgroundColor: isDragging ? '#f8f9fa' : '#ffffff',
                                        transition: "all 0.3s ease",
                                        minHeight: "180px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDragging) {
                                            e.currentTarget.style.borderColor = '#007bff';
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDragging) {
                                            e.currentTarget.style.borderColor = '#dee2e6';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }
                                    }}
                                >
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: "3rem", color: "#6c757d", marginBottom: "1rem" }}></i>
                                    <p style={{ margin: "0.5rem 0", color: "#495057", fontWeight: "500" }}>
                                        <FormattedMessage 
                                            id="project.exercises.form.image.dragDrop" 
                                            defaultMessage="Arrastra una imagen aquí o haz clic para seleccionar" 
                                        />
                                    </p>
                                    <p style={{ margin: "0", fontSize: "0.875rem", color: "#6c757d" }}>
                                        <FormattedMessage 
                                            id="project.exercises.form.image.formats" 
                                            defaultMessage="PNG, JPG, GIF hasta 5MB" 
                                        />
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </button>
                            ) : (
                                <div className="position-relative" style={{ maxWidth: "400px", margin: "0 auto" }}>
                                    <div className="text-center position-relative" style={{ marginBottom: "1rem" }}>
                                        <img
                                            src={preview}
                                            alt={intl.formatMessage({ 
                                                id: 'project.exercises.form.image.preview', 
                                                defaultMessage: 'Vista previa del ejercicio' 
                                            })}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: "12px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                                objectFit: "contain",
                                                display: "block",
                                                margin: "0 auto",
                                            }}
                                        />
                                    </div>
                                    <div className="mt-3 d-flex justify-content-center" style={{ gap: "1rem" }}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            icon="fa-image"
                                            onClick={handleImageClick}
                                        >
                                            <FormattedMessage 
                                                id="project.exercises.form.image.change" 
                                                defaultMessage="Cambiar imagen" 
                                            />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            icon="fa-trash"
                                            onClick={handleRemoveImage}
                                        >
                                            <FormattedMessage 
                                                id="project.exercises.form.image.remove" 
                                                defaultMessage="Eliminar" 
                                            />
                                        </Button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            )}
                        </div>

                        <br />

                        {/* Descripción */}
                        <div className="rf-col-12 rf-field">
                            <label className="rf-label">
                                <FormattedMessage
                                    id="project.exercises.form.description.label"
                                    defaultMessage="Descripción"
                                />
                            </label>
                            <textarea
                                className="form-control"
                                placeholder={intl.formatMessage({
                                    id: "project.exercises.form.description.placeholder",
                                    defaultMessage: "Describe el ejercicio",
                                })}
                                name="description"
                                value={exercise.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <br/>
                        <br/>

                        {/* Acciones */}
                        <div className="rf-actions mt-1">
                            <Button type="submit" variant="primary" icon="fa-save">
                                {isEdit ? <FormattedMessage id="project.exercises.form.actions.save"
                                                            defaultMessage="Guardar"/>
                                    : <FormattedMessage id="project.exercises.form.actions.create"
                                                        defaultMessage="Crear"/>}
                            </Button>
                            <Button type="button" variant="outline"
                                    onClick={() => navigate('/exercises')}>
                                <FormattedMessage id="project.exercises.form.actions.cancel" defaultMessage="Cancelar"/>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExerciseForm;
