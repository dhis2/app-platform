import React from 'react';
import { addValueRenderer } from 'd2-ui/lib/data-table/data-value/valueRenderers';
import branch from 'recompose/branch';
import CheckIcon from 'material-ui/svg-icons/navigation/check';
import RemoveIcon from 'material-ui/svg-icons/content/remove';
import renderComponent from 'recompose/renderComponent';
import renderNothing from 'recompose/renderNothing';
import mapProps from 'recompose/mapProps';
import { isString } from 'lodash/fp';
import Translate from 'd2-ui/lib/i18n/Translate.component';

const removeProps = mapProps(() => ({}));
const renderNothingWhenValueIsNotAString = branch(
    ({ value }) => !isString(value),
    renderNothing
);

const BooleanCellField = branch(
    ({ value }) => value === true,
    renderComponent(removeProps(CheckIcon))
)(removeProps(RemoveIcon));

// For boolean valueTypes render a check mark icon when the value is true or a dash for when it is false.
addValueRenderer(
    ({ valueType }) => valueType === 'BOOLEAN',
    BooleanCellField,
);

// For a formType field render a translated version of the value (e.g "SECTION -> Sectie" for the nlNL locale)
addValueRenderer(
    ({ columnName, valueType }) => columnName === 'formType' && valueType === 'CONSTANT',
    renderNothingWhenValueIsNotAString(({ value }) => (<Translate>{value.toLowerCase()}</Translate>))
);
