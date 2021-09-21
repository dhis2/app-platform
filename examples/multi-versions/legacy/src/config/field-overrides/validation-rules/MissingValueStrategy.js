import React, { PropTypes } from 'react';
import SelectField from 'material-ui/SelectField/SelectField';
import MenuItem from 'material-ui/MenuItem/MenuItem';

function MissingValueStrategy({ value, onChange }, { d2 }) {
    return (
        <div>
            <SelectField
                value={value}
                floatingLabelText={d2.i18n.getTranslation('missing_value_strategy')}
                onChange={(event, index, value) => onChange(value)}
                fullWidth
            >
                <MenuItem primaryText={d2.i18n.getTranslation('skip_if_any_value_is_missing')} value="SKIP_IF_ANY_VALUE_MISSING" />
                <MenuItem primaryText={d2.i18n.getTranslation('skip_if_all_values_are_missing')} value="SKIP_IF_ALL_VALUES_MISSING" />
                <MenuItem primaryText={d2.i18n.getTranslation('never_skip')} value="NEVER_SKIP" />
            </SelectField>
        </div>
    );
}
MissingValueStrategy.contextTypes = {
    d2: PropTypes.object,
};

export default MissingValueStrategy;
