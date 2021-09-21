import React, { PropTypes } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import DragHandle from './DragHandle.component';
import { grey100 } from 'material-ui/styles/colors';
import ActionButton from './ActionButton.component';

const styles = {
    dataElement: {
        height: '55px',
        display: 'flex',
        paddingLeft: '1rem',
        backgroundColor: grey100,
        borderRadius: '6px',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    row: {
        userSelect: 'none',
        MozUserSelect: 'none',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    horizontalSpace: {
        paddingLeft: '1rem',
    },
};

const SectionDataElement = ({ first, dataElement, onRemove }) => {
    const divStyle = {
        ...styles.dataElement,
        marginTop: first ? '0px' : '4px',
    };

    return (
        <div style={divStyle}>
            <div style={styles.row}>
                <DragHandle />
                <div style={styles.horizontalSpace} />
                {dataElement.displayName}
            </div>
            <ActionButton onClick={onRemove} icon="clear" />
        </div>
    );
};

SectionDataElement.propTypes = {
    dataElement: PropTypes.shape({
        id: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    }),
};

const SortableSectionDataElement = SortableElement(SectionDataElement);
const SortableSectionDataList = SortableContainer(({ sectionDataElements, onDataElementRemoved }) => <div>
    { sectionDataElements.map((dataElement, index) => (
        <SortableSectionDataElement
            first={index === 0}
            dataElement={dataElement}
            onRemove={() => { onDataElementRemoved(dataElement.id); }}
            index={index}
            key={`item-${index}`}
        />
        ))}
</div>);

export default SortableSectionDataList;
