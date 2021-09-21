import React, { PropTypes } from 'react';
import Translate from 'd2-ui/lib/i18n/Translate.component';
import InfoIcon from 'material-ui/svg-icons/action/info-outline';

export default function InfoMessage({ message, ...wrapperProps }) {
    const styles = {
        wrap: {
            display: 'flex',
            flexDirection: 'row',
            padding: '1rem 0',
        },

        message: {
            lineHeight: '24px',
            display: 'block',
            textAlign: 'center',
            paddingLeft: '0.5rem',
        },

        infoIcon: {
            fill: 'orange',
        },
    };

    return (
        <div style={styles.wrap} {...wrapperProps}>
            <InfoIcon style={styles.infoIcon} />
            <div style={styles.message}>
                <Translate>{message}</Translate>
            </div>
        </div>
    );
}

InfoMessage.propTypes = {
    message: PropTypes.string.isRequired,
};
