import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import withProps from 'recompose/withProps';
import { compose } from 'lodash/fp';

import SaveButton from './SaveButton.component';
import CancelButton from './CancelButton.component';

import { goToAndScrollUp } from '../router-utils';

const styles = {
    cancelButton: {
        marginLeft: '1rem',
    },
};

export default function FormActionButtons({ onSaveAction, onCancelAction, isDirtyHandler, isSaving }) {
    return (
        <div>
            <SaveButton onClick={onSaveAction} isSaving={isSaving} />
            <CancelButton onClick={onCancelAction} isDirtyHandler={isDirtyHandler} style={styles.cancelButton} />
        </div>
    );
}

export function createConnectedFormActionButtonsForSchema(mapDispatchToProps = null, mapStateToProps = null) {
    const onCancelActionCreator = (groupName, schema) => () => goToAndScrollUp(`/list/${groupName}/${schema}`);

    const enhance = compose(
        withProps(({ groupName, schema }) => ({
            onCancelAction: onCancelActionCreator(groupName, schema),
        })),
        connect(mapStateToProps, mapDispatchToProps),
    );

    return enhance(FormActionButtons);
}

FormActionButtons.propTypes = {
    onSaveAction: PropTypes.func.isRequired,
    onCancelAction: PropTypes.func.isRequired,
    isDirtyHandler: PropTypes.func,
    isSaving: PropTypes.bool,
};

FormActionButtons.defaultProps = {
    isDirtyHandler: () => {},
    isSaving: false,
};
