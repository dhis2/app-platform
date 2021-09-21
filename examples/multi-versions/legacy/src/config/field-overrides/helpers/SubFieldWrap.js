import React from 'react';

const styles = {
    formFieldSubFields: {
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        boxSizing: 'content-box',
        borderRadius: '2px',
        width: '100%',
        backgroundColor: 'rgb(250, 250, 250)',
        paddingLeft: '1rem',
        paddingBottom: '0.5rem',
        marginLeft: '-0.5rem',
        marginBottom: '1rem',
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 5px -1px inset',
    },
};

export default function SubFieldWrap({ children, style = {} }) {
    const subfieldWrapStyle = {
        ...styles.formFieldSubFields,
        ...style,
    };

    return (
        <div style={subfieldWrapStyle}>
            {children}
        </div>
    );
}
