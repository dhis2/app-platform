import React, { PropTypes } from 'react';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import IconButton from 'material-ui/IconButton/IconButton';
import BuildIcon from 'material-ui/svg-icons/action/build';
import Dialog from 'material-ui/Dialog/Dialog';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import Column from 'd2-ui/lib/layout/Column.component';
import Row from 'd2-ui/lib/layout/Row.component';
import SelectField from 'material-ui/SelectField/SelectField';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import { map, memoize } from 'lodash/fp';
import Translate from 'd2-ui/lib/i18n/Translate.component';

const enhance = compose(
    getContext({ d2: PropTypes.object }),
    withState('open', 'updateOpen', false),
    withHandlers({
        onRequestClose: props => () => {
            props.updateOpen(false);
        },
        onRequestOpen: props => () => {
            props.updateOpen(true);
        },
    })
);

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
    }
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
        .sort((left, right) => ((left.dataElement && left.dataElement.displayName || '').localeCompare(right.dataElement && right.dataElement.displayName)))
        .map((dataSetElement) => {
            const { categoryCombo = {}, dataElement = {} } = dataSetElement;
            const categoryCombosForSelect = getCategoryCombosForSelect(dataElement.categoryCombo.id);

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
                            onChange={categoryCombo => onCategoryComboSelected(dataSetElement, categoryCombo)}
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

DataSetElementList.contextTypes = {
    d2: PropTypes.object,
};

export function DataSetElementCategoryComboSelection(props) {
    const {
        categoryCombos,
        dataSetElements,
        onCategoryComboSelected,
        d2: { i18n },
    } = props;

    const actions = [
        <FlatButton
            label={i18n.getTranslation('close')}
            primary
            onTouchTap={props.onRequestClose}
        />,
    ];

    return (
        <div>
            <IconButton
                onClick={props.onRequestOpen}
                tooltip={i18n.getTranslation('Override_the_data_element_category_combination')}
                tooltipPosition="top-left"
            >
                <BuildIcon />
            </IconButton>
            <Dialog
                title={i18n.getTranslation('Override_the_data_element_category_combination')}
                open={props.open}
                onRequestClose={props.onRequestClose}
                actions={actions}
                modal
                autoScrollBodyContent
            >
                <DataSetElementList
                    dataSetElements={Array.from(dataSetElements || [])}
                    categoryCombos={categoryCombos}
                    onCategoryComboSelected={onCategoryComboSelected}
                />
            </Dialog>
        </div>
    );
}

export default enhance(DataSetElementCategoryComboSelection);
