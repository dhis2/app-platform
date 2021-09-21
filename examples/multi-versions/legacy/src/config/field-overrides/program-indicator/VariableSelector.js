import mapPropsStream from 'recompose/mapPropsStream';
import { noop, overSome, negate } from 'lodash/fp';
import { Observable } from 'rxjs';
import { getInstance, config } from 'd2/lib/d2';
import CollapsibleList from './CollapsibleList';

config.i18n.strings.add('enrollment_count');
config.i18n.strings.add('program_stage_id');
config.i18n.strings.add('enrollment_status');
config.i18n.strings.add('tei_count');

const typeFilter = type => props => props.type === type;
const aggregationTypeFilter = type => ({ aggregationType }) =>
    aggregationType === type;
const isFilterType = typeFilter('filter');

const isEventProgram = ({ programType }) =>
    programType === 'WITHOUT_REGISTRATION';
const isAggregationTypeNotCount = negate(aggregationTypeFilter('COUNT'));
const isAnalyticsTypeEnrollment = ({ analyticsType }) =>
    analyticsType === 'ENROLLMENT';

const programIndicatorVariables = [
    'completed_date',
    'creation_date',
    'current_date',
    'due_date',
    'event_date',
    'sync_date',
    'value_count',
    'zero_pos_value_count',
];
// See https://jira.dhis2.org/browse/DHIS2-6256 for reference
// Hidden if true
const conditionalPIVariables = {
    enrollment_count: overSome([isFilterType, isAggregationTypeNotCount]),
    enrollment_date: isEventProgram,
    enrollment_status: isEventProgram,
    event_count: overSome([isFilterType, isAggregationTypeNotCount]),
    org_unit_count: isFilterType,
    incident_date: isEventProgram,
    program_stage_id: isAnalyticsTypeEnrollment,
    program_stage_name: isAnalyticsTypeEnrollment,
    tei_count: overSome([isFilterType, isAggregationTypeNotCount]),
};

const getProgramVariables = props => {
    const variables = programIndicatorVariables;
    const conds = Object.keys(conditionalPIVariables).filter(variable => {
        const predicate = conditionalPIVariables[variable];
        return !predicate(props);
    });
    return variables.concat(conds).sort();
};

const d2$ = Observable.fromPromise(getInstance());

const withVariablePropsForProgramType = mapPropsStream(props$ => props$
    .mergeMap(( props ) => {
        const variables = getProgramVariables(props);

        return d2$
            .map(d2 => ({
                ...props,
                variables: variables
                    .map(variable => ({
                        label: d2.i18n.getTranslation(variable),
                        value: variable,
                    })),
            }));
    })
    .map(({ variables, onSelect = noop, ...props }) => ({
        ...props,
        items: variables.map(({ label, value }) => ({
            value: `V{${value}}`,
            label,
        })),
        onItemClick: onSelect,
    })),
);

const VariableSelector = withVariablePropsForProgramType(CollapsibleList);

export default VariableSelector;
