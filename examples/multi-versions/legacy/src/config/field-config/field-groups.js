import { findIndex } from 'lodash/fp';
import fieldOrder from './field-order';

/*
    The stepper sets the style of the fields of the not active step to "display: none"
    to hide them from view. For this to work the component of the field needs to recieve
    the style from props. If the fields are not hidden when changing the active step
    then check if the component of the corresponding fields are receiving and using the
    style from props in its outer div.
*/

const fieldGroupsForModelType = new Map([
    [
        'programRule',
        [
            {
                label: 'enter_program_rule_details',
                fields: ['program', 'programStage', 'name', 'description', 'priority'],
            },
            {
                label: 'enter_program_rule_expression',
                fields: ['condition'],
            },
            {
                label: 'define_program_rule_actions',
                fields: ['programRuleActions'],
            },
        ],
    ],
    [
        'dataSetNotificationTemplate',
        [
            {
                label: 'what_to_send',
                fields: ['name', 'code', 'dataSets', 'messageTemplate'],
            },
            {
                label: 'when_to_send_it',
                fields: [
                    'dataSetNotificationTrigger',
                    'relativeScheduledDays',
                    'sendStrategy',
                ],
            },
            {
                label: 'who_to_send_it_to',
                fields: [
                    'notificationRecipient',
                    'recipientUserGroup',
                    'deliveryChannels',
                ],
            },
        ],
    ],
    [
        'programNotificationTemplate',
        [
            {
                label: 'what_to_send',
                fields: ['name', 'messageTemplate'],
            },
            {
                label: 'when_to_send_it',
                fields: ['notificationTrigger', 'relativeScheduledDays'],
            },
            {
                label: 'who_to_send_it_to',
                fields: [
                    'notificationRecipient',
                    'recipientUserGroup',
                    'deliveryChannels',
                    'recipientProgramAttribute',
                    'notifyUsersInHierarchyOnly',
                    'notifyParentOrganisationUnitOnly',
                ],
            },
        ],
    ],
    [
        'programStageNotificationTemplate',
        [
            {
                label: 'what_to_send',
                fields: ['name', 'messageTemplate'],
            },
            {
                label: 'when_to_send_it',
                fields: [
                    'notificationTrigger',
                    'relativeScheduledDays',
                    'sendRepeatable',
                ],
            },
            {
                label: 'who_to_send_it_to',
                fields: [
                    'notificationRecipient',
                    'recipientUserGroup',
                    'deliveryChannels',
                    'recipientDataElement',
                    'recipientProgramAttribute',
                    'notifyUsersInHierarchyOnly',
                    'notifyParentOrganisationUnitOnly',
                ],
            },
        ],
    ],
    [
        'programIndicator',
        [
            {
                label: 'program_indicator__details',
                fields: [
                    'program',
                    'name',
                    'shortName',
                    'code',
                    'style',
                    'description',
                    'decimals',
                    'aggregationType',
                    'analyticsType',
                    'analyticsPeriodBoundaries',
                    'displayInForm',
                    'legendSets',
                    'aggregateExportCategoryOptionCombo',
                    'aggregateExportAttributeOptionCombo',
                ],
            },
            {
                label: 'program_indicator__edit_expression',
                fields: ['expression'],
            },
            {
                label: 'program_indicator__edit_filter',
                fields: [
                    'filter',
                ],
            },
        ],
    ],
]);

export default {
    for(modelType) {
        if (this.isGroupedFields(modelType)) {
            return fieldGroupsForModelType.get(modelType);
        }

        return [
            {
                label: 'details',
                fields: fieldOrder.for(modelType),
            },
        ];
    },

    isGroupedFields(modelType) {
        return modelType && fieldGroupsForModelType.has(modelType);
    },

    getStepLength(modelType) {
        if (this.isGroupedFields(modelType)) {
            const modelGroup = fieldGroupsForModelType.get(modelType);
            return modelGroup.length;
        }
        return 0;
    },

    groupNoByName(fieldName, modelType) {
        if (this.isGroupedFields(modelType)) {
            const modelGroup = fieldGroupsForModelType.get(modelType);
            return findIndex((group => group.fields.includes(fieldName)), modelGroup);
        }
        return 0;
    },

    groupNameByStep(stepNo, modelType) {
        if (this.isGroupedFields(modelType)) {
            const modelGroup = fieldGroupsForModelType.get(modelType);
            return modelGroup[stepNo].label;
        }
        return '';
    },

    groupsByField(modelType) {
        if (this.isGroupedFields(modelType)) {
            return fieldGroupsForModelType
                .get(modelType)
                .map(group => group.fields)
                .reduce((fieldsWithStep, groupFields, stepNo) => {
                    groupFields.map(field => fieldsWithStep[field] = stepNo);
                    return fieldsWithStep;
                }, {});
        }
    },
};
