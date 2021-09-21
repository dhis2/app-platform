import React from 'react';

export default function OptionValue(props) {
    const {
        connectDragSource,
        connectDropTarget,
        isDragging,
        displayName,
        code,
    } = props;

    return connectDropTarget(connectDragSource(
        <div style={{
            opacity: isDragging ? 0.2 : 1,
            padding: '.5rem',
            margin: '.5rem',
            border: '1px dotted #333' }}
        >
            {displayName} ({code})
        </div>,
    ));
}
