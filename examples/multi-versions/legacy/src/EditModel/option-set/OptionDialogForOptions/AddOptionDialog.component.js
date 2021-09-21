import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dialog from 'material-ui/Dialog/Dialog';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import Heading from 'd2-ui/lib/headings/Heading.component';

import FormButtons from '../../FormButtons.component';
import SaveButton from '../../SaveButton.component';
import CancelButton from '../../CancelButton.component';

import actions from '../actions';
import snackActions from '../../../Snackbar/snack.actions';
import getFirstInvalidFieldMessage from '../../form-helpers/validateFields';

class AddOptionDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFormValid: true,
            isSaving: false,
            changedOriginalFieldValues: {}
        };

    }

    componentWillReceiveProps(newProps) {
        //reset field values when model changes
        //this is needed due to the dialog not being unmounted between option changes,
        //and to keep the orignal-values in sync with the model
        if(newProps.model.id !== this.props.model.id) {
            this.setState({
                changedOriginalFieldValues: {},
            })
        }
    }

    onUpdateField = (field, value) => {
        if (!this.state.changedOriginalFieldValues.hasOwnProperty(field)) {
            //store the original value so we can change it back if user cancels.
            this.setState({changedOriginalFieldValues: {...this.state.changedOriginalFieldValues, [field]: this.props.model[field]}});
        }
        actions.updateModel(this.props.model, field, value);
    }

    onSaveSuccess = () => {
        this.showSuccessMessage();
        this.setState({ isSaving: false });
        this.props.onRequestClose();
        // After the save was successful we request the options from the server to get the updated list
        actions.getOptionsFor(this.props.parentModel);
    }

    onSaveError = ({ message, translate }) => {
        this.showErrorMessage(message, translate);
        this.setState({ isSaving: false });
    }

    onSaveOption = () => {
        const invalidFieldMessage = getFirstInvalidFieldMessage(this.props.fieldConfigs, this.formRef);
        if (invalidFieldMessage) {
            this.showFirstValidationErrorMessage(invalidFieldMessage);
        } else {
            this.setState({ isSaving: true });

            actions
                .saveOption(this.props.model, this.props.parentModel)
                .subscribe(this.onSaveSuccess, this.onSaveError);
        }
    }

    handleCancel = () => {
        const { changedOriginalFieldValues } = this.state;

        //revert changed values before closing
        Object.keys(changedOriginalFieldValues).forEach((key) => {
            actions.updateModel(this.props.model, key, changedOriginalFieldValues[key]);
        })

        this.props.onRequestClose();
    }

    setFormRef = (form) => {
        this.formRef = form;
    }

    showFirstValidationErrorMessage = (invalidFieldMessage) => {
        snackActions.show({
            message: invalidFieldMessage,
            action: 'ok',
        });
    }

    showSuccessMessage = () => {
        snackActions.show({
            message: 'option_saved',
            translate: true,
        });
    }

    showErrorMessage = (message, translate) => {
        snackActions.show({
            message,
            action: 'ok',
            translate,
        });
    }

    translate = message => this.context.d2.i18n.getTranslation(message);

    render() {
        return (
            <Dialog
                open={this.props.isDialogOpen}
                modal
                onRequestClose={this.props.onRequestClose}
                autoScrollBodyContent
            >
                <Heading>{this.props.title}</Heading>
                <FormBuilder
                    fields={this.props.fieldConfigs}
                    onUpdateField={this.onUpdateField}
                    ref={this.setFormRef}
                />
                <FormButtons>
                    <SaveButton
                        isValid={this.state.isFormValid}
                        onClick={this.onSaveOption}
                        isSaving={this.state.isSaving}
                    />
                    <CancelButton onClick={this.handleCancel} />
                </FormButtons>
            </Dialog>
        );
    }
}

AddOptionDialog.propTypes = {
    fieldConfigs: PropTypes.array,
    title: PropTypes.string,
    isDialogOpen: PropTypes.bool,
    model: PropTypes.object,
    onRequestClose: PropTypes.func.isRequired,
    parentModel: PropTypes.object,
};

AddOptionDialog.defaultProps = {
    parentModel: {},
    model: {},
    fieldConfigs: [],
    isDialogOpen: false,
    title: '',
};

AddOptionDialog.contextTypes = { d2: React.PropTypes.object };

export default AddOptionDialog;
