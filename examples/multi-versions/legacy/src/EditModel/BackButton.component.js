import React from 'react';
import IconButton from 'material-ui/IconButton/IconButton';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import modelToEditStore from '../EditModel/modelToEditStore';

function BackButton(props, context) {
    const { tooltip, onClick, isDirtyHandler = modelToEditStore.getState.bind(modelToEditStore), ...otherProps } = props;
    const onClickWithConfirm = (...params) => {
        const isDirty = isDirtyHandler && isDirtyHandler() && isDirtyHandler().dirty;

        if (!isDirty) {
            onClick(...params);
        } else if (
            // eslint-disable-next-line no-restricted-globals
            confirm(context.d2.i18n.getTranslation('abandon_unsaved_changes'))
        ) {
            onClick(...params);
        }
    };

    return (
        <IconButton
            tooltip={tooltip || context.d2.i18n.getTranslation('back')}
            tooltipPosition="bottom-right"
            onClick={onClickWithConfirm}
            {...otherProps}
            iconClassName="material-icons"
        >
            &#xE5C4;
        </IconButton>
    );
}
BackButton.propTypes = {
    tooltip: React.PropTypes.string,
};

export default addD2Context(BackButton);
