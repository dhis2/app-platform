import React, { Component, PropTypes } from 'react';
import { grey300, grey800 } from 'material-ui/styles/colors';
import { SortableElement } from 'react-sortable-hoc';
import Heading from 'd2-ui/lib/headings/Heading.component';

import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import DragHandle from './DragHandle.component';
import SortableSectionDataList from './SortableSectionDataList.component';
import TextField from 'material-ui/TextField/TextField';

const styles = {
    sectionContainer: {
        width: '100%',
        borderRadius: '8px',
        borderStyle: 'solid',
        borderColor: grey300,
        borderWidth: '3px',
        marginBottom: '1.2rem',
    },
    noDataElementsMessage: {
        height: '4rem',
        lineHeight: '4rem',
        borderRadius: '6px',
        backgroundColor: 'white',
        paddingLeft: '1.5rem',
    },
    sectionContent: {
        backgroundColor: grey300,
    },
    sectionHeader: {
        color: 'black',
        backgroundColor: grey300,
        borderRadius: '4px 4px 0 0',
        paddingLeft: '1rem',
    },
    sectionTopBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    collapsibleArrow: {
        color: 'black',
        cursor: 'pointer',
        transition: 'none',
        userSelect: 'none',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionName: {
        textAlign: 'left',
        color: 'black',
        fontSize: '1.7rem',
        fontWeight: '400',
        wordWrap: 'break-word',
        minWidth: '180px',
    },
    filterField: {
        marginTop: '-12px',
        marginBottom: '6px',
    },
    hiddenByFilter: {
        margin: 0,
        padding: '5px',
        textAlign: 'center',
    },
};

export const HiddenElementsText = ({
    numberOfHiddenElements,
    getTranslation,
}) => {
    if (numberOfHiddenElements < 1) {
        return null;
    }
    return (
        <p
            style={{
                margin: 0,
                padding: '5px',
                textAlign: 'center',
            }}
        >
            {numberOfHiddenElements === 1
                ? getTranslation('element_hidden_by_filter')
                : getTranslation('$$total$$_elements_hidden_by_filter', {
                      total: numberOfHiddenElements,
                  })}
        </p>
    );
};

const ActionButton = ({ onClick, icon }) => {
    const noPropagation = e => {
        if (e) e.stopPropagation();
        onClick();
    };

    return (
        <IconButton
            style={{ transition: 'none' }}
            iconStyle={{ transition: 'none' }}
            onClick={noPropagation}
        >
            <FontIcon color="gray" className="material-icons">
                {icon}
            </FontIcon>
        </IconButton>
    );
};

class Section extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showRemovalDialog: false,
            filter: '',
        };

        this.getTranslation = context.d2.i18n.getTranslation.bind(
            context.d2.i18n
        );
    }

    onSortEnd = (oldIndex, newIndex) => {
        this.props.sortItems(oldIndex, newIndex);
    };

    openRemovalDialog = () => {
        this.setState({ showRemovalDialog: true });
    };

    closeRemovalDialog = () => {
        this.setState({ showRemovalDialog: false });
    };

    confirmSectionRemoval = () => {
        this.closeRemovalDialog();
        this.props.onSectionRemoved();
    };

    handleFilterElemenets = event => {
        this.setState({
            filter: event.target.value,
        });
    };

    getFilteredElements() {
        const filter = this.state.filter;
        return this.props.elements.filter(
            element =>
                !filter.length ||
                element.displayName.toLowerCase().includes(filter.toLowerCase())
        );
    }

    render() {
        const elements = this.props.elements;
        const filteredElements = this.getFilteredElements();
        const numberOfHiddenElements =
            elements.length - filteredElements.length;
        const removalDialogActions = [
            <FlatButton
                primary
                label={this.getTranslation('cancel')}
                onTouchTap={this.closeRemovalDialog}
            />,
            <FlatButton
                primary
                label={this.getTranslation('delete')}
                onTouchTap={this.confirmSectionRemoval}
            />,
        ];

        const sectionContent =
            elements && elements.length > 0 ? (
                <div style={styles.sectionContent}>
                    <SortableSectionDataList
                        distance={4}
                        onSortEnd={this.onSortEnd}
                        onDataElementRemoved={this.props.onDataElementRemoved}
                        sectionDataElements={filteredElements}
                    />
                    <HiddenElementsText
                        numberOfHiddenElements={numberOfHiddenElements}
                        getTranslation={this.getTranslation}
                    />
                </div>
            ) : (
                <div style={styles.noDataElementsMessage}>
                    {this.props.elementPath === 'dataElements'
                        ? this.getTranslation('no_data_elements')
                        : this.getTranslation('no_attributes')}
                </div>
            );

        return (
            <div
                style={{
                    ...styles.sectionContainer,
                    borderColor: this.props.selected ? grey800 : grey300,
                }}
            >
                <div onClick={this.props.onSelect} style={styles.sectionHeader}>
                    <div style={styles.sectionTopBar}>
                        <div style={styles.row}>
                            <DragHandle />
                            <ActionButton
                                onClick={this.props.onToggleEdit}
                                icon="mode_edit"
                            />
                            <div style={styles.sectionName}>
                                {this.props.section.displayName}
                            </div>
                        </div>
                        <div style={styles.row}>
                            <ActionButton
                                onClick={this.props.onToggleOpen}
                                icon={
                                    this.props.collapsed
                                        ? 'keyboard_arrow_down'
                                        : 'keyboard_arrow_up'
                                }
                            />
                            <ActionButton
                                onClick={this.openRemovalDialog}
                                icon="clear"
                            />
                        </div>
                    </div>
                    {!this.props.collapsed && (
                        <TextField
                            style={styles.filterField}
                            hintText={this.getTranslation('filter_elements')}
                            onChange={this.handleFilterElemenets}
                        />
                    )}
                </div>

                {!this.props.collapsed && sectionContent}

                <Dialog
                    title={this.getTranslation('delete_section_message')}
                    actions={removalDialogActions}
                    open={this.state.showRemovalDialog}
                    onRequestClose={this.closeRemovalDialog}
                    autoScrollBodyContent
                >
                    <Heading level={2}>
                        {this.props.section.displayName}
                    </Heading>
                </Dialog>
            </div>
        );
    }
}

Section.propTypes = {
    section: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    collapsed: PropTypes.bool.isRequired,
    onSectionRemoved: PropTypes.func.isRequired,
    onDataElementRemoved: PropTypes.func.isRequired,
    onToggleEdit: PropTypes.func.isRequired,
    onToggleOpen: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    sortItems: PropTypes.func.isRequired,
};

Section.contextTypes = {
    d2: PropTypes.object,
};

export default SortableElement(Section);
