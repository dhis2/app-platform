import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from 'classnames';
import FlatButton from 'material-ui/FlatButton/FlatButton';

const styles = {
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    button: {
        minWidth: 50,
        marginRight: '15px',
        padding: '0 5px',
    },
};

const functionsForExpressionType = {
    indicator: [' .periodOffset( ']
}

class ExpressionFunctions extends Component {
    createFunctionClick(operatorValue) {
        return function functionButtonClicked() {
            this.props.onFunctionClick(operatorValue);
        }.bind(this);
    }

    renderButton(value, label) {
        return (
            <FlatButton
                key={value} 
                style={styles.button}
                onClick={this.createFunctionClick(value)}
            >
                {label || value}
            </FlatButton>
        );
    }

    render() {
        const expressionType = this.props.expressionType
        const classList = classes('expression-functions');
        const extraFunctionsForType = expressionType ? functionsForExpressionType[expressionType] : []

        return (
            <div className={classList} style={styles.wrapper}>
                {this.renderButton(' if( ')}
                {this.renderButton(' isNull( ')}
                {this.renderButton(' isNotNull( ')}
                {this.renderButton(' firstNonNull( ')}
                {this.renderButton(' greatest( ')}
                {this.renderButton(' least( ')}
                {this.renderButton(' log( ')}
                {this.renderButton(' log10( ')}
                {extraFunctionsForType.map(funcName => this.renderButton(funcName))}
            </div>
        );
    }
}

ExpressionFunctions.propTypes = {
    onFunctionClick: PropTypes.func.isRequired,
};

export default ExpressionFunctions;
