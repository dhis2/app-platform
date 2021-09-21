import React from 'react';
import MultiSelect from '../../forms/form-fields/multi-select';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';

const styles = {
    label: {
        position: 'relative',
        display: 'block',
        width: 'calc(100% - 60px)',
        lineHeight: '24px',
        color: 'rgba(0, 0, 0, 0.5)',
        marginTop: '31px',
        fontSize: '16px',
        fontWeight: 500,
        backgroundColor: 'white',
    },
    text: {
        color: 'rgba(0, 0, 0, 0.54)',
        padding: '0 0 15px 8px',
    },
};

let MultiSelectWithOptionSetFilter = (props, context) => {
    const selectedOptionSet = props.model.optionSet;
    const t = context.d2.i18n.getTranslation.bind(context.d2.i18n);

    const selecedOptionSetId = selectedOptionSet ? selectedOptionSet.id : null;
    const selectedOptionSetFilter =
        selecedOptionSetId && `optionSet.id:eq:${selecedOptionSetId}`;
    return (
        <div>
            {selectedOptionSet ? (
                <MultiSelect
                    {...props}
                    queryParamFilter={selectedOptionSetFilter}
                    disabled={true}
                />
            ) : (
                <div>
                    <div style={styles.label}>{props.labelText}</div>
                    <p style={styles.text}>{t('please_select_option_set')}</p>
                </div>
            )}
        </div>
    );
};

MultiSelectWithOptionSetFilter = addD2Context(MultiSelectWithOptionSetFilter);

export { MultiSelectWithOptionSetFilter };
export default new Map([
    [
        'options',
        {
            component: MultiSelectWithOptionSetFilter,
        },
    ],
]);
