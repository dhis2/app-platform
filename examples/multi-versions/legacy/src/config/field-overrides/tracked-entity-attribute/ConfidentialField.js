import React from 'react';
import switchOnBoolean from '../helpers/switchOnBoolean';
import Checkbox from '../../../forms/form-fields/check-box';
import InfoMessage from './InfoMessage';

const ConfidentialField = switchOnBoolean(
    (props, { d2 }) => d2.system.systemInfo.encryption === true,
    Checkbox,
    ({ d2 }) => (
        <div style={{ paddingTop: '0.25rem' }}>
            <Checkbox disabled labelText={d2.i18n.getTranslation('confidential')} />
            <InfoMessage message="confidentiality_option_not_available_since_encryption_is_not_configured" />
        </div>
    ),
);

export default ConfidentialField;
