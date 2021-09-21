import React from 'react';
import PropTypes from 'prop-types';

import withD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import { get, compose } from 'lodash/fp';

import SubFieldWrap from './helpers/SubFieldWrap';
import actions from '../../EditModel/objectActions';
import DropDown from '../../forms/form-fields/drop-down';
import DropDownAsync from '../../forms/form-fields/drop-down-async';
import TextField from '../../forms/form-fields/text-field';
import OrgUnitScopeDropDown from './tracked-entity-attribute/OrgUnitScopeDropDown';
import ConfidentialField from './tracked-entity-attribute/ConfidentialField';
import withSkipLogic from './helpers/withSkipLogic';


const TrackedEntityField = withD2Context((props, { d2 }) => (
    <SubFieldWrap>
        <DropDownAsync
            labelText={d2.i18n.getTranslation('tracked_entity')}
            referenceType="trackedEntity"
            value={props.model.trackedEntity}
            onChange={compose(value => actions.update({ fieldName: 'trackedEntity', value }), get('target.value'))}
        />
    </SubFieldWrap>
));

const Pattern = props => (
    <TextField
        labelText="pattern"
        value={props.model.pattern}
        hintText="########"
        {...props}
    />
);
Pattern.propTypes = { model: PropTypes.object.isRequired };

export default new Map([
    ['confidential', {
        component: ConfidentialField,
    }],
    ['valueType', {
        component: withSkipLogic(props => props.value === 'TRACKER_ASSOCIATE', TrackedEntityField, DropDown),
    }],
    ['orgunitScope', {
        component: OrgUnitScopeDropDown,
    }],
    ['pattern', {
        component: Pattern,
    }],
]);
