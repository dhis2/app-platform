import { AvailableDataElement as AvailableColumn } from '../../EditModel/event-program/create-data-entry-form/DataElementPicker.component';
import React from 'react';
import PropTypes from 'prop-types';


const styles = {
    availableColumnElement: {
        flex: '1 1 calc(33.333333% - 4px)',
        margin: '0 4px 0 0',
        maxWidth: '231px',
        minWidth: '150px'
    },
    availableColumnsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    disabledElement: {},
    availableColumnsItem: {},
};

const AvailableColumnsList = ({ columns, onClick, selectedColumns }) => {
    return (
        <div style={styles.availableColumnsContainer}>
            {columns.map(column => {
                //adhere to availabledataelement api
                const toDataElement = {
                    id: column.value,
                    displayName: column.displayValue,
                };
                const active = selectedColumns.find(
                    col => col.value === column.value
                );
                return (
                        <AvailableColumn
                            key={column.value}
                            style={styles.availableColumnElement}
                            dataElement={toDataElement}
                            pickDataElement={() => onClick(column)}
                            active={!!active}
                        />
                );
            })}
        </div>
    );
};

AvailableColumnsList.propTypes = {
    columns: PropTypes.array,
    onClick: PropTypes.func,
    selectedColumns: PropTypes.array
};

export default AvailableColumnsList;
