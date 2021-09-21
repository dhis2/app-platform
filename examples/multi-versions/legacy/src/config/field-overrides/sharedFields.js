import { SELECT } from '../../forms/fields';
import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';

export const decimals = ['decimals', {
    type: SELECT,
    fieldOptions: {
        options: ['0', '1', '2', '3', '4', '5'],
    },
    beforeUpdateConverter(value) {
        if (isString(value)) {
            return Number(value);
        }
        return undefined;
    },
    beforePassToFieldConverter(value) {
        if (isNumber(value)) {
            return value.toString();
        }
        return value;
    },
}];
