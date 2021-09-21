import React, { PropTypes } from 'react';
import withSkipLogic from './helpers/withSkipLogic';
import DropDown from '../../forms/form-fields/drop-down';
import SubFieldWrap from './helpers/SubFieldWrap';
import { range, compose, map, get } from 'lodash/fp';
import actions from '../../EditModel/objectActions';

function createWeekOption(weekDayNr) {
    const weekDays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];

    return {
        text: weekDays[weekDayNr],
        value: weekDayNr,
    };
}

const daysInWeekOptions = map(createWeekOption, range(1, 7));
const daysInMonthOptions = map(number => ({ text: number, value: number }), range(1, 32));

const options = new Map([
    ['WEEKLY', daysInWeekOptions],
    ['MONTHLY', daysInMonthOptions],
]);

function SchedulingDayOfFrequency({ model }, { d2 }) {
    return (
        <SubFieldWrap>
            <DropDown
                labelText={d2.i18n.getTranslation('day_on_which_to_run_the_task')}
                value={model.schedulingDayOfFrequency}
                options={options.get(model.schedulingFrequency) || []}
                onChange={compose(value => actions.update({ fieldName: 'schedulingDayOfFrequency', value }), get('target.value'))}
                isRequired
            />
        </SubFieldWrap>
    );
}
SchedulingDayOfFrequency.contextTypes = {
    d2: PropTypes.object,
};

export default new Map([
    ['schedulingFrequency', {
        component: withSkipLogic(props => ['WEEKLY', 'MONTHLY'].indexOf(props.value) >= 0, SchedulingDayOfFrequency, DropDown),
        required: true,
    }],
]);
