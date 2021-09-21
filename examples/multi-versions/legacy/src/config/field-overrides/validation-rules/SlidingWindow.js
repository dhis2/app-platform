import React, { PropTypes } from 'react';
import CheckBox from '../../../forms/form-fields/check-box';
import { get, compose } from 'lodash/fp';

export default function SlidingWindow({ onChange, value }, { d2 }) {
    return (
        <CheckBox onChange={compose(onChange, get('target.value'))} labelText={d2.i18n.getTranslation('sliding_window')} value={value} />
    );
}
SlidingWindow.contextTypes = {
    d2: PropTypes.object,
};
