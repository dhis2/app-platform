import React from 'react';
import PropTypes from 'prop-types';

import { get, compose } from 'lodash/fp';
import DropDown from '../../../forms/form-fields/drop-down';
import actions from '../../../EditModel/objectActions';

const isUniqueInSystem = trackedEntityAttribute =>
    (trackedEntityAttribute.orgunitScope === false || trackedEntityAttribute.orgunitScope === undefined) &&
    (trackedEntityAttribute.programScope === false || trackedEntityAttribute.programScope === undefined);

const isUniqueInOrgUnit = trackedEntityAttribute =>
    trackedEntityAttribute.orgunitScope === true &&
    (trackedEntityAttribute.programScope === false || trackedEntityAttribute.programScope === undefined);

const getUniqueInDropDownValueFromTrackedEntityAttribute = (trackedEntityAttribute) => {
    if (isUniqueInSystem(trackedEntityAttribute)) {
        return 'entire_system';
    }

    if (isUniqueInOrgUnit(trackedEntityAttribute)) {
        return 'organisation_unit';
    }
};

const OrgUnitScopeDropDown = (props) => {
    const uniqueWithinOption = [
        {
            text: 'organisation_unit',
            value: 'organisation_unit',
        },
        {
            text: 'entire_system',
            value: 'entire_system',
        },
    ];

    return (
        <DropDown
            options={uniqueWithinOption}
            translateOptions
            isRequired
            value={getUniqueInDropDownValueFromTrackedEntityAttribute(props.model)}
            onChange={compose((value) => {
                if (value === 'organisation_unit') {
                    actions.update({ fieldName: 'orgunitScope', value: true });
                }

                if (value === 'entire_system') {
                    actions.update({ fieldName: 'orgunitScope', value: false });
                }
            }, get('target.value'))}
        />
    );
};

OrgUnitScopeDropDown.propTypes = { model: PropTypes.object.isRequired };

export default OrgUnitScopeDropDown;
