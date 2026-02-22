import { useSelector } from 'react-redux';
import '../../../index.css';
import { FormattedMessage } from 'react-intl';

import * as selectors from '../selectors.js';

const CategorySelector = (selectProps) => {

    const categories = useSelector(selectors.getCategories);
    const { className, ...rest } = selectProps || {};

    return (

        <div className="flex-fill" style={{ flex: '1 1 320px', minWidth: '280px' }}>
          <select
            {...rest}
            className={`custom-select${className ? ' ' + className : ''}`}
          >
            <option value=""><FormattedMessage id="project.routines.search.category.label" defaultMessage="Todas las Categorías" /></option>
            {categories?.map(category =>
                <option id={category.name} key={category.id} value={category.id}>{category.name}</option>
            )}
          </select>
        </div>

    );

}

export default CategorySelector;
