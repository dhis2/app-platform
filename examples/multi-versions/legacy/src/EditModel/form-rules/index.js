import noop from 'd2-utilizr/lib/noop';
import { negate } from 'lodash/fp';
import isArray from 'd2-utilizr/lib/isArray';

import fieldRules from '../../config/field-rules';
import systemSettingsStore from '../../App/systemSettingsStore';

/* eslint-disable no-use-before-define */
const whenOperatorMap = new Map([
    ['EQUALS', equalsOperator],
    ['NOT_EQUALS', notEqualsOperator],
    ['HAS_VALUE', hasValueOperator],
    ['HAS_NO_VALUE', negate(hasValueOperator)],
    ['HAS_STRING_VALUE', hasStringValueOperator],
    ['ONEOF', oneOfOperator],
    ['NONEOF', noneOfOperator],
    ['SYSTEM_SETTING_IS_TRUE', systemSettingIsTrueOperator],
    ['SYSTEM_SETTING_IS_FALSE', systemSettingIsFalseOperator],
    ['IS_VALID_POINT', isPointOperator],
    ['IS_HIDDEN_FIELD', isHiddenFieldOperator],
    ['PREDICATE', predicateOperator]
]);

const operationsMap = new Map([
    ['SET_PROP', setProp],
    ['CHANGE_VALUE', changeValue],
    ['HIDE_FIELD', hideField],
    ['SHOW_FIELD', showField],
]);
/* eslint-enable no-use-before-define */

export function getRulesForModelType(fieldName) {
    if (fieldRules.has(fieldName)) {
        return fieldRules.get(fieldName);
    }

    return [];
}

function changeValue(fieldConfig, operationParams, ruleResult, model) {
    if (ruleResult) {
        operationParams.setValue(model, fieldConfig);
    }
}

function setProp(fieldConfig, operationParams, ruleResult) {
    if (!fieldConfig) {
        return;
    }
    if (ruleResult) {
        return fieldConfig.props[operationParams.propName] = operationParams.thenValue;
    }

    return fieldConfig.props[operationParams.propName] = operationParams.elseValue;
}


/*
    Uses the swapping variable "hiddenComponent" when temporary hiding a field.
    When the field should be shown again, the content of "hiddenComponent" is
    put back to the "component" variable.
*/
function hideField(fieldConfig, operationParams, ruleResult) {
    if (ruleResult && fieldConfig) {
        fieldConfig.hiddenComponent = fieldConfig.hiddenComponent || fieldConfig.component;
        fieldConfig.component = () => null;
    } else if (fieldConfig && fieldConfig.hiddenComponent) {
        fieldConfig.component = fieldConfig.hiddenComponent;
        delete fieldConfig.hiddenComponent;
    }
}

function showField(fieldConfig, operationParams, ruleResult) {
    if (ruleResult && fieldConfig.hiddenComponent) {
        fieldConfig.component = fieldConfig.hiddenComponent;
        delete fieldConfig.hiddenComponent;
    } else {
        fieldConfig.hiddenComponent = fieldConfig.hiddenComponent || fieldConfig.component;
        fieldConfig.component = () => null;
    }
}

function getOperation(operationType) {
    return operationsMap.has(operationType) ? operationsMap.get(operationType) : noop;
}

function getWhenOperator(operatorType) {
    return whenOperatorMap.has(operatorType) ? whenOperatorMap.get(operatorType) : noop;
}

function hasValueOperator(value) {
    return value !== undefined && value !== null;
}

function hasStringValueOperator(value) {
    return hasValueOperator(value) && value.toString().trim().length > 0;
}

function equalsOperator(left, right) {
    return left === right;
}

function notEqualsOperator(left, right) {
    return left !== right;
}

function oneOfOperator(value, list) {
    return list.indexOf(value) >= 0;
}

function noneOfOperator(value, list) {
    return list.indexOf(value) < 0;
}

function predicateOperator(value, predicate) {
    return predicate(value)
}

function isPointOperator(value) {
    // TODO: Use the same validator as the one in the coordinate-field (perhaps move it to d2/d2-ui)
    try {
        const poly = JSON.parse(value);
        return Array.isArray(poly) && (poly.length === 0 || (poly.length === 2 && !isNaN(poly[0]) && !isNaN(poly[1])));
    } catch (e) {
        return false;
    }
}

function isHiddenFieldOperator(a, b, fieldConfig) {
    return fieldConfig.hasOwnProperty('hiddenComponent');
}

function systemSettingIsTrueOperator(value, settingKey) {
    const settingsValue = systemSettingsStore.getState() ? systemSettingsStore.getState()[settingKey] : undefined;
    return settingsValue === true;
}

function systemSettingIsFalseOperator(value, settingKey) {
    const settingsValue = systemSettingsStore.getState() ? systemSettingsStore.getState()[settingKey] : undefined;
    return settingsValue === false;
}

function ruleRunner({ whenFieldName, operatorFn, whenValue }, fieldConfig, model) {
    return operatorFn(model[whenFieldName], whenValue, fieldConfig, model, whenFieldName);
}


function rulesRunner(rules, rule, modelToEdit, fieldConfigs) {
    return rules.map((whenRule, index) => {
        // log.debug(`For field ${rule.field} run the when-rule where field ` +
        //     ` ${whenRule.field || rule.field} ${getWhenOperator(whenRule.operator).name}` +
        //     ` ${whenRule.value || ''} ${rule.field} ${rules.length > (index + 1) && 'then run'}`);

        const fieldConfigForRule = fieldConfigs.find(fieldConfig =>
            fieldConfig.name === (whenRule.field || rule.field));

        const whenFieldName = whenRule.field ? whenRule.field : rule.field;
        const operatorFn = getWhenOperator(whenRule.operator);
        const whenValue = whenRule.value;

        return ruleRunner({ whenFieldName, operatorFn, whenValue }, fieldConfigForRule, modelToEdit);
    });
}

export function applyRulesToFieldConfigs(rules, fieldConfigs, modelToEdit) {
    rules.forEach((rule) => {
        const rules = isArray(rule.when) ? rule.when : [rule.when];
        const rulePassed = rulesRunner(rules, rule, modelToEdit, fieldConfigs).some(result => result === true);

        // log.debug('And the result is', rulePassed);

        (rule.operations || [rule.operation])
            .forEach((operation) => {
                const fieldConfigForOperation = fieldConfigs.find(fieldConfig =>
                    fieldConfig.name === (operation.field || rule.field));

                const {
                    field,
                    type,
                    ...operationParams
                } = operation;

                // log.debug(`---- For field ${field || rule.field} 
                //         execute ${getOperation(type).name} 
                //         with`, operationParams);

                getOperation(type)(fieldConfigForOperation, operationParams, rulePassed, modelToEdit);
            });
    });

    return fieldConfigs;
}
