/* eslint-disable no-bitwise */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FieldWrapper from './helpers/FieldWrapper';
import IconPickerDialog from './helpers/IconPickerDialog/IconPickerDialog';
import ColorPicker from './helpers/ColorPicker';

export default class StyleFields extends Component {
    constructor(props, context) {
        super(props, context);

        const style = {
            color: '',
            icon: '',
        };

        const orgStyle = props.value;

        this.state = {
            style: {
                // model style
                ...style,
                ...orgStyle,
            },
        };
    }

    updateStyleState = (newStyleProp) => {
        const style = {
            ...this.state.style,
            ...newStyleProp,
        };

        this.setState({ style });

        this.props.onChange({
            target: {
                value: style,
            },
        });
    };

    render() {
        const { name: modelName } = this.props.modelDefinition;
        return (
            <div>
                <FieldWrapper label="Color">
                    <ColorPicker
                        updateStyleState={this.updateStyleState}
                        color={this.state.style.color}
                        modelName={modelName}
                    />
                </FieldWrapper>
                <FieldWrapper label="Icon">
                    <IconPickerDialog
                        updateStyleState={this.updateStyleState}
                        iconKey={this.state.style.icon}
                    />
                </FieldWrapper>
            </div>
        );
    }
}

StyleFields.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    modelDefinition: PropTypes.object.isRequired,
};

StyleFields.defaultProps = {
    value: null,
};

StyleFields.contextTypes = {
    d2: PropTypes.object,
};
