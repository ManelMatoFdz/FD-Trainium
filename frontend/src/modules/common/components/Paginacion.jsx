import { FormattedMessage } from 'react-intl';
import Button from './Button';
import PropTypes from 'prop-types';

export default function Paginacion({ page, existMoreItems, setPage }) {
    return (
        <div className="d-flex justify-content-between mt-3">
            <div>
                {page > 0 && (
                    <Button
                        variant="outline"
                        icon="fa-chevron-left"
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        type="button"
                    >
                        <FormattedMessage id="project.exercises.list.pagination.previous" defaultMessage="Anterior" />
                    </Button>
                )}
            </div>
            <div>
                {existMoreItems && (
                    <Button
                        variant="outline"
                        icon="fa-chevron-right"
                        iconPosition="right"
                        onClick={() => setPage((p) => p + 1)}
                        type="button"
                    >
                        <FormattedMessage id="project.exercises.list.pagination.next" defaultMessage="Siguiente" />
                    </Button>
                )}
            </div>
        </div>
    );
}

Paginacion.propTypes = {
    page: PropTypes.number.isRequired,
    existMoreItems: PropTypes.bool.isRequired,
    setPage: PropTypes.func.isRequired,
};
