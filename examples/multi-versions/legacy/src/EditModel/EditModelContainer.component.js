import React from 'react';
import PropTypes from 'prop-types';

import { camelCaseToUnderscores } from 'd2-utilizr';

import EditModel from './EditModel.component';
import FormHeading from './FormHeading';

function EditModelContainer(props) {
    const schema = props.params.modelType || 'organisationUnit';

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '1rem' }}>
                <FormHeading schema={schema} groupName={props.params.groupName}>
                    {camelCaseToUnderscores(schema)}
                </FormHeading>
            </div>
            <EditModel
                groupName={props.params.groupName}
                modelType={schema}
                modelId={props.params.modelId}
            />
        </div>
    );
}

EditModelContainer.propTypes = {
    params: PropTypes.any.isRequired,
};

export default EditModelContainer;
