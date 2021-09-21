import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import { modelToEditSelector } from './selectors';
import { setStageNotificationValue, setSelectedProgramStage } from './actions';
import {
    createFieldConfigsFor,
    addPropsToFieldConfig,
} from '../../formHelpers';
import DropDown from '../../../forms/form-fields/drop-down';
import fieldGroups from '../../../config/field-config/field-groups';

const mapStateToProps = state => {
    return {
        model: modelToEditSelector(state),
    };
};

const mapDispatchToProps = dispatch => ({
    onUpdateField(fieldName, value) {
        dispatch(setStageNotificationValue(fieldName, value));
    },
    handleProgramStageSelect(stage) {
        dispatch(setSelectedProgramStage(stage));
    },
});

const programStagesToOptions = programStages =>
    programStages.map((elem, i) => ({
        text: elem.displayName,
        value: elem.id,
    }));

class WhatToSendStep extends Component {
    constructor(props) {
        super(props);

        this.state = {
            programStageId: props.model.programStage ?  props.model.programStage.id : null,
        };
    }

    handleProgramStage = event => {
        const sId = event.target.value;
        const selectedStage = this.props.programStages.find(stage => stage.id === sId);
        this.setState({
            ...this.state,
            programStageId: sId,
        });
        this.props.handleProgramStageSelect(selectedStage);
    };

    createProgramStageDropdown = () => {
        return {
            name: 'programStage',
            component: DropDown,
            props: {
                options: programStagesToOptions(this.props.programStages),
                labelText: 'Program stage',
                fullWidth: true,
                value: this.state.programStageId,
                onChange: this.handleProgramStage,
            },
        };
    };

    render() {
        const {
            fieldConfigs,
            onUpdateField,
            isTracker,
            isProgram,
            dataElements,
            attributes,
        } = this.props;
        let fieldsToUse =
            isTracker && !isProgram
                ? [this.createProgramStageDropdown(), ...fieldConfigs]
                : fieldConfigs;

        const propsToField = { dataElements, attributes, isProgram };
        return (
            <FormBuilder
                fields={fieldsToUse.map(
                    addPropsToFieldConfig(propsToField, ['messageTemplate'])
                )}
                onUpdateField={onUpdateField}
            />
        );
    }
}

WhatToSendStep = compose(
    connect(
        mapStateToProps,
        dispatch => ({
            onUpdateField(fieldName, value) {
                dispatch(setStageNotificationValue(fieldName, value));
            },
            handleProgramStageSelect(stage) {
                dispatch(setSelectedProgramStage(stage));
            },
        }),
        undefined,
        { pure: false }
    ),
    createFieldConfigsFor(
        'programNotificationTemplate',
        fieldGroups.for('programStageNotificationTemplate')[0].fields
    )
)(WhatToSendStep);

const stepToFormBuilder = ({
    fieldConfigs = [],
    onUpdateField,
    dataElements,
    isTracker,
    isProgram,
    attributes,
}) => {
    const fieldProps = { dataElements, isTracker, isProgram, attributes };
    let fieldsToUse = fieldConfigs;

    //TODO cleanup this
    //Remove PROGRAM_ATTRIBUTE options when it's an event-program
    if(!isTracker) {
        fieldsToUse = fieldsToUse.map(field => {
            if(field.name === 'notificationRecipient') {
                const removedOptions = field.props.options.filter(opt => opt.value !== "PROGRAM_ATTRIBUTE");
                const propsWithRemovedRecipient = {...field.props, options: removedOptions}
                return { ...field, props: { ...propsWithRemovedRecipient} }
            }
            return field;
        })
    }
    return (
        <FormBuilder
            fields={fieldsToUse.map(addPropsToFieldConfig(fieldProps, ['recipientDataElement', 'recipientProgramAttribute']))}
            onUpdateField={onUpdateField}
        />
    );
};

const connectSteps = connect(mapStateToProps, mapDispatchToProps, undefined, {
    pure: false,
});

export const programStageSteps = [
    {
        key: 'what',
        name: 'what_to_send',
        content: WhatToSendStep,
    },
    {
        key: 'when',
        name: 'when_to_send_it',
        content: compose(
            connectSteps,
            createFieldConfigsFor(
                'programNotificationTemplate',
                fieldGroups.for('programStageNotificationTemplate')[1].fields,
                undefined,
                null,
                true,
                'programStageNotificationTemplate'
            )
        )(stepToFormBuilder),
    },
    {
        key: 'who',
        name: 'who_to_send_it_to',
        content: compose(
            connectSteps,
            createFieldConfigsFor(
                'programNotificationTemplate',
                fieldGroups.for('programStageNotificationTemplate')[2].fields,
                undefined,
                null,
                true,
                'programStageNotificationTemplate'
            )
        )(stepToFormBuilder),
    },
];

export const programSteps = [
    {
        key: 'what',
        name: 'what_to_send',
        content: WhatToSendStep,
    },
    {
        key: 'when',
        name: 'when_to_send_it',
        content: compose(
            connectSteps,
            createFieldConfigsFor(
                'programNotificationTemplate',
                fieldGroups.for('programNotificationTemplate')[1].fields
            )
        )(stepToFormBuilder),
    },
    {
        key: 'who',
        name: 'who_to_send_it_to',
        content: compose(
            connectSteps,
            createFieldConfigsFor(
                'programNotificationTemplate',
                fieldGroups.for('programNotificationTemplate')[2].fields
            )
        )(stepToFormBuilder),
    },
];
