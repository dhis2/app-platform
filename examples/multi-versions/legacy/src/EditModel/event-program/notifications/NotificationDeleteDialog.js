import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

// Move to d2-ui
const DeleteDialog = ({ onCancel, onConfirm, question, open, t }) => {
    const actions = [
        <FlatButton
            label={t('cancel')}
            primary
            onTouchTap={onCancel}
        />,
        <FlatButton
            label={t('delete')}
            primary
            onTouchTap={onConfirm}
        />,
    ];

    return (
        <Dialog
            actions={actions}
            modal={false}
            open={open}
            onRequestClose={onCancel}
            autoScrollBodyContent
        >
            {question}
        </Dialog>
    );
}

DeleteDialog.propTypes = {
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    question: PropTypes.string,
    t: PropTypes.func,
};

const enhance = compose(
    getContext({ d2: PropTypes.object }),
    mapProps(({ d2, name, ...props }) => ({
        t: d2.i18n.getTranslation.bind(d2.i18n),
        question: `${d2.i18n.getTranslation('delete')} ${name}?`,
        ...props,
    }))
);

export default enhance(DeleteDialog);
