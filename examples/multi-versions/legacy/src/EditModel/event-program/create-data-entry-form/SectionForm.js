import React, { Component, PropTypes } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import {
    sortBy,
    find,
    isEqual,
    getOr,
    pull,
    flatten,
    filter,
    findIndex,
    negate,
    difference,
} from 'lodash/fp';
import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/RaisedButton';

import SectionList from './SectionList.component';
import AddOrEditSection from './AddOrEditSection.component';
import DataElementPicker from './DataElementPicker.component';
import { HiddenElementsText } from './Section.component';

const styles = {
    sectionForm: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'space-between',
    },
};

const getActiveElements = (sections, elementPath) =>
    flatten(sections.map(section => section[elementPath]));

class SectionForm extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            collapsedSections: [],
            activeElements: getActiveElements(
                props.sections,
                props.elementPath
            ),
            selectedSectionId:
                (props.sections[0] && props.sections[0].id) || -1,
            editingSection: null,
            showNoSelectionSectionMessage: false,
            availableDataElementsFilter: '',
            sectionEditOpen: false,
        };

        this.getTranslation = context.d2.i18n.getTranslation.bind(
            context.d2.i18n
        );
    }

    componentWillReceiveProps(newProps) {
        if (newProps.sections !== this.props.sections) {
            this.setState({
                activeElements: getActiveElements(
                    newProps.sections,
                    this.props.elementPath
                ),
            });

            const newSectionAdded = difference(
                newProps.sections,
                this.props.sections
            )[0];
            if (newSectionAdded) {
                this.selectSection(newSectionAdded.id);
            }
        }
    }

    getElementsForSection = section => {
        const elems = section[this.props.elementPath];
        return elems;
    };

    onToggleEditing = section => {
        this.setState({
            editingSection:
                this.state.editingSection &&
                isEqual(section.id, this.state.editingSection.id)
                    ? null
                    : section,

            sectionEditOpen: !this.state.sectionEditOpen,
        });
    };

    clearEditingSection = () => {
        this.setState({ editingSection: null, sectionEditOpen: false });
    };

    openSection = sectionId => {
        this.setState({
            collapsedSections: pull(sectionId, this.state.collapsedSections),
        });
    };

    closeSection = sectionId => {
        const collapsedSections = this.state.collapsedSections;
        collapsedSections.push(sectionId);
        this.setState({
            collapsedSections,
        });
    };

    selectSection = sectionId => {
        this.setState({
            selectedSectionId: sectionId,
        });
    };

    openNoSelectionSectionMessage = () => {
        this.setState({
            showNoSelectionSectionMessage: true,
        });
    };

    closeNoSelectionSectionMessage = () => {
        this.setState({
            showNoSelectionSectionMessage: false,
        });
    };

    isSectionCollapsed = sectionId =>
        this.state.collapsedSections.includes(sectionId);

    onToggleSection = sectionId => {
        this.isSectionCollapsed(sectionId)
            ? this.openSection(sectionId)
            : this.closeSection(sectionId);
    };

    openSectionIfClosed = sectionId => {
        this.isSectionCollapsed(sectionId) && this.openSection(sectionId);
    };

    onSelectSection = sectionId => {
        this.openSectionIfClosed(sectionId);
        this.selectSection(sectionId);
    };

    onSectionUpdated = (sectionId, newSectionData) => {
        this.props.onSectionUpdated(sectionId, newSectionData);
        this.clearEditingSection();
    };

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.props.onSectionOrderChanged(
            arrayMove(this.props.sections, oldIndex, newIndex)
        );
    };

    onElementPicked = elementId => {
        const elementToAdd = find(
            element => isEqual(element.id, elementId),
            this.props.availableElements
        );
        if (!elementToAdd) return;

        const currentSelectedSectionIndex = findIndex(
            section => isEqual(this.state.selectedSectionId, section.id),
            this.props.sections
        );

        if (currentSelectedSectionIndex === -1) {
            this.openNoSelectionSectionMessage();
            return;
        }

        const currentSelectedSection = this.props.sections[
            currentSelectedSectionIndex
        ];
        const updatedSectionElements = this.getElementsForSection(
            currentSelectedSection
        ).concat(elementToAdd);
        const updatedSections = this.props.sections;

        currentSelectedSection[this.props.elementPath] = updatedSectionElements;
        this.props.onSectionOrderChanged(updatedSections);

        this.openSectionIfClosed(currentSelectedSection.id);
    };

    removeElementFromSection = (elementId, sectionId) => {
        const sectionIndex = findIndex(
            section => isEqual(section.id, sectionId),
            this.props.sections
        );

        const currentSection = this.props.sections[sectionIndex];
        const elements = this.getElementsForSection(currentSection);
        const updatedElements = filter(
            negate(element => isEqual(element.id, elementId)),
            elements
        );

        const allSections = this.props.sections;
        const currSection = this.props.sections[sectionIndex];
        currSection[this.props.elementPath] = updatedElements;

        this.props.onSectionOrderChanged(allSections);
    };

    sortItems = (sectionIndex, oldIndex, newIndex) => {
        const currentSection = this.props.sections[sectionIndex];
        const oldElements = this.getElementsForSection(currentSection);
        const elements = arrayMove(oldElements, oldIndex, newIndex);
        const sections = this.props.sections;
        sections[sectionIndex][this.props.elementPath] = elements;
        this.props.onSectionOrderChanged(sections);
    };

    handleFilterAvailableElements = event => {
        this.setState({ availableDataElementsFilter: event.target.value });
    };

    getFilteredAvailableElements() {
        const filter = this.state.availableDataElementsFilter;
        return this.props.availableElements.filter(
            element =>
                !filter.length ||
                element.displayName.toLowerCase().includes(filter.toLowerCase())
        );
    }

    render = () => {
        const filteredAvailableElements = this.getFilteredAvailableElements();
        const numberOfHiddenElements =
            this.props.availableElements.length -
            filteredAvailableElements.length;

        return (
            <div style={styles.sectionForm}>
                <div style={{ flex: 2 }}>
                    <SectionList
                        useDragHandle
                        distance={4}
                        sections={this.props.sections}
                        selectedSectionId={this.state.selectedSectionId}
                        collapsedSections={this.state.collapsedSections}
                        onToggleSection={this.onToggleSection}
                        onToggleEditing={this.onToggleEditing}
                        onSelectSection={this.onSelectSection}
                        onSectionRemoved={this.props.onSectionRemoved}
                        onDataElementRemoved={this.removeElementFromSection}
                        onSortEnd={this.onSortEnd}
                        sortItems={this.sortItems}
                        elementPath={this.props.elementPath}
                    />
                    <AddOrEditSection
                        onSectionAdded={this.props.onSectionAdded}
                        onSectionUpdated={this.onSectionUpdated}
                        editingSection={this.state.editingSection}
                        clearEditingSection={this.clearEditingSection}
                        open={this.state.sectionEditOpen}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <Button
                        style={{ marginBottom: 15, marginLeft: '1.5rem' }}
                        label={this.getTranslation('add_section_to_form')}
                        primary
                        fullWidth={false}
                        onClick={() => this.setState({ sectionEditOpen: true })}
                    />
                    <DataElementPicker
                        availableDataElements={sortBy(
                            ['displayName'],
                            filteredAvailableElements
                        )}
                        activeDataElements={this.state.activeElements}
                        onElementPicked={this.onElementPicked}
                        onFilter={this.handleFilterAvailableElements}
                        filterText={this.getTranslation('filter_elements')}
                        heading={
                            this.props.elementPath === 'dataElements'
                                ? this.getTranslation('available_data_elements')
                                : this.getTranslation('available_attributes')
                        }
                    />
                    <HiddenElementsText
                        numberOfHiddenElements={numberOfHiddenElements}
                        getTranslation={this.getTranslation}
                    />
                </div>
                <Snackbar
                    open={this.state.showNoSelectionSectionMessage}
                    message={this.getTranslation('no_section_selected_error')}
                    autoHideDuration={3000}
                    onRequestClose={this.closeNoSelectionSectionMessage}
                />
            </div>
        );
    };
}

SectionForm.propTypes = {
    onSectionUpdated: PropTypes.func.isRequired,
    onSectionOrderChanged: PropTypes.func.isRequired,
    onSectionAdded: PropTypes.func.isRequired,
    onSectionRemoved: PropTypes.func.isRequired,
    availableElements: PropTypes.array.isRequired,
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            sortOrder: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
        })
    ).isRequired,
};

SectionForm.contextTypes = {
    d2: PropTypes.object,
};

export default SectionForm;
