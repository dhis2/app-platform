import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';
import { orange200, orange500 } from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    dragHandle: {
        userSelect: 'none',
        cursor: 'move',
        transition: 'none',
    },

    dragHandleColor: orange500,
    dragHandleHoverColor: orange200,
};

const DragHandle = () => (
    <FontIcon
        color={styles.dragHandleColor}
        hoverColor={styles.dragHandleHoverColor}
        className="material-icons"
        style={styles.dragHandle}
    >reorder</FontIcon>
);

export default SortableHandle(DragHandle);
