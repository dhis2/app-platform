import React from 'react';

import ColorPicker from '../../forms/form-fields/color-picker';
import IconPicker from '../../forms/form-fields/icon-picker';
import OrganisationUnitTreeMultiSelect from '../../forms/form-fields/orgunit-tree-multi-select';

const SymbolPickerField = (props, context) => {
    const baseUrl = context.d2.Api.getApi().baseUrl;
    const apiUrlSectionRegexp = /\/api(?:\/[0-9]{2})?$/;
    const systemRootFolder = baseUrl.replace(apiUrlSectionRegexp, '');

    const imgPath = `${systemRootFolder}/images/orgunitgroup`;

    return (<IconPicker {...props} imgPath={imgPath} />);
};
SymbolPickerField.contextTypes = { d2: React.PropTypes.any };

export default new Map([
    ['color', {
        component: ColorPicker,
    }],
    ['symbol', {
        component: SymbolPickerField,
        fieldOptions: {
            options: (function () {
                const symbolUrls = [];
                let i = 1;

                for (; i <= 40; i++) {
                    const filename = i > 9 ? i : `0${i}`;
                    symbolUrls.push(`${filename}.${i > 25 ? 'svg' : 'png'}`);
                }

                return symbolUrls;
            }()),
        },
    }],
    ['organisationUnits', {
        component: OrganisationUnitTreeMultiSelect,
        fieldOptions: {},
    }],
]);
