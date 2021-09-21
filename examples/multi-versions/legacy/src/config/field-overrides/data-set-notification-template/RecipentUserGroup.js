
import React from 'react';
import PropTypes from 'prop-types';
import DropDownAsync from '../../../forms/form-fields/drop-down-async';

const RecipentUserGroup = (props) => {
    if (!props.model || props.model.notificationRecipient !== 'USER_GROUP') {
        return null;
    }

    return (
        <div style={props.style} >
            <DropDownAsync {...props} />
        </div>);
};

RecipentUserGroup.propTypes = {
    style: PropTypes.object,
    model: PropTypes.shape({
        notificationRecipient: PropTypes.string,
    }),
};

RecipentUserGroup.defaultProps = {
    style: {},
    model: null,
};

export default RecipentUserGroup;
