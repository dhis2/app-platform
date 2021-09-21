import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withProps from 'recompose/withProps';
import compose from 'recompose/compose';
import { map } from 'lodash/fp';

import RelativeScheduledDays from './program-notification-template/RelativeScheduledDays';
import DeliveryChannels from './program-notification-template/DeliveryChannels';
import DropDownAsync from '../../forms/form-fields/drop-down-async';
import SubjectAndMessageTemplateFields from './validation-notification-template/SubjectAndMessageTemplateFields';
import { setStageNotificationValue } from '../../EditModel/event-program/notifications/actions';
import DropDownAsyncGetter from '../../forms/form-fields/drop-down-async-getter';

const PROGRAM_STAGE_VARIABLES = [
    'program_name',
    'program_stage_name',
    'org_unit_name',
    'due_date',
    'days_since_due_date',
    'days_until_due_date',
    'current_date',
];

const PROGRAM_VARIABLES = [
    'program_name',
    'org_unit_name',
    'due_date',
    'days_since_due_date',
    'days_until_due_date',
    'current_date',
];

const toVariableType = name => ['V', name];
const toAttributeType = name => ['A', name]; // Used for program attributes
const toDataElementType = name => ['#', name];

const variablesTypeMap = variables => map(toVariableType, variables);
const dataElementsTypeMap = dataElements => map(toDataElementType, dataElements);
const attributesToTypeMap = attributes => map(toAttributeType, attributes);

const boundOnUpdate = dispatch =>
    bindActionCreators(
        {
            onUpdate: ({ fieldName, value }) =>
                setStageNotificationValue(fieldName, value),
        },
        dispatch,
    );

const NotificationSubjectAndMessageTemplateFields = compose(
    connect(undefined, boundOnUpdate),
    withProps(({ dataElements, attributes, isProgram }) => {
        if (isProgram) {
            return {
                variableTypes: [
                    ...variablesTypeMap(PROGRAM_VARIABLES),
                    ...attributesToTypeMap(attributes),
                ],
            };
        }

        return {
            variableTypes: [
                ...variablesTypeMap(PROGRAM_STAGE_VARIABLES),
                ...attributesToTypeMap(attributes),
                ...dataElementsTypeMap(dataElements),
            ],
        };
    }),
)(SubjectAndMessageTemplateFields);

const isPhoneNumberOrEmail = ({ valueType }) =>
    valueType === 'PHONE_NUMBER' || valueType === 'EMAIL';

// Using dropdownasync-getter due to support for references
const ProgramAttributeDropDown = compose(connect(undefined, boundOnUpdate))((props) => {
    const attributesOpts = props.attributes
        .filter(isPhoneNumberOrEmail)
        .map(attr => ({
            text: attr.displayName,
            value: attr.trackedEntityAttribute.id,
        }));

    const getAttrs = () => Promise.resolve(attributesOpts);
    return (
        <DropDownAsyncGetter
            labelText={props.labelText}
            options={attributesOpts}
            onChange={event =>
                props.onUpdate({
                    fieldName: 'recipientProgramAttribute',
                    value: event.target.value,
                })}
            value={props.model.recipientProgramAttribute}
            fullWidth
            isRequired
            model={props.model}
            getter={getAttrs}
        />
    );
});

const DataElementDropDown = compose(
    connect(undefined, boundOnUpdate),
)((props) => {
    const dataElementOpts = props.dataElements
        .filter(isPhoneNumberOrEmail)
        .map(de => ({
            text: de.displayName,
            value: de.id,
        }));
    const getElems = () => Promise.resolve(dataElementOpts);
    return (
        <DropDownAsyncGetter
            labelText={props.labelText}
            options={dataElementOpts}
            onChange={event =>
                props.onUpdate({
                    fieldName: 'recipientDataElement',
                    value: event.target.value,
                })}
            value={props.model.recipientDataElement}
            fullWidth
            isRequired
            model={props.model}
            getter={getElems}
        />
    );
});

/**
 * programNotificationTemplate are shared for both program notification and
 * programStage notifications. We use a customFieldOrder name to differentiate
 * between these two, as they have different behavior and overrides.
 */
const sharedOverrides = [
    [
        'deliveryChannels',
        {
            component: DeliveryChannels,
        },
    ],
    [
        'relativeScheduledDays',
        {
            component: RelativeScheduledDays,
        },
    ],
    [
        'recipientUserGroup',
        {
            component: (props) => {
                if (
                    !props.model ||
                    props.model.notificationRecipient !== 'USER_GROUP'
                ) {
                    return null;
                }

                return <DropDownAsync {...props} />;
            },
        },
    ],

    [
        'recipientProgramAttribute',
        {
            component: ProgramAttributeDropDown,
        },
    ],
    [
        'messageTemplate',
        {
            component: props =>
                <NotificationSubjectAndMessageTemplateFields {...props} />,
        },
    ],
];

export const programNotificationTemplate = new Map([
    ...sharedOverrides,
    [
        'notificationTrigger',
        {
            required: true,
            fieldOptions: {
                options: [
                    'COMPLETION',
                    'ENROLLMENT',
                    'SCHEDULED_DAYS_INCIDENT_DATE',
                    'SCHEDULED_DAYS_ENROLLMENT_DATE',
                    'PROGRAM_RULE',
                ],
            },
        },
    ],
    [
        'notificationRecipient',
        {
            required: true,
            fieldOptions: {
                options: [
                    'TRACKED_ENTITY_INSTANCE',
                    'ORGANISATION_UNIT_CONTACT',
                    'USERS_AT_ORGANISATION_UNIT',
                    'USER_GROUP',
                    'PROGRAM_ATTRIBUTE',
                ],
            },
        },
    ],
]);

export const programStageNotificationTemplate = new Map([
    ...sharedOverrides,
    [
        'notificationTrigger',
        {
            required: true,
            fieldOptions: {
                // For program stages only the following values are allowed
                options: [
                    'COMPLETION',
                    'SCHEDULED_DAYS_DUE_DATE',
                    'PROGRAM_RULE',
                ],
            },
        },
    ],
    [
        'notificationRecipient',
        {
            required: true,
            fieldOptions: {
                options: [
                    'TRACKED_ENTITY_INSTANCE',
                    'ORGANISATION_UNIT_CONTACT',
                    'USERS_AT_ORGANISATION_UNIT',
                    'USER_GROUP',
                    'PROGRAM_ATTRIBUTE', // This is only for Tracker programs
                    'DATA_ELEMENT',
                ],
            },
        },
    ],
    [
        'recipientDataElement',
        {
            component: DataElementDropDown,
        },
    ],
    [
        'sendRepeatable', {
            fieldOptions: {
                labelText: 'allow_notification_multiple_times'
            }
        }
    ]
]);

export default programNotificationTemplate;
