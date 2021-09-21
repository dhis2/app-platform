import React, { PropTypes } from 'react';
import { compose } from 'lodash/fp';
import getContext from 'recompose/getContext';

import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import DropDown from '../../../forms/form-fields/drop-down';
import TextField from '../../../forms/form-fields/text-field';
import PeriodTypeDropDown from '../../../forms/form-fields/period-type-drop-down';

import {
    BEFORE_START_OF_REPORTING_PERIOD,
    BEFORE_END_OF_REPORTING_PERIOD,
    AFTER_START_OF_REPORTING_PERIOD,
    AFTER_END_OF_REPORTING_PERIOD,
    INCIDENT_DATE,
    EVENT_DATE,
    ENROLLMENT_DATE,
    CUSTOM,
} from './enums';

const boundaryTargets = [
    {
        text: 'boundary_target_incident_date',
        value: INCIDENT_DATE,
    },
    {
        text: 'boundary_target_event_date',
        value: EVENT_DATE,
    },
    {
        text: 'boundary_target_enrollment_date',
        value: ENROLLMENT_DATE,
    },
    {
        text: 'boundary_target_custom',
        value: CUSTOM,
    }
];

// boundary type definitions mapped to java enum
// dhis2-core/dhis-2/dhis-api/src/main/java/org/hisp/dhis/program/AnalyticsPeriodBoundaryType.java#L37-L40
// as they are not exposed over the API
const boundaryTypes = [
    {
        text: 'report_period_before_start',
        value: BEFORE_START_OF_REPORTING_PERIOD,
    },
    {
        text: 'report_period_before_end',
        value: BEFORE_END_OF_REPORTING_PERIOD,
    },
    {
        text: 'report_period_after_start',
        value: AFTER_START_OF_REPORTING_PERIOD,
    },
    {
        text: 'report_period_after_end',
        value: AFTER_END_OF_REPORTING_PERIOD,
    },
];

function AnalyticsPeriodBoundary(props) {
    const getTranslation = props.d2.i18n.getTranslation.bind(props.d2.i18n);

    const filteredBoundaryTargets = boundaryTargets
        .filter(e => e.value !== CUSTOM && e.value === props.boundaryTarget)
        .length

    const renderCustom = () => props.boundaryTarget !== null && filteredBoundaryTargets === 0;

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'top',
            marginBottom: '16px',
            paddingLeft: '8px',
            paddingRight: '8px',
            borderStyle: 'none none none solid',
            borderWidth: '1px',
            borderColor: 'rgb(189, 189, 189)',
        }}
        >
            <div style={{ flex: '0 1 200px', marginRight: '14px' }}>
                <DropDown
                    labelText={getTranslation('analytics_boundary_target')}
                    translateOptions
                    options={boundaryTargets}
                    onChange={e => props.onChange(e, 'boundaryTarget')}
                    value={renderCustom() ? CUSTOM : props.boundaryTarget}
                />
            </div>

            {renderCustom() &&
            <div style={{ flex: '0 1 200px', marginRight: '14px' }}>
                <TextField
                    value={props.boundaryTarget === CUSTOM ? '' : props.boundaryTarget}
                    name={props.id + '_custom'}
                    labelText={getTranslation('boundary_target_custom_text')}
                    onChange={e => props.onChange(e, 'boundaryTarget')}
                />
            </div>
            }

            <div style={{ flex: '0 1 200px', marginRight: '14px' }}>
                <DropDown
                    labelText={getTranslation('analytics_period_boundary_type')}
                    translateOptions
                    options={boundaryTypes}
                    onChange={e => props.onChange(e, 'analyticsPeriodBoundaryType')}
                    value={props.analyticsPeriodBoundaryType}
                />
            </div>

            <div style={{ flex: '0 1 64px', marginRight: '14px' }}>
                <TextField
                    type="number"
                    labelText={getTranslation('period_number_offset')}
                    value={props.offsetPeriods}
                    onChange={e => props.onChange(e, 'offsetPeriods')}
                />
            </div>

            <div style={{ flex: '0 1 200px', marginRight: '14px' }}>
                <PeriodTypeDropDown
                    labelText={getTranslation('period_offset')}
                    onChange={e => props.onChange(e, 'offsetPeriodType')}
                    value={props.offsetPeriodType}
                />
            </div>

            <div style={{ flex: '0 1 auto', marginRight: '14px', paddingTop: '21px' }}>
                <RaisedButton
                    label={getTranslation('remove_singular')}
                    onClick={e => props.onClick(e)}
                />
            </div>
        </div>
    );
}

function updateSubField(element, model, onChange, idx, e, fieldName) {
    const changeToVal = e.target.value;

    const list = model.analyticsPeriodBoundaries;
    const newEl = Object.assign({}, element, { [fieldName]: changeToVal });

    list[idx] = newEl;

    return onChange({ target: { value: list } });
}

function removeSubField(model, onChange, idx, e) {
    const list = model.analyticsPeriodBoundaries;
    const newList = list.filter((_, i) => i !== idx);

    return onChange({ target: { value: newList } });
}

function addSubField(model, onChange) {
    const list = model.analyticsPeriodBoundaries || [];

    const newVal = {
        analyticsPeriodBoundaryType: '',
        boundaryTarget: '',
        offsetPeriods: 0,
        offsetPeriodType: '',
    };

    return onChange({ target: {
        value: list.concat([newVal]),
    } });
}

function AnalyticsPeriodBoundaryList({ d2, model, onChange, style }) {
    const getTranslation = d2.i18n.getTranslation.bind(d2.i18n);

    let analyticsPeriodBoundaries = [];

    if (model.analyticsPeriodBoundaries) {
        analyticsPeriodBoundaries = model.analyticsPeriodBoundaries;
    }

    const boundaries = analyticsPeriodBoundaries.map((props, i) => (
        <AnalyticsPeriodBoundary
            key={i}
            d2={d2}
            onChange={updateSubField.bind(this, props, model, onChange, i)}
            onClick={removeSubField.bind(this, model, onChange, i)}
            {...props}
        />
    ));

    return (<div style={style}>
        <h3 style={{ color: 'rgba(0,0,0,0.5)', fontWeight: 'normal', fontSize: '16px' }}>
            {getTranslation('analytics_period_boundaries')}
        </h3>
        <div>
            <div>{boundaries}</div>
            <div style={{ marginTop: '14px' }}>
                <RaisedButton
                    secondary
                    onClick={addSubField.bind(this, model, onChange)}
                    label={getTranslation('add_period_boundary')}
                />
            </div>
        </div>
    </div>);
}

const enhance = compose(
    getContext({ d2: PropTypes.object }),
);

export const AnalyticsPeriodBoundaries = enhance(AnalyticsPeriodBoundaryList);
