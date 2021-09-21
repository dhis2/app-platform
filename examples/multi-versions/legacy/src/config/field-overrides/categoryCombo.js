import React from 'react';
import MultiSelect from '../../forms/form-fields/multi-select';

export default new Map([
    ['categories', {
        component: (props) => {
            let queryFilter;

            if (props.model.dataDimensionType) {
                queryFilter = `dataDimensionType:eq:${props.model.dataDimensionType}`;
            }

            return (
                <MultiSelect
                    {...props}
                    queryParamFilter={queryFilter}
                />
            );
        },
    }],
]);
