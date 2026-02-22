import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

const ProductLink = ({id, name}) => {

    return (
        <Link to={`/catalog/products/${id}`}>
            {name}
        </Link>
    );

}

ProductLink.propTypes = {
    id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired,
    name: PropTypes.string.isRequired
};

export default ProductLink;
