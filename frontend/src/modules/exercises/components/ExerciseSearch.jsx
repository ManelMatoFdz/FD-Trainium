import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Select from 'react-select';
import { Button } from '../../common';

const ExerciseSearch = ({ filters, setFilters, resetFilters, rightActions }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const intl = useIntl();

  // Opciones de grupos musculares localizadas
  const muscleOptions = [
    { value: "ABS", label: intl.formatMessage({ id: "muscle.ABS", defaultMessage: "Abdominales" }) },
    { value: "BACK", label: intl.formatMessage({ id: "muscle.BACK", defaultMessage: "Espalda" }) },
    { value: "BICEPS", label: intl.formatMessage({ id: "muscle.BICEPS", defaultMessage: "Bíceps" }) },
    { value: "CALVES", label: intl.formatMessage({ id: "muscle.CALVES", defaultMessage: "Gemelos" }) },
    { value: "CHEST", label: intl.formatMessage({ id: "muscle.CHEST", defaultMessage: "Pecho" }) },
    { value: "FOREARMS", label: intl.formatMessage({ id: "muscle.FOREARMS", defaultMessage: "Antebrazos" }) },
    { value: "GLUTES", label: intl.formatMessage({ id: "muscle.GLUTES", defaultMessage: "Glúteos" }) },
    { value: "LEGS", label: intl.formatMessage({ id: "muscle.LEGS", defaultMessage: "Piernas" }) },
    { value: "SHOULDERS", label: intl.formatMessage({ id: "muscle.SHOULDERS", defaultMessage: "Hombros" }) },
    { value: "TRICEPS", label: intl.formatMessage({ id: "muscle.TRICEPS", defaultMessage: "Tríceps" }) },
  ];

  // Estilos para que el select multi coincida con el resto de filtros y se vea por encima de la tabla
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 48,
      height: 48, // altura fija del campo
      borderRadius: 14,
      borderColor: state.isFocused ? '#212529' : '#cfd3d8',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(0,0,0,.15)' : 'none',
      '&:hover': { borderColor: state.isFocused ? '#212529' : '#bfc5cb' },
      backgroundColor: '#fff',
      alignItems: 'center'
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 10px',
      display: 'flex',
      flexWrap: 'wrap',
      rowGap: 4,
      columnGap: 6,
      maxHeight: 44, // limita la altura interna
      overflowY: 'auto',
      overflowX: 'hidden',
    }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, minHeight: 48, height: 48 }),
    placeholder: (base) => ({ ...base, color: '#6c757d', fontWeight: 400 }),
    multiValue: (base) => ({ ...base, backgroundColor: '#f1f3f5', borderRadius: 999, margin: '2px 4px 2px 0' }),
    multiValueLabel: (base) => ({ ...base, fontWeight: 600, color: '#1f2328', paddingRight: 6 }),
    multiValueRemove: (base) => ({ ...base, ':hover': { backgroundColor: '#e9ecef', color: '#000' } }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: 12 }),
    option: (base, state) => ({
      ...base,
      fontWeight: 500,
      backgroundColor: state.isFocused ? '#f5f8fc' : '#fff',
      color: '#212529'
    }),
  };

  useEffect(() => {
    // Normalizamos a array para músculos si llega como string/undefined
    let normalizedMuscles = [];
    if (Array.isArray(filters?.muscles)) {
      normalizedMuscles = filters.muscles;
    } else if (filters?.muscles) {
      normalizedMuscles = [filters.muscles];
    }

    setLocalFilters({
      ...filters,
      muscles: normalizedMuscles
    });
  }, [filters]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let newValue;

    if (type === "number") {
      newValue = value ? Number(value) : null;
    } else {
      newValue = value;
    }

    setLocalFilters({
      ...localFilters,
      [name]: newValue,
    });
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    resetFilters();
    setLocalFilters({});
  };

  return (
    <div className="rs-search mb-4">
      {/* Fila superior: trigger + acciones a la derecha */}
      <div className="d-flex align-items-center justify-content-between gap-2">
        <button
          type="button"
          className={`btn-filter-modern rs-filter-trigger ${showFilters ? "active" : ""
            }`}
          onClick={() => setShowFilters((prev) => !prev)}
          aria-expanded={showFilters}
          aria-controls="exerciseFiltersPanel"
        >
          <i className="fas fa-filter me-2" aria-hidden="true"></i>
          {showFilters ? <FormattedMessage id="project.exercises.search.show" defaultMessage="Ocultar filtros" />
            : <FormattedMessage id="project.exercises.search.hide" defaultMessage="Filtrar" />
          }
        </button>
        {rightActions ? (
          <div className="d-flex align-items-center" style={{ gap: ".5rem" }}>
            {rightActions}
          </div>
        ) : null}
      </div>

      {/* Panel colapsable con transición, coherente con Routines */}
      <div
        id="exerciseFiltersPanel"
        className={`rs-filter-panel ${showFilters ? "expanded" : "collapsed"
          }`}
      >
        <div className="routine-search-modern">
          <div className="d-flex flex-wrap routine-filters">
            {/* Igualar ancho/alto y alineación en una fila: wrappers flexibles con minWidth */}
            <div className="flex-fill" style={{ flex: "1 1 300px", minWidth: "240px" }}>
              <input
                type="text"
                name="name"
                placeholder={intl.formatMessage({ id: "project.exercises.search.3", defaultMessage: "Buscar por nombre" })}
                className="form-control w-100"
                value={localFilters.name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="flex-fill" style={{ flex: "1 1 300px", minWidth: "240px" }}>
              <input
                type="text"
                name="material"
                placeholder={intl.formatMessage({ id: "project.exercises.search.2", defaultMessage: "Buscar por material" })}
                className="form-control w-100"
                value={localFilters.material || ""}
                onChange={handleChange}
              />
            </div>

            {/* Grupo muscular (multiselección) */}
            <div
              className="flex-fill"
              style={{
                // Tamaño fijo más ancho, sin ocupar dos filas
                flex: "0 0 360px",
                width: 360,
              }}
            >
              <Select
                inputId="exercise-muscles-select"
                isMulti
                name="muscles"
                classNamePrefix="rs-muscles"
                styles={selectStyles}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                placeholder={intl.formatMessage({
                  id: "project.exercises.search.muscle.all",
                  defaultMessage: "Buscar por grupo muscular",
                })}
                options={muscleOptions}
                value={Array.isArray(localFilters.muscles)
                  ? localFilters.muscles.map((v) => muscleOptions.find((o) => o.value === v) || { value: v, label: v })
                  : []}
                onChange={(selectedOptions) => {
                  const values = Array.isArray(selectedOptions)
                    ? selectedOptions.map((o) => o.value)
                    : [];
                  setLocalFilters({ ...localFilters, muscles: values });
                }}
              />
            </div>

            <div
              className="ms-auto d-flex align-items-center"
              style={{ gap: ".5rem", flex: "0 0 auto" }}
            >
              <Button
                variant="outline"
                onClick={clearFilters}
                type="button"
              >
                <FormattedMessage id="project.exercises.search.4" defaultMessage="Limpiar" />
              </Button>
              <Button
                variant="primary"
                icon="fa-filter"
                onClick={applyFilters}
                type="button"
              >
                <FormattedMessage id="project.exercises.search.1" defaultMessage="Aplicar" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSearch;

ExerciseSearch.propTypes = {
  filters: PropTypes.shape({
    name: PropTypes.string,
    material: PropTypes.string,
    muscles: PropTypes.arrayOf(PropTypes.string),
    sort: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,
  rightActions: PropTypes.node,
};
