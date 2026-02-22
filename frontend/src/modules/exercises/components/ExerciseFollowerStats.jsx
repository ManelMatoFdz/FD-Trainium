import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import backend from "../../../backend";
import { LoadingSpinner } from "../../common";
import './ExerciseFollowerStats.css';

// Helper: Extract items from response payload
const extractItems = (payload) => {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
};

// Helper: Get medal class based on index
const getMedalType = (idx) => {
  if (idx === 0) return "gold";
  if (idx === 1) return "silver";
  if (idx === 2) return "bronze";
  return "neutral";
};

const getMedalIcon = (idx) => {
  if (idx === 0) return "trophy";
  if (idx === 1) return "medal";
  if (idx === 2) return "award";
  return null;
};

const getMedalClass = (idx) => {
  return `medal-${getMedalType(idx)}`;
};

const getSelectedItemDesc = ({ selectedType, selectedId, exercises, routines }) => {
  const idStr = selectedId != null ? String(selectedId) : null;
  if (!idStr) return null;

  if (selectedType === 'exercise') {
    const ex = exercises.find(e => String(e.id) === idStr);
    if (!ex) return null;
    return ex.description || (Array.isArray(ex.muscles) ? ex.muscles.join(', ') : null);
  }

  if (selectedType === 'routine') {
    return routines.find(r => String(r.id) === idStr)?.description || null;
  }

  return null;
};

