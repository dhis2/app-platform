import React from 'react';
import PropTypes from 'prop-types';
import { withState, withProps, compose, onlyUpdateForKeys } from 'recompose';

import RaisedButton from 'material-ui/RaisedButton';
import Row from 'd2-ui/lib/layout/Row.component';
import Translate from 'd2-ui/lib/i18n/Translate.component';

import ValidationRuleExpressionDialog from './ValidationRuleExpressionDialog';

const styles = {
    field: {
        padding: '1rem 0',
    },
    expressionButton: {
        flex: '0 0 10rem',
    },
    expressionDescription: {
        padding: '.75rem 1rem',
        color: '#666',
    },
};

function ValidationRuleExpressionField({ value, onButtonClick, open, close, onChange, buttonLabel }) {
    const onSave = (newValue) => {
        onChange({ target: { value: newValue } });
        close();
    };

    return (
        <div style={styles.field}>
            <Row>
                <RaisedButton style={styles.expressionButton} onClick={onButtonClick}>
                    <Translate>{buttonLabel}</Translate>
                </RaisedButton>
                <div style={styles.expressionDescription}>
                    {value.description}
                </div>
            </Row>
            <ValidationRuleExpressionDialog
                open={open}
                close={close}
                save={onSave}
                value={value}
                buttonLabel={buttonLabel}
            />
        </div>
    );
}

const enhance = compose(
    onlyUpdateForKeys(['value']),
    withState('open', 'toggleOpen', false),
    withProps(({ toggleOpen }) => ({
        onButtonClick: () => toggleOpen(true),
        close: () => toggleOpen(false),
    })),
);

ValidationRuleExpressionField.propTypes = {
    value: PropTypes.object,
    onButtonClick: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    open: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    buttonLabel: PropTypes.string,
};
ValidationRuleExpressionField.defaultProps = {
    value: {},
    open: false,
    buttonLabel: '',
};

export default enhance(ValidationRuleExpressionField);
