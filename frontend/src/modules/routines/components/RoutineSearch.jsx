import { useMemo, useState, useEffect } from "react";
import Select from 'react-select';
import CategorySelector from './CategorySelector';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button } from '../../common';
import PropTypes from "prop-types";

const matchesName = (routineName, filterName) => {
    if (!filterName) return true;
    const searchWords = filterName.toLowerCase().trim().split(/\s+/);
    const nameWords = routineName.split(/\s+/);
    return searchWords.every((searchWord) =>
        nameWords.some((word) => word.startsWith(searchWord))
    );
};

// Hook legacy para compatibilidad con MyRoutineList (filtrado local)
export const useRoutineFilter = (list) => {
    const [filters, setFilters] = useState({ name: "", level: "", category: "" });

    const filteredList = useMemo(() => {
        return list.filter((r) => {
      const routineName = r.name?.toLowerCase() || "";
      // Normalize level values to stable keys (strip accents and map Spanish display values to english keys)
      const normalize = (s) => s ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
      const levelMap = { 'facil': 'easy', 'basico': 'basic', 'intermedio': 'intermediate', 'avanzado': 'advanced', 'experto': 'expert' };
      const toKey = (s) => {
        const n = normalize(s);
        return levelMap[n] || n;
      };

      const routineLevelKey = toKey(r.level);
      const filterLevelKey = toKey(filters.level);
      const routineCategory = r.category?.toString() || "";

      const nameMatch = matchesName(routineName, filters.name);

      const levelMatch = !filters.level || routineLevelKey === filterLevelKey;
      const categoryMatch = !filters.category || routineCategory === filters.category;

      return nameMatch && levelMatch && categoryMatch;
        });
    }, [list, filters]);

    const resetFilters = () => setFilters({ name: "", level: "", category: "" });

    return { filters, setFilters, filteredList, resetFilters };
};

const RoutineSearch = ({ filters, setFilters, resetFilters, rightActions, onSearch, useBackendSearch = false }) => {
  const [showFilters, setShowFilters] = useState(false);
  const intl = useIntl();

  // Opciones localizadas de grupos musculares
  const muscleOptions = [
    { value: "ABS", label: intl.formatMessage({id: "muscle.ABS", defaultMessage: "Abdominales"}) },
    { value: "BACK", label: intl.formatMessage({id: "muscle.BACK", defaultMessage: "Espalda"}) },
    { value: "BICEPS", label: intl.formatMessage({id: "muscle.BICEPS", defaultMessage: "Bíceps"}) },
    { value: "CALVES", label: intl.formatMessage({id: "muscle.CALVES", defaultMessage: "Gemelos"}) },
    { value: "CHEST", label: intl.formatMessage({id: "muscle.CHEST", defaultMessage: "Pecho"}) },
    { value: "FOREARMS", label: intl.formatMessage({id: "muscle.FOREARMS", defaultMessage: "Antebrazos"}) },
    { value: "GLUTES", label: intl.formatMessage({id: "muscle.GLUTES", defaultMessage: "Glúteos"}) },
    { value: "LEGS", label: intl.formatMessage({id: "muscle.LEGS", defaultMessage: "Piernas"}) },
    { value: "SHOULDERS", label: intl.formatMessage({id: "muscle.SHOULDERS", defaultMessage: "Hombros"}) },
    { value: "TRICEPS", label: intl.formatMessage({id: "muscle.TRICEPS", defaultMessage: "Tríceps"}) },
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 48,
      height: 48,
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
      maxHeight: 44,
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

  // Si se usa búsqueda backend, ejecutar onSearch cuando cambien los filtros
  useEffect(() => {
    if (useBackendSearch && onSearch) {
      const delayDebounceFn = setTimeout(() => {
        onSearch(filters);
      }, 300); // Debounce de 300ms para evitar muchas llamadas

      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters, onSearch, useBackendSearch]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="rs-search mb-4">
      {/* Fila superior: trigger + acciones a la derecha */}
      <div className="d-flex align-items-center justify-content-between gap-2">
        <Button
          variant="filter"
          icon="fa-filter"
          className={showFilters ? 'active' : ''}
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="routineFiltersPanel"
        >
          {showFilters ? <FormattedMessage id="project.routines.search.toggle.hide" defaultMessage="Ocultar filtros" /> : <FormattedMessage id="project.routines.search.toggle.show" defaultMessage="Filtrar" />}
        </Button>
        {rightActions ? (
          <div className="d-flex align-items-center" style={{ gap: '.5rem' }}>
            {rightActions}
          </div>
        ) : null}
      </div>

      {/* Panel animado de filtros */}
      <div
        id="routineFiltersPanel"
        className={`rs-filter-panel ${showFilters ? 'expanded' : 'collapsed'}`}
      >
        <div className="routine-search-modern">
          <div className="d-flex flex-wrap align-items-center routine-filters">
            {/* Nombre */}
            <div className="flex-fill" style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <input
                type="text"
                name="name"
                placeholder={intl.formatMessage({
                    id: "project.routines.search.name.placeholder",
                    defaultMessage: "Buscar por nombre",
                })}
                className="form-control w-100"
                value={filters.name}
                onChange={handleChange}
              />
            </div>
            {/* Nivel */}
            <div className="flex-fill" style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <select
                name="level"
                className="custom-select"
                value={filters.level}
                onChange={handleChange}
              >
                  <option value=""><FormattedMessage id="project.routines.search.level.label" defaultMessage="Todos los Niveles"/></option>
                  <option value="Fácil"><FormattedMessage id="project.routines.search.level.options.easy" defaultMessage="Fácil"/></option>
                  <option value="Básico"><FormattedMessage id="project.routines.search.level.options.basic" defaultMessage="Básico"/></option>
                  <option value="Intermedio"><FormattedMessage id="project.routines.search.level.options.intermediate" defaultMessage="Intermedio"/></option>
                  <option value="Avanzado"><FormattedMessage id="project.routines.search.level.options.advanced" defaultMessage="Avanzado"/></option>
                  <option value="Experto"><FormattedMessage id="project.routines.search.level.options.expert" defaultMessage="Experto"/></option>
              </select>
            </div>
            {/* Categoría */}
            <CategorySelector id="categoryId" className="custom-select my-1 mr-sm-2"
              value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}/>
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
                value={Array.isArray(filters.muscles)
                  ? filters.muscles.map((v) => muscleOptions.find((o) => o.value === v) || { value: v, label: v })
                  : []}
                onChange={(selectedOptions) => {
                  const values = Array.isArray(selectedOptions)
                    ? selectedOptions.map((o) => o.value)
                    : [];
                  setFilters({ ...filters, muscles: values });
                }}
              />
            </div>
            {/* Acciones */}
            <div className="ms-auto d-flex align-items-center" style={{ gap: '.5rem', flex: '0 0 auto' }}>
              <Button variant="outline" onClick={resetFilters}>
                <FormattedMessage id="project.routines.search.clear" defaultMessage="Limpiar" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RoutineSearch.propTypes = {
    filters: PropTypes.shape({
        name: PropTypes.string,
        level: PropTypes.string,
        category: PropTypes.string,
        muscles: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    setFilters: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    rightActions: PropTypes.node,
    onSearch: PropTypes.func,
    useBackendSearch: PropTypes.bool,
};

export default RoutineSearch;
