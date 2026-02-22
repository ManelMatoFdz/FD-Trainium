import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import * as exerciseService from "../../../backend/exerciseService";
import { handleResponse, Button, LoadingSpinner } from "../../common";
import users from "../../users";
import { FormattedMessage, useIntl } from 'react-intl';
import { translateMuscle } from '../../common/components/muscleTranslations';

const ExerciseDetails = () => {
    const intl = useIntl();
    const { exerciseId } = useParams();
    const [exercise, setExercise] = useState(null);
    const navigate = useNavigate();

    const canManage = useSelector(users.selectors.isAdmin);

    const formatType = (type) => {
        const normalized = (type || "REPS").toUpperCase();
        if (normalized === "CARDIO") {
            return intl.formatMessage({ id: "project.exercises.form.type.cardio", defaultMessage: "Cardio (distancia/tiempo)" });
        }
        if (normalized === "TIME") {
            return intl.formatMessage({ id: "project.exercises.form.type.time", defaultMessage: "Tiempo" });
        }
        return intl.formatMessage({ id: "project.exercises.form.type.reps", defaultMessage: "Repeticiones / series" });
    };

    useEffect(() => {
        const load = async () => {
            const resp = await exerciseService.findById(exerciseId);
            handleResponse(resp, { showSuccessToast: false });
            if (resp.ok) {
                setExercise(resp.payload);
            }
        };
        load();
    }, [exerciseId]);

    return (
        <div className="container mt-4">
            {exercise ? (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="mb-0">{exercise.name || <FormattedMessage id="project.exercises.details.title"
                                                                                 defaultMessage="Detalles del ejercicio"/>}</h3>
                        <div className="d-flex align-items-center" style={{gap: '.5rem'}}>
                            <Button variant="secondary" icon="fa-arrow-left" onClick={() => navigate('/exercises')}>
                                <FormattedMessage id="project.exercises.details.back" defaultMessage="Volver"/>
                            </Button>
                            {canManage && (
                                <Button
                                    variant="ghost"
                                    icon="fa-edit"
                                    onClick={() => navigate(`/exercises/${exercise.id}/edit`)}
                                >
                                    <FormattedMessage id="project.exercises.details.edit" defaultMessage="Editar"/>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="card routine-detail-card mb-4">
                        <div className="card-header"><FormattedMessage id="project.exercises.details.infoTitle"
                                                                       defaultMessage="Información del ejercicio"/>
                        </div>
                        <div className="card-body">
                            {exercise.image && (
                                <div className="mb-3 text-center">
                                    <img
                                        src={exercise.image}
                                        alt={exercise.name}
                                        style={{
                                            maxWidth: "280px",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                </div>
                            )}
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold"><FormattedMessage
                                    id="project.exercises.details.id" defaultMessage="ID"/></div>
                                <div className="col-md-9">{exercise.id ?? '-'}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold"><FormattedMessage
                                    id="project.exercises.details.name" defaultMessage="Nombre"/></div>
                                <div className="col-md-9">{exercise.name ?? '-'}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold"><FormattedMessage
                                    id="project.exercises.details.material" defaultMessage="Material"/></div>
                                <div className="col-md-9">{exercise.material || '—'}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold"><FormattedMessage
                                    id="project.exercises.details.muscles" defaultMessage="Grupos Musculares"/></div>
                                <div className="col-md-9">
                                    {Array.isArray(exercise.muscles) && exercise.muscles.length > 0 ? (
                                        <div className="muscle-tags-wrapper">
                                            {exercise.muscles.map((m) => (
                                                <span key={m} className="muscle-tag">{translateMuscle(m, intl)}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold">
                                    <FormattedMessage id="project.exercises.details.type" defaultMessage="Tipo"/>
                                </div>
                                <div className="col-md-9">{formatType(exercise.type)}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 fw-semibold">
                                    <FormattedMessage id="project.exercises.details.description"
                                                      defaultMessage="Descripción"/>
                                </div>
                                <div className="col-md-9">{exercise.description || '—'}</div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        .muscle-tags-wrapper {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 6px;
                        }
                        .muscle-tag {
                            background-color: #e9f2ff;
                            color: #004a99;
                            border-radius: 12px;
                            padding: 2px 8px;
                            font-size: 0.75rem;
                            font-weight: 600;
                            border: 1px solid #cfe0ff;
                            white-space: nowrap;
                        }
                    `}</style>
                </>
            ) : (
                <div className="text-center py-4">
                    <LoadingSpinner overlay={false} size="md" message="" />
                </div>
            )}
        </div>
    );
};

export default ExerciseDetails;
