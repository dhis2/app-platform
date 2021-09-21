import React, { PropTypes } from 'react';
import CircularProgress from 'd2-ui/lib/circular-progress/CircularProgress';

export default function RefreshMask({ horizontal }, { d2 }) {
    const styles = {
        fieldMask: {
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: horizontal ? 'row' : 'column',
        },
    };

    return (
        <div style={styles.fieldMask}>
            <CircularProgress />
            <div>{d2.i18n.getTranslation('reloading_available_values')}</div>
        </div>
    );
}

RefreshMask.propTypes = { horizontal: PropTypes.bool };
RefreshMask.defaultProps = { horizontal: false };
RefreshMask.contextTypes = { d2: PropTypes.object };
