
import React from 'react';
import PropTypes from 'prop-types';
import pure from 'recompose/pure';
import { getOr, __ } from 'lodash/fp';

import { TableRow, TableRowColumn, Checkbox } from 'material-ui';
import RenderTypeSelectField, {
    MOBILE,
    DESKTOP,
} from '../../EditModel/event-program/render-types';

const flipBooleanPropertyOn = (object, key) => ({
    ...object,
    [key]: !object[key],
});

const AttributeRow = ({ attribute, onEditAttribute, isDateValue, displayName, isUnique, hasOptionSet, columns, renderTypeOptions }, { d2 }) => {
    const onChangeFlipBooleanForProperty = propertyName => () => onEditAttribute(
        flipBooleanPropertyOn(attribute, propertyName),
    );

    const isCheckedForProp = getOr(false, __, attribute);

    return (
        <TableRow>
            <TableRowColumn>{displayName}</TableRowColumn>

            {columns.includes('displayInList') &&
            <TableRowColumn>
                <Checkbox
                    checked={isCheckedForProp('displayInList')}
                    onClick={onChangeFlipBooleanForProperty('displayInList')}
                />
            </TableRowColumn>}

            {columns.includes('mandatory') &&
            <TableRowColumn>
                <Checkbox
                    checked={isCheckedForProp('mandatory')}
                    onClick={onChangeFlipBooleanForProperty('mandatory')}
                />
            </TableRowColumn>}

            {columns.includes('allowFutureDate') &&
            <TableRowColumn>
                {isDateValue && <Checkbox
                    checked={isCheckedForProp('allowFutureDate')}
                    onClick={onChangeFlipBooleanForProperty('allowFutureDate')}
                />}
            </TableRowColumn>}

            {columns.includes('searchable') &&
            <TableRowColumn>
                <Checkbox
                    checked={isUnique || isCheckedForProp('searchable')}
                    disabled={isUnique}
                    onClick={onChangeFlipBooleanForProperty('searchable')}
                    title={d2.i18n.getTranslation('unique_attributes_always_searchable')}
                />
            </TableRowColumn>}
            
            {renderTypeOptions && (
                <TableRowColumn>
                    <RenderTypeSelectField
                        device={MOBILE}
                        target={attribute}
                        options={renderTypeOptions}
                        changeHandler={onEditAttribute}
                    />
                </TableRowColumn>
            )}

            {renderTypeOptions && (
                <TableRowColumn>
                    <RenderTypeSelectField
                        device={DESKTOP}
                        target={attribute}
                        options={renderTypeOptions}
                        changeHandler={onEditAttribute}
                    />
                </TableRowColumn>
            )}
        </TableRow>);
};

AttributeRow.propTypes = {
    displayName: PropTypes.string.isRequired,
    attribute: PropTypes.object.isRequired,
    onEditAttribute: PropTypes.func.isRequired,
    isUnique: PropTypes.bool,
    isDateValue: PropTypes.bool,
    hasOptionSet: PropTypes.bool,
    columns: PropTypes.array,
};

AttributeRow.defaultProps = {
    isDateValue: false,
    isUnique: false,
    hasOptionSet: false,
    columns: ['displayInList', 'mandatory', 'allowFutureDate', 'renderOptionsAsRadio', 'searchable'],

};

AttributeRow.contextTypes = {
    d2: PropTypes.object,
};
export default pure(AttributeRow);
