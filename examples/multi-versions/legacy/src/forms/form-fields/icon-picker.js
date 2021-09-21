import React from 'react';
import PropTypes from 'prop-types';

import IconPicker from 'd2-ui/lib/icon-picker/IconPicker.component';
import Divider from 'material-ui/Divider';

export default function IconPickerField(props) {
    function transformChange(value) {
        props.onChange({
            target: {
                value,
            },
        });
    }
    const iconPickerOptions = props.options
        .map(option => option.value);

    // remove when padding has been fixed in d2-ui. past version "29.0.11",
    const iconPopoverStyle = {
        paddingLeft: '1rem',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingRight: '-1rem',
        width: '40%',
    };

    return (
        <div>
            <IconPicker
                value={props.value}
                labelText={props.labelText}
                imgPath={props.imgPath}
                options={iconPickerOptions}
                onChange={transformChange}
                iconPopoverStyle={iconPopoverStyle}
            />
            <Divider />
        </div>
    );
}

IconPickerField.propTypes = {
    imgPath: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    labelText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
};

IconPickerField.defaultProps = {
    value: '',
};
