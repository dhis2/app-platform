import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper/Paper';
import { bindActionCreators } from 'redux';
import { arrayMove } from 'react-sortable-hoc';

import SectionForm from '../../../create-data-entry-form/SectionForm';
import { CustomRegistrationDataEntryForm } from '../../../data-entry-form/EditCustomRegistrationForm';
import mapPropsStream from 'recompose/mapPropsStream';
import withProps from 'recompose/withProps';
import { sortBy, get, getOr, compose, find, differenceBy } from 'lodash/fp';
import withHandlers from 'recompose/withHandlers';
import eventProgramStore from '../../../eventProgramStore';
import {
    changeProgramSectionOrder,
    addProgramSection,
    removeProgramSection,
    updateProgramSection,
    setProgramSectionElements
} from './actions';

const formIndices = {
    section: 0,
    custom: 1,
};

const styles = {
    tabContent: { padding: '3rem' },
    helpText: { color: 'gray', marginBottom: '2rem' },
};

class CreateEnrollmentDataEntryForm extends Component {
    constructor(props) {
        super(props);

        const hasCustomForm = props.model && props.model.dataEntryForm
        this.state = {
            curTab: hasCustomForm ? formIndices.custom : formIndices.section,
        };
    }

    onTabChange = (_, __, tab) => {
        const curTab = tab.props.index;
        this.setState({ curTab });
    };

    programDataElementOrderChanged = ({ oldIndex, newIndex }) => {
        this.props.onChangeDefaultOrder(
            arrayMove(
                this.props.availableAttributes.map(
                    dataElement => dataElement.id
                ),
                oldIndex,
                newIndex
            )
        );
    };

    renderTab = (label, contentToRender) => (
        <Tab style={styles.tab} label={label}>
            <div style={styles.tabContent}>
                <HelpText />
                {contentToRender}
            </div>
        </Tab>
    );

    getTranslation = key => {
        return this.context.d2.i18n.getTranslation(key);
    };

    render() {
        return (
            <Paper style = {{marginTop: '15px'}}>
                <Tabs
                    initialSelectedIndex={this.state.curTab}
                    onChange={this.onTabChange}
                >
                    {this.renderTab(
                        this.getTranslation('section'),
                        <SectionForm
                            availableElements={this.props.assignedAttributes}
                            sections={this.props.programSections}
                            onSectionUpdated={this.props.onSectionUpdated}
                            onSectionOrderChanged={
                                this.props.onSectionOrderChanged
                            }
                            onSectionAdded={this.props.onSectionAdded}
                            onSectionRemoved={this.props.onSectionRemoved}
                            elementPath="trackedEntityAttributes"
                        />
                    )}

                    {this.renderTab(
                        this.getTranslation('custom'),
                        <CustomRegistrationDataEntryForm
                            isActive={this.state.curTab === formIndices.custom}
                            programStage={this.props.programStage}
                        />
                    )}
                </Tabs>
            </Paper>
        );
    }
}

CreateEnrollmentDataEntryForm.contextTypes = {
    d2: PropTypes.object,
};

const HelpText = (_, { d2 }) => (
    <div style={styles.helpText}>
        {d2.i18n.getTranslation('program_forms_help_text')}
    </div>
);

HelpText.contextTypes = {
    d2: PropTypes.object,
};

CreateEnrollmentDataEntryForm.propTypes = {
    onSectionOrderChanged: PropTypes.func.isRequired,
    onSectionUpdated: PropTypes.func.isRequired,
    onSectionAdded: PropTypes.func.isRequired,
    onSectionRemoved: PropTypes.func.isRequired,
    programSections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            sortOrder: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            attributes: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    displayName: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            changeProgramSectionOrder,
            addProgramSection,
            removeProgramSection,
            updateProgramSection,
        },
        dispatch
    );

const sections$ = eventProgramStore.map(getOr([], 'programSections'));

const enhance = compose(
    connect(
        null,
        mapDispatchToProps
    ),
    mapPropsStream(props$ =>
        props$.combineLatest(sections$, (props, sections) => ({
            ...props,
            programSections: sections,
        }))
    ),
    withProps(({ assignedAttributes, programSections }) => {
        // We need to actually use the tea and not ptea, keep ptea sortOrder
        return {
            assignedAttributes: assignedAttributes.map(a => ({
                ...a.trackedEntityAttribute,
                sortOrder: a.sortOrder,
            })),
            programSections: programSections.map(s => {
                s.trackedEntityAttributes= Array.from(s.trackedEntityAttributes.values())
               return s;
            })
        };
    }),
    withHandlers({
        onSectionUpdated: ({ updateProgramSection }) => (
            sectionId,
            newSectionData
        ) => {
            updateProgramSection({
                programSectionId: sectionId,
                newProgramSectionData: newSectionData,
            });
        },
        onSectionOrderChanged: ({
            changeProgramSectionOrder,
        }) => programSections => {
            changeProgramSectionOrder({
                programSections,
            });
        },
        onSectionAdded: ({ addProgramSection }) => newSectionData => {
            addProgramSection({
                newSectionData,
            });
        },
        onSectionRemoved: ({ removeProgramSection }) => programSection => {
            removeProgramSection({
                programSection,
            });
        },
    })
);

export default enhance(CreateEnrollmentDataEntryForm);
