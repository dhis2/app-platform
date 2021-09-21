import { map } from 'lodash/fp';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import mapProps from 'recompose/mapProps';
import SubjectAndMessageTemplateFields from '../validation-notification-template/SubjectAndMessageTemplateFields';
import actions from '../../../EditModel/objectActions';

const DATA_SET_VARIABLES = [
    'data_set_name',
    'current_date',
    'data_description',
    'registration_ou',
    'registration_period',
    'registration_user',
    'registration_time',
    'att_opt_combo',
];

const toVariableType = name => ['V', name];

const DataSetNotificationSubjectAndMessageTemplateFields = compose(
    withProps({
        variableTypes: map(toVariableType, DATA_SET_VARIABLES),
    }),
    mapProps(props => ({
        ...props,
        onUpdate: actions.update,
    })),
)(SubjectAndMessageTemplateFields);

export default DataSetNotificationSubjectAndMessageTemplateFields;
