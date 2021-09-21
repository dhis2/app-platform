import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import getContext from 'recompose/getContext';
import withState from 'recompose/withState';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';

const relativeScheduledDaysStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
};

const enhance = compose(
    getContext({ d2: PropTypes.object }),
    withState('beforeOrAfter', 'setBeforeOrAfter', ({ value }) => (value >= 0 ? 'after' : 'before')),
    withHandlers({
        onChangeBeforeAfter: ({ onChange, setBeforeOrAfter, value }) => (event, index, beforeOrAfter) => {
            const days = beforeOrAfter === 'after' ? Number(value) : -1 * Number(value);
            setBeforeOrAfter(beforeOrAfter);
            onChange({ target: { value: days } });
        },
        onChangeDays: ({ onChange, beforeOrAfter }) => (event, value) => {
            const days = beforeOrAfter === 'after' ? Number(value) : -1 * Number(value);
            if (!Number.isNaN(days)) {
                onChange({ target: { value: days } });
            }
        },
    }),
);

function RelativeScheduledDays({ onChangeBeforeAfter, beforeOrAfter, onChangeDays, d2, value, style }) {
    const t = d2.i18n.getTranslation.bind(d2.i18n);

    /* Because of bad alignment of material ui textfield and selectfield, the compoents becomes skewed when
       using the hide method EditModelForm.component (setting the display to none/block). The component
       must instead chose to return on display:'none'
    */
    if (style && (style.display === 'none')) {
        return null;
    }

    return (
        <div style={relativeScheduledDaysStyle}>
            <span>{t('send_notification')}</span>
            <TextField
                hintText={t('number_of_days')}
                value={Math.abs(value || 0)}
                onChange={onChangeDays}
            />
            <span>{ t('days') }</span>
            <SelectField value={beforeOrAfter} onChange={onChangeBeforeAfter}>
                <MenuItem value="before" primaryText={t('before')} />
                <MenuItem value="after" primaryText={t('after')} />
            </SelectField>
            <span>{t('scheduled_date')}</span>
        </div>
    );
}

RelativeScheduledDays.propTypes = {
    onChangeBeforeAfter: PropTypes.func.isRequired,
    beforeOrAfter: PropTypes.any.isRequired,
    onChangeDays: PropTypes.func.isRequired,
    d2: PropTypes.object.isRequired,
    value: PropTypes.number,
    style: PropTypes.object,
};

RelativeScheduledDays.defaultProps = {
    value: 0,
    style: {},
};


export default enhance(RelativeScheduledDays);
