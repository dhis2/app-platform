import React from 'react';
import PropTypes from 'prop-types';
import { negate } from 'lodash/fp';

import ExpressionFormula from 'd2-ui/lib/expression-manager/ExpressionFormula';
import { ExpressionStatus, getColorForExpressionStatus } from './ExpressionStatusIcon';


function ExpressionFormulaWithErrorMessage({ formula, onFormulaChange, errorStatus }) {
    const isExpressionInvalid = negate(expressionStatus => expressionStatus.status === ExpressionStatus.VALID);
    const color = getColorForExpressionStatus(errorStatus.status);

    const formulaWrapStyle = {
        border: `2px solid ${isExpressionInvalid(errorStatus)
            ? color
            : 'transparent'}`,
    };

    const formulaDescriptionField = isExpressionInvalid(errorStatus) &&
        <span style={{ color, marginTop: '.25rem' }}>
            {errorStatus.message}
        </span>;

    return (
        <div>
            <div style={formulaWrapStyle}>
                <ExpressionFormula
                    formula={formula}
                    onFormulaChange={onFormulaChange}
                />
            </div>
            {formulaDescriptionField}
        </div>
    );
}

ExpressionFormulaWithErrorMessage.propTypes = {
    formula: PropTypes.string.isRequired,
    onFormulaChange: PropTypes.func.isRequired,
    errorStatus: PropTypes.object.isRequired,
};

export default ExpressionFormulaWithErrorMessage;
