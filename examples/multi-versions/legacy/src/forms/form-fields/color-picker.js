import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import PropTypes from 'prop-types';
import FieldWrapper from './helpers/FieldWrapper';
import ColorPicker from './helpers/ColorPicker';

export default class ColorPickerField extends Component {
    constructor(props, context) {
        super(props, context);

        const style = { color: props.value };
        this.state = { style };
    }

    updateStyleState = (newStyleProp) => {
        const style = {
            ...this.state.style,
            ...newStyleProp,
        };

        this.setState({ style });

        this.props.onChange({
            target: { value: style.color },
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
                <Divider />
            </div>
        );
    }
}

ColorPickerField.propTypes = {
    modelDefinition: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

ColorPickerField.contextTypes = {
    d2: PropTypes.object,
};
