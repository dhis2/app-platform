import React from 'react';
import { isNil } from 'lodash/fp';
import Paper from 'material-ui/Paper/Paper';
import mapProps from 'recompose/mapProps';

export const wrapInPaperWithStyle = style => (BaseComponent) => {
    const styleToApply = isNil(style) ? { padding: '3rem' } : style;

    return function WrappedInPaper(props) {
        return (
            <Paper style={styleToApply}>
                <BaseComponent {...props} />
            </Paper>
        );
    };
};

export const wrapInPaper = wrapInPaperWithStyle();

export const flattenRouterProps = mapProps(props => ({
    ...props,
    groupName: props.params.groupName,
    modelType: props.schema,
    modelId: props.params.modelId,
}));

export const wrapVerticalStepInPaper = BaseComponent =>
    wrapInPaperWithStyle({
        padding: '3rem',
        marginTop: '15px',
    })(BaseComponent);
