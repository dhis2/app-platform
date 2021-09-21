import React from 'react';
import PropTypes from 'prop-types';
import ProgramRuleActionList from './program-rules/programRuleActionList.component';
import ProgramRuleConditionField from './program-rules/programRuleConditionField.component';
import ProgramStageField from './program-rules/programRuleProgramStage';

import withState from 'recompose/withState';
import getContext from 'recompose/getContext';
import lifecycle from 'recompose/lifecycle';
import { decimals } from './sharedFields';
import { compose } from 'lodash/fp';

import ProgramIndicatorExpression from './program-indicator/ProgramIndicatorExpression';
import { ExpressionStatus } from './program-indicator/ExpressionStatusIcon';
import { AnalyticsPeriodBoundaries } from './program-indicator/AnalyticsPeriodBoundaries';
import createExpressionValidator from './program-indicator/createExpressionValidator';

const setValidatorSubscription = (context, subFunc, programId) => {
    const path = `programRules/condition/description?programId=${
        programId
    }`;
    const { status$, validate } = createExpressionValidator(path, subFunc);
    context.validatorStatusSubscription = status$.subscribe(subFunc)
    context.validate = validate
    context.props.setValidatorProgramId(programId)
    return { status$, validate }
};

const enhance = compose(
    getContext({ d2: PropTypes.object }),
    withState('status', 'setStatus', ({ d2 }) => ({
        status: ExpressionStatus.PENDING,
        message: d2.i18n.getTranslation('checking_expression_status'),
    })),
    withState('validatorProgramId', 'setValidatorProgramId', () => undefined),
    lifecycle({
        componentDidMount() {
            const { setStatus, value } = this.props;
            if(!this.props.model || !this.props.model.program || !this.props.model.program.id) {
                // this only happens when a new rule is created
                setStatus(null) // prevent status from being shown when program is not selected
                return
            }
            setValidatorSubscription(this, setStatus, this.props.model.program.id)
            this.validate(value);
        },

        componentWillReceiveProps(newProps) {
            // Need to create a new validator when program is changed, as the validation depends on it
            if (newProps.model.program && (!this.props.validatorProgramId || newProps.model.program.id !== this.props.validatorProgramId)) {
                this.validatorStatusSubscription && this.validatorStatusSubscription.unsubscribe();
                setValidatorSubscription(this, this.props.setStatus, newProps.model.program.id);
                this.validate(newProps.value);
            }
            else if (newProps.value !== this.props.value) {
                this.validate(newProps.value);
            }
        },

        componentWillUnmount() {
            this.validatorStatusSubscription && this.validatorStatusSubscription.unsubscribe();
        },
    }),
);

const EnhancedProgramRuleConditionField = enhance(ProgramRuleConditionField)

export default new Map([
    ['condition', {
        component: EnhancedProgramRuleConditionField,
    }],
    ['programRuleActions', {
        component: ProgramRuleActionList,
    }],
    ['programStage', {
        component: ProgramStageField,
    }],
]);
