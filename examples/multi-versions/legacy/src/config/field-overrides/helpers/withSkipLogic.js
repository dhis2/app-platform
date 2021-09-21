import React from 'react';
import switchOnBoolean from './switchOnBoolean';

const styles = {
    uniqueFieldWrap: {
        display: 'flex',
        flexDirection: 'column',
    },
};

// WithSkipLogic(predicate, ExtraFields, NormalField)
export default function withSkipLogic(predicate, ExtraFields, BaseField) {
    const ExtraFieldsWrap = switchOnBoolean(predicate, ExtraFields);

    return props => (
        <div style={styles.uniqueFieldWrap}>
            <BaseField {...props} />
            <ExtraFieldsWrap {...props} />
        </div>
    );
}
