import React, { Component } from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';

import TranslationDialog from 'd2-ui/lib/i18n/TranslationDialog.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import FloatingActionButton from 'material-ui/FloatingActionButton/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon/FontIcon';

import SectionDialog from './SectionDialog.component';
import GreyFieldDialog from './GreyFieldDialog.component';

import snackActions from '../Snackbar/snack.actions';
import modelToEditStore from './modelToEditStore';
import FormHeading from './FormHeading';
import FormSubHeading from './FormSubHeading';

const styles = {
    heading: {
        paddingBottom: 18,
    },
    fab: {
        textAlign: 'right',
        marginTop: '1rem',
        bottom: '1.5rem',
        right: '1.5rem',
        position: 'fixed',
        zIndex: 10,
    },
};

class EditDataSetSections extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            categoryCombos: null,
            editSectionModel: false,
            greyFieldSectionModel: false,
        };

        Promise.all([
            context.d2.Api.getApi().get(
                ['dataSets', props.params.modelId, 'categoryCombos'].join('/'),
                { fields: 'id,displayName', paging: false },
            ),
        ]).then(([catComboList]) => {
            const sections = modelToEditStore.state.sections;
            const sectionArray = Array.isArray(sections) ? sections : sections.toArray();
            this.setState({
                sections: sectionArray.sort((a, b) => a.sortOrder - b.sortOrder),
                categoryCombos: catComboList.categoryCombos.map(cc => ({
                    value: cc.id,
                    text: cc.displayName === 'default' ? this.getTranslation('none') : cc.displayName,
                })),
            });
        });

        this.handleAddSectionClick = this.handleAddSectionClick.bind(this);
        this.handleEditSectionClick = this.handleEditSectionClick.bind(this);
        this.handleSectionSaved = this.handleSectionSaved.bind(this);

        this.handleDeleteSectionClick = this.handleDeleteSectionClick.bind(this);
        this.handleTranslateSectionClick = this.handleTranslateSectionClick.bind(this);
        this.handleTranslationSaved = this.handleTranslationSaved.bind(this);
        this.handleTranslationErrored = this.handleTranslationErrored.bind(this);

        this.handleSectionGreyFieldsClick = this.handleSectionGreyFieldsClick.bind(this);

        this.swapSections = this.swapSections.bind(this);
        this.moveSectionUp = this.moveSectionUp.bind(this);
        this.moveSectionDown = this.moveSectionDown.bind(this);

        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

    handleAddSectionClick() {
        const newSection = this.context.d2.models.sections.create();
        this.setState(state => ({
            editSectionModel: Object.assign(newSection, {
                dataSet: { id: modelToEditStore.state.id },
                sortOrder: state.sections.reduce((p, s) => Math.max(s.sortOrder, p), 0) + 1,
            }),
        }));
    }

    handleEditSectionClick(editSectionModel) {
        this.setState({ editSectionModel });
    }

    handleSectionSaved(savedSection) {
        this.setState((state) => {
            let replaced = false;
            const sections = state.sections
                .map((s) => {
                    if (s.id === savedSection.id) {
                        replaced = true;
                        return savedSection;
                    }
                    return s;
                })
                .sort((a, b) => a.sortOrder - b.sortOrder);
            if (!replaced) {
                sections.push(savedSection);
            }

            modelToEditStore.setState(Object.assign(modelToEditStore.state, { sections }));
            return {
                editSectionModel: false,
                greyFieldSectionModel: false,
                sections,
            };
        }, () => {
            this.forceUpdate();
        });
    }

    handleDeleteSectionClick(section) {
        snackActions.show({
            message: `${this.getTranslation('confirm_delete_section')} ${section.displayName}`,
            action: 'confirm',
            onActionTouchTap: () => {
                section.delete()
                    .then(() => {
                        const newSections = modelToEditStore.state.sections;
                        modelToEditStore.setState(Object.assign(modelToEditStore.state, {
                            sections: (Array.isArray(newSections)
                                ? newSections
                                : newSections.toArray()).filter(s => s.id !== section.id),
                        }));

                        snackActions.show({ message: this.getTranslation('section_deleted') });
                        this.setState(state => ({
                            sections: state.sections.filter(s => s.id !== section.id),
                        }));
                    })
                    .catch((err) => {
                        snackActions.show({ message: this.getTranslation('failed_to_delete_section'), action: 'ok' });
                        log.warn('Failed to delete section', err);
                    });
            },
        });
    }

    handleTranslateSectionClick(section) {
        this.setState({
            translationModel: section,
        });
    }

    handleTranslationSaved = () => {
        snackActions.show({ message: 'translation_saved', translate: true });
    }

    handleTranslationErrored = (errorMessage) => {
        log.error(errorMessage);
        snackActions.show({ message: 'translation_save_error', action: 'ok', translate: true });
    }

    handleSectionGreyFieldsClick(section) {
        this.setState({ greyFieldSectionModel: section });
    }

    swapSections(sectionA, sectionB) {
        this.setState((state) => {
            const swapOrder = sectionA.sortOrder;
            sectionA.sortOrder = sectionB.sortOrder; // eslint-disable-line
            sectionB.sortOrder = swapOrder; // eslint-disable-line

            Promise.all([
                sectionA.save(),
                sectionB.save(),
            ])
                .then(() => {
                    snackActions.show({ message: this.getTranslation('section_moved') });
                })
                .catch((err) => {
                    log.warn('Failed to swap sections:', err);
                    snackActions.show({ message: this.getTranslation('failed_to_move_section'), action: 'ok' });
                });

            return {
                sections: state.sections.sort((a, b) => a.sortOrder - b.sortOrder),
            };
        });
    }

    moveSectionUp(section) {
        const currentIndex = this.state.sections.indexOf(section);
        if (currentIndex > 0) {
            const swapSection = this.state.sections[currentIndex - 1];
            this.swapSections(swapSection, section);
        }
    }

    moveSectionDown(section) {
        const currentIndex = this.state.sections.indexOf(section);
        if (currentIndex < this.state.sections.length - 1) {
            const swapSection = this.state.sections[currentIndex + 1];
            this.swapSections(swapSection, section);
        }
    }

    render() {
        const contextActions = {
            edit: this.handleEditSectionClick,
            delete: this.handleDeleteSectionClick,
            translate: this.handleTranslateSectionClick,
            manage_grey_fields: this.handleSectionGreyFieldsClick,
            move_up: this.moveSectionUp,
            move_down: this.moveSectionDown,
        };

        const contextMenuIcons = {
            edit: 'edit',
            move_up: 'arrow_upward',
            move_down: 'arrow_downward',
            manage_grey_fields: 'do_not_disturb',
        };

        const contextActionChecker = (model, action) => {
            if (action === 'move_up') {
                return this.state.sections.indexOf(model) > 0;
            } else if (action === 'move_down') {
                return this.state.sections.indexOf(model) < this.state.sections.length - 1;
            }

            return true;
        };

        return this.state.sections === undefined ? <LoadingMask /> : (
            <div>
                <FormHeading schema="dataSet" groupName="dataSetSection">
                    {'section_management'}
                </FormHeading>
                <FormSubHeading>
                    {modelToEditStore.state.displayName}
                </FormSubHeading>
                <DataTable
                    columns={['name']}
                    rows={this.state.sections}
                    contextMenuActions={contextActions}
                    contextMenuIcons={contextMenuIcons}
                    primaryAction={contextActions.edit}
                    isContextActionAllowed={contextActionChecker}
                />
                <SectionDialog
                    open={!!this.state.editSectionModel}
                    sectionModel={this.state.editSectionModel}
                    categoryCombos={this.state.categoryCombos}
                    onRequestClose={() => { this.setState({ editSectionModel: false }); }}
                    onSaveSection={this.handleSectionSaved}
                />
                <GreyFieldDialog
                    open={!!this.state.greyFieldSectionModel}
                    sectionModel={this.state.greyFieldSectionModel}
                    onRequestClose={() => { this.setState({ greyFieldSectionModel: false }); }}
                    onRequestSave={this.handleSectionSaved}
                />
                {this.state.translationModel ? <TranslationDialog
                    objectToTranslate={this.state.translationModel}
                    objectTypeToTranslate={this.state.translationModel && this.state.translationModel.modelDefinition}
                    open={!!this.state.translationModel}
                    onTranslationSaved={this.handleTranslationSaved}
                    onTranslationError={this.handleTranslationErrored}
                    onRequestClose={() => { this.setState({ translationModel: null }); }}
                    fieldsToTranslate={['name']}
                /> : null }
                <div style={styles.fab}>
                    <FloatingActionButton onClick={this.handleAddSectionClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
            </div>
        );
    }
}

EditDataSetSections.propTypes = {
    params: PropTypes.any.isRequired,
};
EditDataSetSections.contextTypes = {
    d2: PropTypes.any.isRequired,
};

export default EditDataSetSections;
