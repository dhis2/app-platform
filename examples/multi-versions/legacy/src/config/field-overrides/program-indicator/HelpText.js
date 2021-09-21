import React, { PropTypes } from 'react';
import { blue50, blue200 } from 'material-ui/styles/colors';

import InfoIcon from 'material-ui/svg-icons/action/info';

function HelpText({ schema, property }, { d2 }) {
    const styles = {
        wrap: {
            padding: '1rem',
            backgroundColor: blue50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
        },
        text: {
            paddingLeft: '1rem',
        },
        iconWrap: {
            margin: '3px 3px 0',
        },
    };

    return (
        <div style={styles.wrap}>
            <span style={styles.iconWrap}>
                <InfoIcon color={blue200} />
            </span>
            <span style={styles.text}>
                {d2.i18n.getTranslation(`${schema}__${property}__help_text`)}
            </span>
        </div>
    );
}
HelpText.propTypes = {
    schema: PropTypes.string.isRequired,
    property: PropTypes.string.isRequired,
};
HelpText.contextTypes = { d2: PropTypes.object };

export default HelpText;
