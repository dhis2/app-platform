import React, { Component } from 'react';

import FlatButton from 'material-ui/FlatButton';

const styles = {
    operatorButton: {
        marginRight: 8,
        marginTop: 8,
        minWidth: 50,
    },
    operatorButtonSeparator: {
        display: 'inline-block',
        marginTop: 8,
        marginLeft: 8,
        whiteSpace: 'nowrap',
    },
};

class OperatorButtons extends Component {
    operatorButton(label, value) {
        return (
            <FlatButton
                label={label}
                onClick={() => this.props.onClick(value || label)}
                style={styles.operatorButton}
            />);
    }

    render() {
        return (
            <div style={{ marginLeft: -6 }}>
                <div style={styles.operatorButtonSeparator}>
                    {this.operatorButton(' + ')}
                    {this.operatorButton(' - ')}
                    {this.operatorButton(' * ')}
                    {this.operatorButton(' / ')}
                    {this.operatorButton(' % ')}
                </div>
                <div style={styles.operatorButtonSeparator}>
                    {this.operatorButton(' > ')}
                    {this.operatorButton(' >= ')}
                    {this.operatorButton(' < ')}
                    {this.operatorButton(' <= ')}
                    {this.operatorButton(' == ')}
                    {this.operatorButton(' != ')}
                </div>
                <div style={styles.operatorButtonSeparator}>
                    {this.operatorButton('NOT', ' ! ')}
                    {this.operatorButton('AND', ' && ')}
                    {this.operatorButton('OR', ' || ')}
                </div>
            </div>);
    }
}

OperatorButtons.propTypes = {
    onClick: React.PropTypes.func.isRequired,
};

export default OperatorButtons;
