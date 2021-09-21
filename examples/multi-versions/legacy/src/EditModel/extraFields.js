import React from 'react';
import Dialog from 'material-ui/Dialog/Dialog';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';

import IndicatorExpressionManagerContainer from './IndicatorExpressionManagerContainer.component';
import modelToEditStore from './modelToEditStore';
import DataIndicatorGroupsAssignment from './DataIndicatorGroupsAssignment.component';
import DataElementGroupsAssignment from './data-element/DataElementGroupsAssignment.component';

const styles = {
    saveButton: {
        marginRight: '1rem',
    },
    customContentStyle: {
        width: '95%',
        maxWidth: 'none',
    },
};

class IndicatorExtraFields extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.state = {
            dialogValid: true,
            dialogOpen: false,
        };

        this.setNumerator = this.setNumerator.bind(this);
        this.setDenominator = this.setDenominator.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.saveToModelAndCloseDialog = this.saveToModelAndCloseDialog.bind(this);
        this.indicatorExpressionChanged = this.indicatorExpressionChanged.bind(this);
    }

    setNumerator() {
        this.setState({ type: 'numerator', dialogOpen: true });
    }

    setDenominator() {
        this.setState({ type: 'denominator', dialogOpen: true });
    }

    closeDialog() {
        this.setState({ dialogOpen: false });
    }

    saveToModelAndCloseDialog() {
        if (this.state.expressionStatus.isValid) {
            this.props.modelToEdit[this.state.type] = this.state.expressionFormula;
            this.props.modelToEdit[`${this.state.type}Description`] = this.state.expressionDescription;

            modelToEditStore.setState(this.props.modelToEdit);
        }

        this.setState({ dialogOpen: false });
    }

    indicatorExpressionChanged(data) {
        const expressionValues = {};

        if (data.expressionStatus.isValid) {
            expressionValues.expressionStatus = data.expressionStatus;
            expressionValues.expressionDescription = data.description;
            expressionValues.expressionFormula = data.formula;
        }

        this.setState({
            dialogValid: data.expressionStatus.isValid && Boolean(data.description.trim()),
            ...expressionValues,
        });
    }

    renderExpressionManager() {
        return (
            <IndicatorExpressionManagerContainer
                indicatorExpressionChanged={this.indicatorExpressionChanged}
                formula={this.props.modelToEdit[this.state.type] || ''}
                description={this.props.modelToEdit[`${this.state.type}Description`] || ''}
                ref="expressionManagerContainer"
            />
        );
    }

    render() {
        const d2 = this.context.d2;

        const dialogActions = [
            // TODO: This button should "commit" the change to the model where a cancel button will discard any changes made
            <FlatButton label={d2.i18n.getTranslation('cancel')} onTouchTap={this.closeDialog} />,
            <FlatButton label={d2.i18n.getTranslation('done')} onTouchTap={this.saveToModelAndCloseDialog} disabled={!this.state.dialogValid} />,
        ];

        return (
            <div>
                <div style={{ marginTop: '2rem' }}>
                    <RaisedButton label={d2.i18n.getTranslation('edit_numerator')} onClick={this.setNumerator} style={{ marginRight: '2rem' }} />
                    <RaisedButton label={d2.i18n.getTranslation('edit_denominator')} onClick={this.setDenominator} />
                    <Dialog
                        title={d2.i18n.getTranslation(`edit_${this.state.type}`)}
                        open={this.state.dialogOpen}
                        modal
                        actions={dialogActions}
                        contentStyle={styles.customContentStyle}
                        autoScrollBodyContent
                        repositionOnUpdate={false}
                    >
                        {this.state ? this.renderExpressionManager() : null}
                    </Dialog>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <DataIndicatorGroupsAssignment source={this.props.modelToEdit} />
                </div>
            </div>
        );
    }
}

IndicatorExtraFields.propTypes = {
    modelToEdit: React.PropTypes.object.isRequired,
};

export default {
    dataElement: [
        {
            name: 'dataElementGroupAssignment',
            component: props => (
                <div style={{ marginTop: '2rem' }}>
                    <DataElementGroupsAssignment source={props.modelToEdit} />
                </div>
            ),
        },
    ],
    indicator: [
        {
            name: 'indicatorGroupAssignmentAndGroupAssignments',
            component: addD2Context(IndicatorExtraFields),
        },
    ],
};
