import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

export default function SqlQuery(props) {
    const textfieldProps = {
        errorStyle: props.errorStyle,
        errorText: props.errorText,
        fullWidth: props.fullWidth,
        onChange: props.onChange,
        value: props.value,
        multiLine: true,
        rows: 8,
        rowsMax: 40,
        floatingLabelText: props.labelText,
    };
    return <TextField {...textfieldProps} />;
}

SqlQuery.propTypes = {
    errorStyle: PropTypes.object,
    errorText: PropTypes.string,
    fullWidth: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    labelText: PropTypes.string.isRequired,
};

SqlQuery.defaultProps = {
    errorStyle: {},
    errorText: null,
    fullWidth: true,
    value: '',
};
