import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import expressionStatusStore from './expressionStatusStore';
import ExpressionDialog from './ExpressionDialog';

class ExpressionField extends Component {
    state = {
        open: false,
        value: this.props.value,
    };

    handleOpen = () => {
        // Clear previous expression validation status
        expressionStatusStore.setState({});
        this.setState({ open: true, value: this.props.value });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleSaveAndClose = () => {
        this.setState({ open: false }, () => {
            this.props.onChange({
                target: {
                    value: this.state.value,
                },
            });
        });
    };

    indicatorExpressionChanged = ({ formula, description }) => {
        this.setState({
            value: Object.assign({}, this.state.value, { expression: formula, description }),
        });
    };

    missingValueStrategyChanged = missingValueStrategy => {
        this.setState({ value: {...this.state.value, missingValueStrategy } } )
    }

    render() {
        const props = this.props;
        const styles = {
            fieldWrap: {
                padding: '1rem 0',
            },

            errorText: {
                paddingTop: '0.5rem',
                color: 'red',
            },
        };

        // Make sure to use values from the state once the dialogue is open
        // As these values are not propagated to the props until handleSaveAndClose is called
        const expressionDialogProps = this.state.open && this.state.value ? { 
            ...props, 
            value: {
                ...this.state.value 
            }
        } : props

        return (
            <div style={styles.fieldWrap}>
                <RaisedButton
                    label={this.props.labelText}
                    onTouchTap={this.handleOpen}
                />
                {props.errorText ? <div style={styles.errorText}>{props.errorText}</div> : null}
                <ExpressionDialog
                    {...expressionDialogProps}
                    open={this.state.open}
                    handleClose={this.handleClose}
                    handleSaveAndClose={this.handleSaveAndClose}
                    indicatorExpressionChanged={this.indicatorExpressionChanged}
                    missingValueStrategyChanged={this.missingValueStrategyChanged}
                />
            </div>
        );
    }
}
ExpressionField.defaultProps = {
    indicatorExpressionChanged: () => {},
};
ExpressionField.contextTypes = {
    d2: PropTypes.object,
};

export default ExpressionField;