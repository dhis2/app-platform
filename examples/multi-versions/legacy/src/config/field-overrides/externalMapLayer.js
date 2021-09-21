import React from 'react';
import DropDown from '../../forms/form-fields/drop-down';
import TextField from '../../forms/form-fields/text-field';
import SubFieldWrap from './helpers/SubFieldWrap';
import actions from '../../EditModel/objectActions';
import { isUrl } from 'd2-ui/lib/forms/Validators';
import withD2Context from 'd2-ui/lib/component-helpers/addD2Context';

export default new Map([
    ['imageFormat', {
        component: withD2Context((props, { d2 }) => (props.model.mapService === 'WMS' ?
            <SubFieldWrap>
                <DropDown
                    labelText={props.labelText}
                    options={props.options}
                    value={props.model.imageFormat}
                    onChange={(e) => { actions.update({ fieldName: 'imageFormat', value: e.target.value }); }}
                    isRequired
                    style={{ width: '97.5%' }}
                />
                <div style={{ clear: 'both' }} />
                <TextField
                    labelText={d2.i18n.getTranslation('layers')}
                    value={props.model.layers || ''}
                    onChange={(e) => { actions.update({ fieldName: 'layers', value: e.target.value }); }}
                    style={{ width: '97.5%' }}
                />
            </SubFieldWrap> : null)),
    }],
    ['url', { validators: [{ validator: isUrl, message: isUrl.message }] }],
    ['legendSetUrl', { validators: [{ validator: isUrl, message: isUrl.message }] }],
    ['mapLayerPosition', { required: true }],
]);
