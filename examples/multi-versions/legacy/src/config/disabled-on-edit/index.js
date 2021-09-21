import category from './category';
import categoryCombo from './categoryCombo';
import categoryOptionCombo from './categoryOptionCombo';
import categoryOptionGroup from './categoryOptionGroup';
import categoryOptionGroupSet from './categoryOptionGroupSet';
import optionSet from './optionSet';
import programRule from './programRule';
import optionGroup from './optionGroup';
import optionGroupSet from './optionGroupSet';

const disabledByType = {
    category,
    categoryCombo,
    categoryOptionCombo,
    categoryOptionGroup,
    categoryOptionGroupSet,
    optionSet,
    programRule,
    optionGroup,
    optionGroupSet,
};

export default {
    for(schemaName) {
        if (schemaName && disabledByType[schemaName]) {
            return disabledByType[schemaName];
        }
        return [];
    },
};
