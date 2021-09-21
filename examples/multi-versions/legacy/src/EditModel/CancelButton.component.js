import React from 'react';
import Button from 'material-ui/FlatButton';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import modelToEditStore from '../EditModel/modelToEditStore';

function CancelButton(
    {
        onClick,
        isPristine,
        isDirtyHandler = modelToEditStore.getState.bind(modelToEditStore),
        ...props
    },
    context
) {
    const shouldConfirm =
        isDirtyHandler && isDirtyHandler() && isDirtyHandler().dirty;

    const onClickWithConfirm = (...params) => {
        if (!shouldConfirm) {
            onClick(...params);
        } else if (
            // eslint-disable-next-line no-restricted-globals
            confirm(context.d2.i18n.getTranslation('abandon_unsaved_changes'))
        ) {
            onClick(...params);
        }
    };

    return (
        <Button
            {...props}
            onClick={onClickWithConfirm}
            secondary={shouldConfirm}
            label={context.d2.i18n.getTranslation('cancel')}
        />
    );
}

CancelButton.propTypes = {
    onClick: React.PropTypes.func.isRequired,
    /* A handler that should return an object with "dirty"-key,
    describing if the current edited model is dirty
     */
    isDirtyHandler: React.PropTypes.func,
};

export default addD2Context(CancelButton);
