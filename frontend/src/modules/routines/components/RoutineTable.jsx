import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ButtonGroup, Table, LoadingSpinner, useNavigationWithLoading } from '../../common';
import users from '../../users';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';

const RoutineTable = ({ list, onDelete, showVisibility = false, isLoading: tableIsLoading = false, loadingMessage: tableLoadingMessage = 'Cargando...' }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const currentUser = useSelector(users.selectors.getUser);
  const isAdmin = useSelector(users.selectors.isAdmin);

  const columns = [
    {
      key: 'name',
      header: <FormattedMessage id="project.routines.table.2" defaultMessage="Nombre"/>,
      render: (row) => (
        row.id ? (
          <Link to={`/routines/${row.id}`}>
            {row.name}
          </Link>
        ) : (
          <span>{row.name}</span>
        )
      ),
    },
    {
      key: 'level',
      header: <FormattedMessage id="project.routines.table.3" defaultMessage="Nivel"/>,
      width: '120px',
      render: (row) => (
        <span className="trainium-table__badge">{row.level}</span>
      ),
    },
    {
      key: 'category',
      header: <FormattedMessage id="project.routines.table.5" defaultMessage="Categoría"/>,
      width: '160px',
      render: (row) => {
        const categoryDisplay = row.categoryName || row.category || 'Sin categoría';
        return <span className="trainium-table__badge trainium-table__badge--ghost">{categoryDisplay}</span>;
      },
    },
    {
      key: 'user',
      header: <FormattedMessage id="project.routines.table.creator" defaultMessage="Creador"/>,
      width: '180px',
      render: (row) => {
        const userDisplay = row.userName || row.user || 'Desconocido';
        return <span className="trainium-table__cell--secondary">{userDisplay}</span>;
      },
    },
    ...(showVisibility ? [{
      key: 'visibility',
      header: <FormattedMessage id="project.routines.table.visibility" defaultMessage="Visibilidad"/>,
      width: '140px',
      render: (row) => (
        <span className={`trainium-table__badge ${row.openPublic ? 'trainium-table__badge--success' : 'trainium-table__badge--ghost'}`}>
          {row.openPublic ? (
            <FormattedMessage id="project.routines.form.visibility.public" defaultMessage="Pública" />
          ) : (
            <FormattedMessage id="project.routines.form.visibility.private" defaultMessage="Privada" />
          )}
        </span>
      ),
    }] : []),
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'right',
      render: (row) => {
        const isOwner = currentUser && currentUser.id === row.userId;
        
        if (!isAdmin && !isOwner) return null;

        return (
          <ButtonGroup
            primaryActions={[]}
            dropdownActions={[
              {
                label: <FormattedMessage id="project.routines.details.edit" defaultMessage="Editar" />,
                icon: 'fa-edit',
                onClick: () => row.id && navigate(`/routines/${row.id}/edit`),
                disabled: !row.id,
              },
              {
                label: <FormattedMessage id="project.routines.table.6" defaultMessage="Eliminar" />,
                icon: 'fa-trash-alt',
                variant: 'danger',
                onClick: () => row.id && onDelete(row),
                disabled: !row.id,
              },
            ]}
            dropdownLabel={intl.formatMessage({ id: 'project.common.actions', defaultMessage: 'Acciones' })}
          />
        );
      },
    },
  ];

  const handleRowClick = (row) => {
    if (row.id) {
      navigateWithLoading(`/routines/${row.id}`, 'Cargando detalles de la rutina...');
    }
  };

  const { navigateWithLoading, isLoading: navIsLoading, loadingMessage: navLoadingMessage } = useNavigationWithLoading();

  return (
    <>
      <Table
        columns={columns}
        data={list || []}
        isLoading={tableIsLoading}
        loadingMessage={tableLoadingMessage}
        emptyMessage={<FormattedMessage id="project.routines.table.7" defaultMessage="No hay rutinas." />}
        onRowClick={handleRowClick}
      />
      {navIsLoading && (
        <LoadingSpinner 
          message={navLoadingMessage}
          size="md"
          overlay={true}
        />
      )}
    </>
  );
};

RoutineTable.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      level: PropTypes.string,
      category: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      categoryName: PropTypes.string,
      userName: PropTypes.string,
      user: PropTypes.string,
      userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      openPublic: PropTypes.bool
    })
  ),
  onDelete: PropTypes.func.isRequired,
  showVisibility: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.string
};

export default RoutineTable;