/* eslint-disable */
// Justificación: función grande por la cantidad de UI y estados; dividirla sería más complejo que mantenerla así.
const ExerciseFollowerStats = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState("select-exercise"); // select-exercise, select-routine, ranking
  const [selectedType, setSelectedType] = useState(null); // 'exercise' or 'routine'
  const [selectedId, setSelectedId] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [filter, setFilter] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Load Exercises
  useEffect(() => {
    if (activeTab !== "select-exercise") return;

    const loadExercises = async () => {
      setLoadingList(true);
      const resp = await backend.exerciseService.findPerformed();
      const payload = resp.ok ? resp.payload : null;
      let items = extractItems(payload);

      if (!resp.ok || items.length === 0) {
        const fallback = await backend.exerciseService.findAll();
        if (fallback.ok) {
          items = extractItems(fallback.payload);
        }
      }
      setExercises(items);
      setLoadingList(false);
    };
    loadExercises();
  }, [activeTab]);

  // Load Routines
  useEffect(() => {
    if (activeTab !== "select-routine") return;

    const loadRoutines = async () => {
      setLoadingList(true);
      const resp = await backend.routineService.findPerformed();
      const payload = resp.ok ? resp.payload : null;
      let items = extractItems(payload);

      if (!resp.ok || items.length === 0) {
        const fallback = await backend.routineService.findAll();
        if (fallback.ok) {
          items = extractItems(fallback.payload);
        }
      }
      setRoutines(items);
      setLoadingList(false);
    };
    loadRoutines();
  }, [activeTab]);

  // Filter logic
  const filteredExercises = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter((ex) => (ex.name || "").toLowerCase().includes(term));
  }, [exercises, filter]);

  const filteredRoutines = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return routines;
    return routines.filter((r) => (r.name || "").toLowerCase().includes(term));
  }, [routines, filter]);

  // Selection Handlers
  const handleSelectExercise = async (id) => {
    setSelectedType("exercise");
    setSelectedId(id);
    setActiveTab("ranking");
    setLoadingRanking(true);
    console.debug('[ExerciseFollowerStats] handleSelectExercise ->', { id });
    const resp = await backend.exerciseService.getFollowersStats(id);
    setRanking(resp.ok && Array.isArray(resp.payload) ? resp.payload : []);
    setLoadingRanking(false);
  };

  const handleSelectRoutine = async (id) => {
    setSelectedType("routine");
    setSelectedId(id);
    setActiveTab("ranking");
    setLoadingRanking(true);
    console.debug('[ExerciseFollowerStats] handleSelectRoutine ->', { id });
    const resp = await backend.routineService.getFollowersStats(id);
    setRanking(resp.ok && Array.isArray(resp.payload) ? resp.payload : []);
    setLoadingRanking(false);
  };

  // Helpers
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const selectedItemName = useMemo(() => {
    const idStr = selectedId != null ? String(selectedId) : null;
    if (!idStr) return null;
    if (selectedType === "exercise") {
      return exercises.find(e => String(e.id) === idStr)?.name;
    } else if (selectedType === "routine") {
      return routines.find(r => String(r.id) === idStr)?.name;
    }
    return null;
  }, [selectedType, selectedId, exercises, routines]);

  const selectedItemDesc = useMemo(() =>
    getSelectedItemDesc({
      selectedType,
      selectedId,
      exercises,
      routines
    }),
        [selectedType, selectedId, exercises, routines]
  );

  const getValueNumber = (item, type) => {
    if (type === 'routine') {
      return item.totalVolume ? item.totalVolume.toFixed(1) : "-";
    }
    return item.weightUsed ?? "-";
  };


  // Debug render state (keeps minimal output)
  useEffect(() => {
    console.debug('[ExerciseFollowerStats] render state ->', { selectedType, selectedId, selectedItemName, selectedItemDesc });
  }, [selectedType, selectedId, selectedItemName, selectedItemDesc]);

  return (
    <div className="container exercise-stats-page">
      <div className="executions-history-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h3 className="page-title mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="me-2"
              style={{
                width: '28px',
                height: '28px',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
              />
            </svg>
            <FormattedMessage id="project.exercises.stats.pageTitle" defaultMessage="Ranking" />
          </h3>
          <p className="text-muted mt-2 mb-0">
            <FormattedMessage
              id="project.exercises.stats.pageSubtitle"
              defaultMessage="Compara tu progreso con las personas a las que sigues en ejercicios y rutinas."
            />
          </p>
        </div>
        <div className="stats-participants-badge mt-3">
          <div className="badge-label">
            <FormattedMessage id="project.exercises.stats.participants" defaultMessage="Participantes" />
          </div>
          <div className="badge-value">{ranking.length}</div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 tab-card">
        <div className="card-header d-flex align-items-center justify-content-between tab-header">
          <div className="nav nav-pills stats-tabs" role="tablist">

            <button
              role="tab"
              aria-selected={activeTab === "select-exercise"}
              className={`nav-link ${activeTab === "select-exercise" ? "active" : ""}`}
              onClick={() => { setActiveTab("select-exercise"); setFilter(""); }}
            >
              <i className="fa fa-dumbbell me-2"></i>
              <FormattedMessage id="project.exercises.stats.select" defaultMessage="Selecciona un ejercicio" />
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "select-routine"}
              className={`nav-link ${activeTab === "select-routine" ? "active" : ""}`}
              onClick={() => { setActiveTab("select-routine"); setFilter(""); }}
            >
              <i className="fa fa-list-alt me-2"></i>
              <FormattedMessage id="project.routines.stats.select" defaultMessage="Selecciona una rutina" />
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "ranking"}
              className={`nav-link ${activeTab === "ranking" ? "active" : ""}`}
              onClick={() => setActiveTab("ranking")}
              disabled={!selectedId}
            >
              <i className="fa fa-chart-line me-2"></i>
              <FormattedMessage id="project.exercises.stats.ranking" defaultMessage="Ranking" />
            </button>

          </div>
          {(loadingList || loadingRanking) && <LoadingSpinner overlay={false} size="sm" message="" />}
        </div>

        <div className="card-body tab-body">
          
          {/* SELECT EXERCISE TAB */}
          {activeTab === "select-exercise" && (
            <div className="tab-pane fade show active">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={intl.formatMessage({ id: "project.exercises.stats.search.placeholder", defaultMessage: "Buscar ejercicio" })}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="exercise-picker">
                {filteredExercises.length === 0 && !loadingList && (
                  <div className="text-muted small p-3">
                    <FormattedMessage id="project.exercises.stats.noResults" defaultMessage="Sin resultados" />
                  </div>
                )}
                <ul className="list-group list-group-flush">
                  {filteredExercises.map((ex) => (
                    <li key={ex.id} className={`list-group-item d-flex align-items-center justify-content-between ${selectedId === ex.id && selectedType === 'exercise' ? "active" : ""}`}>
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">{ex.name}</span>
                        <small className="text-muted">{Array.isArray(ex.muscles) ? ex.muscles.join(", ") : ""}</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill btn-view-ranking"
                        aria-label="Ver ranking"
                        onClick={() => handleSelectExercise(ex.id)}
                      >
                        <i className="fa fa-chart-line"></i>
                        <span className="btn-label ms-1">
                          <FormattedMessage id="project.exercises.stats.view" defaultMessage="Ver" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SELECT ROUTINE TAB */}
          {activeTab === "select-routine" && (
            <div className="tab-pane fade show active">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={intl.formatMessage({ id: "project.routines.stats.search.placeholder", defaultMessage: "Buscar rutina" })}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="exercise-picker">
                {filteredRoutines.length === 0 && !loadingList && (
                  <div className="text-muted small p-3">
                    <FormattedMessage id="project.routines.stats.noResults" defaultMessage="Sin resultados" />
                  </div>
                )}
                <ul className="list-group list-group-flush">
                  {filteredRoutines.map((r) => (
                    <li key={r.id} className={`list-group-item d-flex align-items-center justify-content-between ${selectedId === r.id && selectedType === 'routine' ? "active" : ""}`}>
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">{r.name}</span>
                        <small className="text-muted">{r.description}</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill btn-view-ranking"
                        aria-label="Ver ranking"
                        onClick={() => handleSelectRoutine(r.id)}
                      >
                        <i className="fa fa-chart-line"></i>
                        <span className="btn-label ms-1">
                          <FormattedMessage id="project.routines.stats.view" defaultMessage="Ver" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* RANKING TAB */}
          {activeTab === "ranking" && (
            <div className="tab-pane fade show active">
              {!selectedId && (
                <p className="text-muted">
                  <FormattedMessage id="project.exercises.stats.hint" defaultMessage="Selecciona un ítem para ver el ranking." />
                </p>
              )}

              {selectedItemName && (
                <div className="selected-exercise-pill mb-3 d-inline-flex align-items-center gap-2">
                  <i className={selectedType === 'routine' ? "fa fa-list-alt" : "fa fa-dumbbell"}></i>
                  <span className="exercise-name" data-testid="selected-exercise-name">
                    {selectedItemName}
                  </span>
                </div>
              )}

              {!loadingRanking && ranking.length === 0 && selectedId && (
                <div className="ranking-empty-state" data-testid="ranking-empty">
                  <div className="empty-icon">
                    <i className="fa fa-trophy"></i>
                  </div>
                  <p className="text-muted mb-0">
                    <FormattedMessage
                      id="project.exercises.stats.empty"
                      defaultMessage="Nadie de tus seguidos ha registrado datos."
                    />
                  </p>
                </div>
              )}

              {ranking.length > 0 && (
                <ol className="ranking-list list-unstyled m-0">
                  {ranking.map((item, idx) => {
                    const medalType = getMedalType(idx);
                    const medalIcon = getMedalIcon(idx);
                    const valueNumber = getValueNumber(item, selectedType);
                    return (
                      <li 
                        key={item.userId} 
                        className={`ranking-card ranking-card-${medalType}`}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="ranking-line d-flex align-items-center">
                            <div className="medal-wrapper">
                              <div className={`medal medal-${medalType}`}>
                                {medalIcon
                                  ? <i className={`fa fa-${medalIcon}`}></i>
                                  : <span className="medal-number">{idx + 1}</span>}
                              </div>
                            </div>
                            <div className="ranking-meta d-flex flex-column">
                              <div className="ranking-user-name">
                                {item.userName}
                              </div>
                              <div className="date-row">
                                <i className="fa fa-calendar-alt"></i>
                                <span className="date-text">{formatDate(item.lastPerformedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ranking-value-wrapper">
                            <div className="ranking-value">
                              <span className="value-number">
                                {valueNumber}
                              </span>
                              <span className="value-unit">kg</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ExerciseFollowerStats;
