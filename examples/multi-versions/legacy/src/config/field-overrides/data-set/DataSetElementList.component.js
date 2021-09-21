import React from 'react';
import PropTypes from 'prop-types';

import Column from 'd2-ui/lib/layout/Column.component';
import Row from 'd2-ui/lib/layout/Row.component';
import Translate from 'd2-ui/lib/i18n/Translate.component';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import SelectField from 'material-ui/SelectField/SelectField';
import { map, memoize } from 'lodash/fp';
import withHandlers from 'recompose/withHandlers';

const getOptions = memoize(categoryCombos => map(({ displayName, id }) => (
    <MenuItem key={id} primaryText={displayName} value={id} />
), categoryCombos));

const enhanceCategoryComboSelectField = withHandlers({
    onChange: ({ categoryCombos = new Map(), onChange }) => (event, index, value) => {
        onChange(categoryCombos.find(categoryCombo => categoryCombo.id === value));
    },
});

const CategoryComboSelectField = enhanceCategoryComboSelectField(
    ({ categoryCombos, value, onChange }) => {
        const options = getOptions(categoryCombos);

        return (
            <SelectField
                value={value}
                onChange={onChange}
                fullWidth
                floatingLabelText={<Translate>override_data_element_category_combo</Translate>}
            >
                {options}
            </SelectField>
        );
    },
);

const createGetCategoryCombosForSelect = (d2, categoryCombos) => memoize(dataElementCategoryComboId => categoryCombos
    .reduce((acc, categoryCombo) => {
        if (categoryCombo.id === dataElementCategoryComboId) {
            acc.unshift({
                ...categoryCombo,
                displayName: d2.i18n.getTranslation('no_override'),
            });
            return acc;
        }

        acc.push(categoryCombo);
        return acc;
    }, []));
function DataSetElementList({ dataSetElements, categoryCombos, onCategoryComboSelected }, { d2 }) {
    const styles = {
        elementListItem: {
            width: '49%',
        },

        noDataElementMessage: {
            paddingTop: '2rem',
        },

        originalCategoryCombo: {
            color: '#CCC',
            fontSize: '1rem',
            fontWeight: '300',
        },
    };

    const getCategoryCombosForSelect = createGetCategoryCombosForSelect(d2, categoryCombos);


    const dataSetElementsRows = dataSetElements
        .sort((left, right) => ((left.dataElement ? left.dataElement.displayName : '')
            .localeCompare(right.dataElement && right.dataElement.displayName)))
        .map((dataSetElement) => {
            const { categoryCombo = {}, dataElement = {} } = dataSetElement;
            const categoryCombosForSelect = getCategoryCombosForSelect(dataElement.categoryCombo.id);
            const onChange = catCombo => onCategoryComboSelected(dataSetElement, catCombo);

            return (
                <Row key={dataSetElement.dataElement.id} style={{ alignItems: 'center' }}>
                    <div style={styles.elementListItem}>
                        <div>{dataElement.displayName}</div>
                        <div style={styles.originalCategoryCombo}>{dataElement.categoryCombo.displayName}</div>
                    </div>
                    <div style={styles.elementListItem}>
                        <CategoryComboSelectField
                            categoryCombos={categoryCombosForSelect}
                            value={categoryCombo.id}
                            onChange={onChange}
                        />
                    </div>
                </Row>
            );
        });

    if (dataSetElementsRows.length === 0) {
        return (
            <div style={styles.noDataElementMessage}>
                {d2.i18n.getTranslation('select_a_data_element_before_applying_an_override')}
            </div>
        );
    }

    return (
        <Column>
            {dataSetElementsRows}
        </Column>
    );
}

DataSetElementList.propTypes = {
    dataSetElements: PropTypes.array.isRequired,
    categoryCombos: PropTypes.array.isRequired,
    onCategoryComboSelected: PropTypes.array.isRequired,
};

DataSetElementList.contextTypes = {
    d2: PropTypes.object,
};
