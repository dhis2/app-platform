import React from 'react';
import Divider from 'material-ui/Divider';

const styles = {
    field: {
        display: 'inline-block',
        padding: '1rem 0',
    },
    label: {
        transformOrigin: 'left top 0px',
        color: 'rgba(0, 0, 0, 0.3)',
        transform: 'scale(.75)',
        fontSize: '18px',
    },
};

const FieldWrapper = props => {
    return (
        <div>
            <div style={styles.field}>
                <div style={styles.label}>{props.label}</div>
                {props.children}
            </div>
            <Divider />
        </div>
    );
};

export default FieldWrapper;
