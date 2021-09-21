import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import DragHandle from '../../EditModel/event-program/create-data-entry-form/DragHandle.component';
import { grey100, grey200 } from 'material-ui/styles/colors';
import ActionButton from '../../EditModel/event-program/create-data-entry-form/ActionButton.component';

const styles = {
    dataElement: {
        backgroundColor: grey200,
        marginBottom: '4px',
        margin: '0 5px 5px 0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 5px',
        flex: '1 0 21%',
        minHeight: '50px',
        maxWidth: '175px',
    },

    elementValue: {
        userSelect: 'none',
        textAlign: 'center',
    },
    selectedColumnsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        wordBreak: 'break-word',
    },
    removeButton: {
        width: '24px',
        height: '24px',
        padding: 0,
    },
};

const Element = ({ value, onRemoveItem }) => (
    <div style={styles.dataElement}>
        <DragHandle />
        <div style={styles.elementValue}>{value.displayValue}</div>
        <ActionButton
            style={styles.removeButton}
            onClick={onRemoveItem}
            icon="clear"
        />
    </div>
);

Element.propTypes = {
    value: PropTypes.shape({
        value: PropTypes.any,
        displayvalue: PropTypes.string,
    }),
};

const SortableItem = SortableElement(Element);
const SortableDataList = SortableContainer(
    ({ items, isSortingIndex, onRemoveItem }) => (
        <div style={styles.selectedColumnsContainer}>
            {items.map((item, index) => (
                <SortableItem
                    index={index}
                    isSortingIndex={isSortingIndex}
                    key={`item-${index}`}
                    sortIndex={index}
                    value={item}
                    onRemoveItem={() => onRemoveItem(index, item.value)}
                />
            ))}
        </div>
    )
);

class ColumnList extends Component {
    render() {
        return (
            <SortableDataList
                items={this.props.items}
                onSortEnd={this.props.onSortEnd}
                axis="xy"
                onRemoveItem={this.props.onRemoveItem}
                helperClass="sortableModalHelper"
                useDragHandle
            />
        );
    }
}

ColumnList.propTypes = {
    items: PropTypes.shape({
        value: PropTypes.any,
        displayValue: PropTypes.string,
    }),
    columns: PropTypes.array,
};

export default ColumnList;
