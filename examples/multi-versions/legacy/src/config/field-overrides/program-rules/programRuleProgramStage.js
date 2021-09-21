import React from 'react';
import DropdownAsync from '../../../forms/form-fields/drop-down-async';
import PropTypes from 'prop-types';
import objectActions from '../../../EditModel/objectActions';

class ProgramStageField extends React.Component {
    constructor(props, context) {
        super(props);
        
        //Need this in state, or else the dropdown will reload all the time, since the
        //filter is a new reference
        this.state = {
            queryParamFilter: this.getQueryParamFilter(),
            programId: (props.model.program && props.model.program.id) || null,
        };
    }

    getQueryParamFilter = (props = this.props) => {
        if(!props.model.program) {
            return null;
        }
        return [`program.id:eq:${props.model.program.id}`];
    }

    componentWillReceiveProps(newProps) {
        const selectedProgram = newProps.model.program;
        if (selectedProgram && selectedProgram.id !== this.state.programId) {
            const queryParamFilter = this.getQueryParamFilter(newProps);

            this.setState({
                programId: selectedProgram.id,
                queryParamFilter
            });
            //Clear programStage when program is changed
            objectActions.update({fieldName: 'programStage', value: null})
        }
    }

    shouldRender = () => {
        const props = this.props;
        const isEventProgram = props.model.program && props.model.program.programType === "WITHOUT_REGISTRATION";
        return props.model.program && !isEventProgram;
    }

    render() {
        if(!this.shouldRender()) {
            return null;
        }
        
        return (
            <DropdownAsync
                {...this.props}
                queryParamFilter={this.state.queryParamFilter}
                labelText={this.context.d2.i18n.getTranslation(
                    'trigger_rule_only_for_program_stage'
                )}
            />
        );
    }
}

ProgramStageField.contextTypes = {
    d2: PropTypes.object,
};

export default ProgramStageField;
