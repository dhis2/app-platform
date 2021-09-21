import React from 'react';
import PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';

function SaveButton(props, { d2 }) {
    const {
        label,
        isSaving,
        isValid,
        onClick,
        ...rest
    } = props;

    const buttonText = label
        ? label
        : isSaving 
            ? d2.i18n.getTranslation('saving') 
            : d2.i18n.getTranslation('save');

    return (
        <RaisedButton
            {...rest}
            primary
            onClick={onClick}
            label={buttonText}
            disabled={isSaving}
        />
    );
}

SaveButton.propTypes = {
    label: PropTypes.string,
    isSaving: PropTypes.bool,
    isValid: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};

SaveButton.defaultProps = {
    label: '',
    isSaving: false,
    isValid: true,
};

export default addD2Context(SaveButton);
