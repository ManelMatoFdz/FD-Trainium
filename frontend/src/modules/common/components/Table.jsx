import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import LoadingSpinner from './LoadingSpinner';

const Table = ({
  columns,
  data,
  emptyMessage = 'No hay datos disponibles',
  isLoading = false,
  loadingMessage = 'Cargando...',
  onRowClick,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className="trainium-table-card">
        <LoadingSpinner
          message={loadingMessage}
          size="sm"
          overlay={false}
          className="trainium-table__loading-spinner"
        />
      </div>
    );
  }

  return (
    <div className={`trainium-table-card ${className}`}>
      <div className="trainium-table-wrapper">
        <table className="trainium-table">
          <thead className="trainium-table__head">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="trainium-table__header"
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="trainium-table__body">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`trainium-table__row ${onRowClick ? 'trainium-table__row--clickable' : ''}`}
                  onClick={(e) => {
                    // Solo ejecutar si no se hizo click en un botón o enlace
                    if (onRowClick && !e.target.closest('button, a, .trainium-dropdown')) {
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className="trainium-table__cell"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="trainium-table__empty">
                  <div className="trainium-table__empty-content">
                    <EmptyIcon />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function EmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      header: PropTypes.node.isRequired,
      render: PropTypes.func,
      width: PropTypes.string,
      align: PropTypes.oneOf(['left', 'center', 'right']),
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  emptyMessage: PropTypes.node,
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

export default Table;
