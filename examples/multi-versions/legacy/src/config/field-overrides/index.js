import attribute from './attribute';
import dataElement from './dataElement';
import indicator from './indicator';
import dataSet from './dataSet';
import dataSetNotificationTemplate from './dataSetNotificationTemplate';
import organisationUnit from './organisationUnit';
import organisationUnitGroup from './organisationUnitGroup';
import categoryCombo from './categoryCombo';
import categoryOption from './categoryOption';
import legendSet from './legendSet';
import locale from './locale';
import trackedEntityAttribute from './trackedEntityAttribute';
import trackedEntityType from './trackedEntityType';
import predictor from './predictor';
import pushAnalysis from './pushAnalysis';
import externalMapLayer from './externalMapLayer';
import validationRule from './validationRule';
import validationNotificationTemplate from './validationNotificationTemplate';
import programIndicator from './programIndicator';
import programNotificationTemplate, {
    programStageNotificationTemplate,
} from './programNotificationTemplate';
import relationshipType from './relationshipType';
import { eventProgram, trackerProgram, enrollment } from './program';
import programRule from './programRule';
import programRuleVariable from './programRuleVariable';
import dataApprovalLevel from './dataApprovalLevel';
import dataApprovalWorkflow from './dataApprovalWorkflow';
import programStage from './programStage';
import optionGroup from './optionGroup';
import sqlView from './sqlView';
import optionGroupSet from './optionGroupSet';
import eventProgramStage from './eventProgramStage';

const overridesByType = {
    attribute,
    categoryCombo,
    categoryOption,
    dataElement,
    dataSet,
    dataApprovalLevel,
    dataApprovalWorkflow,
    dataSetNotificationTemplate,
    externalMapLayer,
    indicator,
    legendSet,
    locale,
    organisationUnit,
    organisationUnitGroup,
    pushAnalysis,
    eventProgram,
    eventProgramStage,
    programStage,
    programIndicator,
    programNotificationTemplate,
    programStageNotificationTemplate,
    programRule,
    programRuleVariable,
    predictor,
    relationshipType,
    validationRule,
    validationNotificationTemplate,
    trackedEntityAttribute,
    trackedEntityType,
    trackerProgram,
    enrollment,
    optionGroup,
    optionGroupSet,
    sqlView,
};

export default {
    /**
     * @method
     *
     * @params {String} schemaName The name of the schema for which to get the overrides
     * @returns {Map} A map with the name and configs of the field overrides.
     * This can be used to easily add overrides for a type to your `FormFieldsManager`
     *
     * @example
     * ```
     * import fieldOverrides from 'field-overrides';
     *
     * let dataElementOverrides = fieldOverrides.for('dataElement');
     * ```
     */
    for(schemaName) {
        if (schemaName && overridesByType[schemaName]) {
            return overridesByType[schemaName];
        }
        return new Map();
    },
};
