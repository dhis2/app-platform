import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getDialogType, getDialogProps, getDialogIsOpen } from './selectors';
import { closeDialog } from './actions';
import * as DIALOGTYPES from './types';
import DownloadObjectDialog from '../List/DownloadObjectDialog';
import ColumnConfigDialog from '../List/columns/ColumnConfigDialog';

const DialogComponents = {
    [DIALOGTYPES.DOWNLOAD_OBJECT]: DownloadObjectDialog,
    [DIALOGTYPES.COLUMN_CONFIG]: ColumnConfigDialog,
};

export class DialogRouter extends Component {
    state = {
        openDialog: null,
    };

    render() {
        const { open, dialogType, dialogProps, ...rest } = this.props;
        if (!open) {
            return null;
        }
        const DialogType = DialogComponents[dialogType];
        return DialogType ? (
            <DialogType {...{ ...rest, ...dialogProps }} open={true} />
        ) : null;
    }
}

const mapStateToProps = state => ({
    dialogType: getDialogType(state),
    open: getDialogIsOpen(state),
    dialogProps: getDialogProps(state),
});

const mapDispatchToProps = {
    defaultCloseDialog: closeDialog,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DialogRouter);
