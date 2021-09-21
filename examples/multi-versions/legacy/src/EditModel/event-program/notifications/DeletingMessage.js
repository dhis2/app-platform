import React, { PropTypes } from 'react';

const styles = {
    wrap: {
        boxSizing: 'border-box',
        position: 'fixed',
        width: '50%',
        top: '45%',
        left: '25%',
        background: 'rgba(0, 0, 0, .7)',
        zIndex: 1000,
        color: 'white',
        padding: '1.5rem',
        borderRadius: '.25rem',
    },
};

export default function DeletingMessage({ isDeleting, name }, { d2 }) {
    if (!isDeleting) {
        return null;
    }

    return (
        <div style={styles.wrap}>
            <h1>{ d2.i18n.getTranslation('deleting') }</h1>
            <h2>{ name }</h2>
        </div>
    );
}
DeletingMessage.contextTypes = {
    d2: PropTypes.object,
};
