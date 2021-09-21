import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper/Paper';
import { bindActionCreators } from 'redux';
import { arrayMove } from 'react-sortable-hoc';

import DefaultForm from './DefaultForm.component';
import SectionForm from './SectionForm';
import CustomForm from './CustomForm.component';

import { getCurrentProgramStage } from './selectors';
import mapPropsStream from 'recompose/mapPropsStream';
import mapProps from 'recompose/mapProps';
import { sortBy, get, getOr, compose, find } from 'lodash/fp';
import withHandlers from 'recompose/withHandlers';
import eventProgramStore from '../eventProgramStore';
import { getProgramStageOrFirstFromProps$ } from '../tracker-program/program-stages/utils';
import {
    changeProgramStageDataElementOrder,
    changeProgramStageSectionOrder,
    addProgramStageSection,
    removeProgramStageSection,
    updateProgramStageSection,
} from './actions';
import { getStageSectionsById } from "../tracker-program/program-stages/selectors";

const sectionFormIndex = 1;
const formIndices = {
  basic: 0,
  section: 1,
  custom: 2,
}

const styles = {
    tabContent: { padding: '3rem' },
    helpText: { color: 'gray', marginBottom: '2rem' },
};

class CreateDataEntryForm extends Component {
    constructor(props) {
        super(props)

        const hasCustomForm = this.props.programStage && this.props.programStage.dataEntryForm
        this.state = {
            curTab: hasCustomForm ? formIndices.custom : formIndices.section
        }
    }

    onTabChange = (_, __, tab) => {
        const curTab = tab.props.index
        this.setState({ curTab })
    }

    programDataElementOrderChanged = ({ oldIndex, newIndex }) => {
        this.props.onChangeDefaultOrder(
            arrayMove(
                this.props.availableDataElements.map(
                    dataElement => dataElement.id
                ),
                oldIndex,
                newIndex
            )
        );
    };

    renderTab = (label, contentToRender) =>
        <Tab style={styles.tab} label={label}>
            <div style={styles.tabContent}>
                <HelpText />
                {contentToRender}
            </div>
        </Tab>;

    getTranslation = key => {
        return this.context.d2.i18n.getTranslation(key);
    };

    render() {
        return (
            <Paper>
                <Tabs
                    initialSelectedIndex={this.state.curTab}
                    onChange={this.onTabChange}
                >
                    {this.renderTab(
                        this.getTranslation('basic'),
                        <DefaultForm
                            availableDataElements={
                                this.props.availableDataElements
                            }
                            onChange={this.programDataElementOrderChanged}
                        />
                    )}

                    {this.renderTab(
                        this.getTranslation('section'),
                        <SectionForm
                            availableElements={
                                this.props.availableDataElements
                            }
                            sections={
                                this.props.programStageSections
                            }
                            onSectionUpdated={
                                this.props.onSectionUpdated
                            }
                            onSectionOrderChanged={
                                this.props.onSectionOrderChanged
                            }
                            onSectionAdded={this.props.onSectionAdded}
                            onSectionRemoved={this.props.onSectionRemoved}
                            elementPath='dataElements'
                        />
                    )}

                    {this.renderTab(
                        this.getTranslation('custom'),
                        (
                            <CustomForm
                                isActive={this.state.curTab === formIndices.custom}
                                programStage={this.props.programStage}
                            />
                        )
                    )}
                </Tabs>
            </Paper>
        );
    }
}

CreateDataEntryForm.contextTypes = {
    d2: PropTypes.object,
};

const HelpText = (_, { d2 }) =>
    <div style={styles.helpText}>
        {d2.i18n.getTranslation('program_forms_help_text')}
    </div>;

HelpText.contextTypes = {
    d2: PropTypes.object,
};

CreateDataEntryForm.propTypes = {
    onChangeDefaultOrder: PropTypes.func.isRequired,
    onSectionOrderChanged: PropTypes.func.isRequired,
    onSectionUpdated: PropTypes.func.isRequired,
    onSectionAdded: PropTypes.func.isRequired,
    onSectionRemoved: PropTypes.func.isRequired,
    programStageSections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            sortOrder: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            dataElements: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    displayName: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
};

const mapStateToProps = state => ({
    currentProgramStageId: getCurrentProgramStage(state),
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            changeProgramStageDataElementOrder,
            changeProgramStageSectionOrder,
            addProgramStageSection,
            removeProgramStageSection,
            updateProgramStageSection,
        },
        dispatch
    );

const programStageSections$ = eventProgramStore.map(
    getOr([], 'programStageSections')
);

const trackerDataElements$ = eventProgramStore.map(
    getOr([], 'availableDataElements')
);

const enhance = compose(
    connect(mapStateToProps, mapDispatchToProps),
    mapPropsStream(props$ =>
        props$.combineLatest(
            getProgramStageOrFirstFromProps$(props$),
            programStageSections$,
            trackerDataElements$,
            eventProgramStore,
            (
                props,
                programStage,
                programStageSections,
                trackerDataElements,
                store,
            ) => ({
                ...props,
                programStage,
                programStageSections: getStageSectionsById(store, programStage.id) || [],
                trackerDataElements,
            })
        )
    ),
    mapProps(({ trackerDataElements, ...props }) => {
        const getDisplayNameForDataElement = dataElement =>
            dataElement.displayName ||
            get(
                'displayName',
                find(
                    trackerDataElement =>
                        dataElement.id === trackerDataElement.id,
                    trackerDataElements
                )
            );

        const availableDataElements =
            props.programStage.programStageDataElements;

        return {
            ...props,
            programStageSections: sortBy(
                ['sortOrder'],
                props.programStageSections.map(section => {
                    section.dataElements = Array.from(
                        section.dataElements.values()
                    ).map(dataElement => ({
                        id: dataElement.id,
                        displayName: getDisplayNameForDataElement(dataElement),
                    }));

                    return section;
                })
            ),
            availableDataElements: sortBy(
                ['sortOrder'],
                availableDataElements.map(programDataElement => ({
                    ...programDataElement.dataElement,
                    displayName: getDisplayNameForDataElement(
                        programDataElement.dataElement
                    ),
                    sortOrder: programDataElement.sortOrder,
                }))
            ),
        };
    }),
    withHandlers({
        onChangeDefaultOrder: ({
            programStage,
            changeProgramStageDataElementOrder,
        }) => newDataElementOrder => {
            changeProgramStageDataElementOrder({
                programStage: programStage.id,
                newDataElementOrder,
            });
        },
        onSectionUpdated: ({
            programStage,
            updateProgramStageSection,
        }) => (sectionId, newSectionData) => {
            updateProgramStageSection({
                programStage: programStage.id,
                programStageSectionId: sectionId,
                newProgramStageSectionData: newSectionData,
            });
        },
        onSectionOrderChanged: ({
            programStage,
            changeProgramStageSectionOrder,
        }) => programStageSections => {
            changeProgramStageSectionOrder({
                programStage: programStage.id,
                programStageSections
            });
        },
        onSectionAdded: ({ programStage, addProgramStageSection }) => (newSectionData) => {
            addProgramStageSection({
                programStage: programStage.id,
                newSectionData,
            });
        },
        onSectionRemoved: ({
            programStage,
            removeProgramStageSection,
        }) => programStageSection => {
            removeProgramStageSection({
                programStage: programStage.id,
                programStageSection });
        },
    })
);

export default enhance(CreateDataEntryForm);
