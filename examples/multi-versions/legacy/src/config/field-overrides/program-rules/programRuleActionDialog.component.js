import { getInstance } from 'd2/lib/d2';
import React from 'react';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import DropDown from '../../../forms/form-fields/drop-down';
import TextField from '../../../forms/form-fields/text-field';
import programRuleActionTypes from './programRuleActionTypes';
import ProgramRuleConditionField from './programRuleConditionField.component';
import snackActions from '../../../Snackbar/snack.actions';
import RefreshMask from '../../../forms/form-fields/helpers/RefreshMask.component';
import sortBy from 'lodash/fp/sortBy';
import { ExpressionStatus } from '../program-indicator/ExpressionStatusIcon';

function toDisplay(element) {
    return {
        value: element.id,
        text: element.displayName,
        model: element,
    };
}

function shouldLoadOptions(ruleAction) {
    const actionTypesWithOptionSetFilter = ['HIDEOPTION'];
    return (
        ruleAction &&
        ruleAction.programRuleActionType &&
        actionTypesWithOptionSetFilter.includes(
            ruleAction.programRuleActionType
        )
    );
}

function shouldLoadOptionGroups(ruleAction) {
    const actionTypesWithOptionSetFilter = [
        'SHOWOPTIONGROUP',
        'HIDEOPTIONGROUP',
    ];
    return (
        ruleAction &&
        ruleAction.programRuleActionType &&
        actionTypesWithOptionSetFilter.includes(
            ruleAction.programRuleActionType
        )
    );
}

//helper to know if dataElements/teas needs to be filtered on being related to an optionSet
function shouldFilterOnOptionSet(ruleAction) {
    const actionTypesWithOptionSetFilter = [
        'HIDEOPTION',
        'SHOWOPTIONGROUP',
        'HIDEOPTIONGROUP',
    ];
    return (
        ruleAction &&
        ruleAction.programRuleActionType &&
        actionTypesWithOptionSetFilter.includes(
            ruleAction.programRuleActionType
        )
    );
}

const DropdownWithLoading = ({ loading, ...props }) => {
    //only pass display none
    const style = {
        display: props.style.display === 'none' ? 'none' : undefined,
    };
    return (
        <div style={style}>
            {loading && <RefreshMask />}
            <DropDown {...props} />
        </div>
    );
};

class ProgramRuleActionDialog extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            programRuleAction: this.props.ruleActionModel,
            loading: true,
            status: null,
        };

        this.d2 = context.d2;
        this.getTranslation = this.d2.i18n.getTranslation.bind(this.d2.i18n);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        if (this.props.program && this.props.program.id) {
            const afterLoaders = [
                this.state.programRuleAction.option
                    ? this.optionsDropdownGetter
                    : null,
                this.state.programRuleAction.optionGroup
                    ? this.optionGroupDropdownGetter
                    : null,
            ].filter(loader => loader);
            Promise.all([
                this.d2.models.programs.get(this.props.program.id, {
                    fields: [
                        'programStages[id,displayName',
                        'programStageSections[id,displayName]',
                        'notificationTemplates[id,displayName]',
                        'programStageDataElements[id,dataElement[id,displayName,optionSet]]]',
                        'notificationTemplates[displayName,id]',
                    ].join(','),
                }),
                this.d2.models.programs.get(this.props.program.id, {
                    fields:
                        'programTrackedEntityAttributes[id,trackedEntityAttribute[id,displayName,optionSet]]',
                }),
                this.d2.models.programRuleVariables.list({
                    filter: `program.id:eq:${this.props.program.id}`,
                    fields: 'id,displayName,programRuleVariableSourceType',
                    paging: false,
                }),
            ])
                .then(
                    ([
                        wrappedUpDataElements,
                        wrappedUpTrackedEntityAttributes,
                        programVariables,
                    ]) => {
                        const programDataElements = Object.values(
                            wrappedUpDataElements.programStages
                                .toArray()
                                .map(stage =>
                                    stage.programStageDataElements.map(
                                        psde => psde.dataElement
                                    )
                                )
                                .reduce((a, s) => a.concat(s), [])
                                .reduce((o, de) => {
                                    o[de.id] = de;
                                    return o;
                                }, {})
                        )
                            .map(toDisplay)
                            .sort((a, b) => a.text.localeCompare(b.text));

                        const programSections = wrappedUpDataElements.programStages
                            .toArray()
                            .reduce(
                                (a, s) =>
                                    a.concat(s.programStageSections.toArray()),
                                []
                            )
                            .map(toDisplay)
                            .sort((a, b) => a.text.localeCompare(b.text));

                        const programStages = wrappedUpDataElements.programStages
                            .toArray()
                            .map(toDisplay)
                            .sort((a, b) => a.text.localeCompare(b.text));

                        const programTrackedEntityAttributes = wrappedUpTrackedEntityAttributes.programTrackedEntityAttributes
                            .map(ptea => ({
                                text: ptea.trackedEntityAttribute.displayName,
                                value: ptea.trackedEntityAttribute.id,
                                model: ptea.trackedEntityAttribute,
                            }))
                            .sort((a, b) => a.text.localeCompare(b.text));

                        const programNotificationTemplates = wrappedUpDataElements.notificationTemplates
                            .toArray()
                            .map(toDisplay);

                        const programStagesNotificationTemplates = wrappedUpDataElements.programStages
                            .toArray()
                            .reduce(
                                (a, b) =>
                                    a.concat(b.notificationTemplates.toArray()),
                                []
                            )
                            .map(toDisplay);

                        let notificationTemplates = programStagesNotificationTemplates
                            .concat(programNotificationTemplates)
                            .sort((a, b) => a.text.localeCompare(b.text));

                        const dedupe = function dedupe(arr) {
                            return [...new Set([].concat(...arr))];
                        };

                        notificationTemplates = dedupe(notificationTemplates);

                        this.setState({
                            programStages,
                            programSections,
                            programDataElements,
                            programTrackedEntityAttributes,
                            programVariables: programVariables
                                .toArray()
                                .map(v => {
                                    const sign =
                                        v.programRuleVariableSourceType ===
                                        'TEI_ATTRIBUTE'
                                            ? 'A'
                                            : '#';
                                    return {
                                        text: `${sign}{${v.displayName}}`,
                                        value: `${sign}{${v.displayName}}`,
                                    };
                                }),
                            notificationTemplates,
                            options: [],
                            optionGroups: [],
                            loading: afterLoaders.length > 0 || false,
                            programRuleAction: this.state.programRuleAction,
                        });
                    }
                )
                .then(() => Promise.all(afterLoaders.map(func => func())))
                .catch(err => {
                    this.props.onRequestClose();
                    snackActions.show({
                        message: `Error: ${err}`,
                        action: 'ok',
                    });
                });
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.programRuleAction) {
            this.setState({
                programRuleAction: newProps.ruleActionModel,
            });
        }
    }

    async save() {
        const programRuleAction = this.state.programRuleAction;

        // Fancily translate from DropDown format to DataTable format - consistency is for sheeple
        const fieldRefs = {
            dataElement: this.state.programDataElements,
            trackedEntityAttribute: this.state.programTrackedEntityAttributes,
            programStage: this.state.programStages,
            programStageSection: this.state.programSections,
            templateUid: this.state.notificationTemplates,
            option: this.state.options,
            optionGroup: this.state.optionGroups,
        };
        Object.keys(fieldRefs).forEach(field => {
            if (programRuleAction[field]) {
                const ref = fieldRefs[field].find(
                    v => v.value === programRuleAction[field]
                );
                if (ref) {
                    if (field === 'templateUid') {
                        // just use the id, instead of object reference and update
                        // notificationTemplate in the programRuleActionList
                        programRuleAction.notificationTemplate = {
                            id: ref.value,
                            displayName: ref.text,
                        };
                    } else {
                        programRuleAction[field] = {
                            id: ref.value,
                            displayName: ref.text,
                        };
                    }
                }
            } else {
                programRuleAction[field] = undefined;
            }
        });

        if (programRuleAction.id) {
            // <hack>
            // TODO: Add support for modifying an existing member of a ModelCollectionProperty in d2
            this.props.parentModel.programRuleActions.set(
                programRuleAction.id,
                programRuleAction
            );
            this.props.parentModel.programRuleActions.dirty = true;
            // </hack>
            this.props.onUpdateRuleActionModel(programRuleAction);
            this.props.onChange({
                target: { value: this.props.parentModel.programRuleActions },
            });
            this.props.onRequestClose();
        } else {
            const newUid = await this.d2.Api.getApi().get('/system/id');
            this.props.parentModel.programRuleActions.add(
                Object.assign(programRuleAction, { id: newUid.codes[0] })
            );
            this.props.onUpdateRuleActionModel(programRuleAction);
            this.props.onChange({
                target: { value: this.props.parentModel.programRuleActions },
            });
            this.props.onRequestClose();
        }
    }

    update(fieldName, value) {
        if (fieldName === 'data') {
            if (!value) {
                /**
                 * The backend will throw an error when validating without an expression. Since
                 * it does not make sense to validate something that isn't there, we're omitting
                 * validation when the expression is absent.
                 */

                this.setState({ status: null })
            } else {
                this.validate(value);
            }
        }

        const ruleAction = this.state.programRuleAction;
        ruleAction[fieldName] = value;

        //Fetch options for dataElement and trackedEntityAttribute
        if (
            shouldFilterOnOptionSet(ruleAction) &&
            ['dataElement', 'trackedEntityAttribute'].includes(fieldName)
        ) {
            if (shouldLoadOptions(ruleAction)) {
                this.optionsDropdownGetter();
            }
            if (shouldLoadOptionGroups(ruleAction)) {
                this.optionGroupDropdownGetter();
            }
        }

        this.setState({
            programRuleAction: ruleAction,
        });
    }

    async validate(expression) {
        const api = this.d2.Api.getApi();

        if (!this.props.program || !this.props.program.id) {
            return;
        }

        const pendingStatus = {
            status: ExpressionStatus.PENDING,
            message: this.getTranslation('checking_expression_status'),
        };
        this.setState(prevState => ({
            ...prevState,
            status: pendingStatus,
        }));

        const programId = this.props.program.id;
        const url = `programRuleActions/data/expression/description?programId=${programId}`;
        const requestOptions = {
            headers: {
                'Content-Type': 'text/plain',
            },
        };

        try {
            const { status, description, message } = await api.post(
                url,
                expression,
                requestOptions
            );

            const newStatus = {
                status:
                    status === 'OK'
                        ? ExpressionStatus.VALID
                        : ExpressionStatus.INVALID,
                message,
                details: description,
            };

            this.setState(prevState => ({
                ...prevState,
                status: newStatus,
            }));
        } catch (error) {
            const fallback = this.getTranslation(
                'program_rule_action_fallback_error_message'
            );
            const newStatus = {
                status: ExpressionStatus.INVALID,
                message: error.message || fallback,
                details: error.description,
            };

            this.setState(prevState => ({
                ...prevState,
                status: newStatus,
            }));
        }
    }

    getRelatedOptionSetFromSelected = () => {
        const ruleAction = this.state.programRuleAction;
        const selectedDEId = ruleAction.dataElement;
        const seleactedTeaId = ruleAction.trackedEntityAttribute;

        if (
            (!selectedDEId && !seleactedTeaId) ||
            (selectedDEId &&
                !selectedDEId.model &&
                (seleactedTeaId && !seleactedTeaId.model))
        ) {
            return null;
        }
        let relatedOptionSet;
        //Get the optionSet that is related to either dataElement or trackedEntityAttribute
        if (ruleAction.dataElement) {
            const relatedToOptionSetID = ruleAction.dataElement;
            const dataElement = this.state.programDataElements.find(
                d => d.model.id === relatedToOptionSetID
            );
            relatedOptionSet = dataElement.model.optionSet;
        } else if (ruleAction.trackedEntityAttribute) {
            const relatedToOptionSetID = ruleAction.trackedEntityAttribute;
            const teaObj = this.state.programTrackedEntityAttributes.find(
                d => d.model.id === relatedToOptionSetID
            );
            relatedOptionSet = teaObj.model.optionSet;
        }
        return relatedOptionSet;
    };

    optionsDropdownGetter = async () => {
        let relatedOptionSet = this.getRelatedOptionSetFromSelected();
        if (!relatedOptionSet) return null;
        //load options related to optionSet
        this.setState({ loading: true });
        const options = await this.d2.models.options.list({
            fields: 'id,displayName',
            filter: `optionSet.id:eq:${relatedOptionSet.id}`,
            paging: false,
        });
        const withDisplay = options.toArray().map(toDisplay);
        this.setState({ options: withDisplay, loading: false });
        return withDisplay;
    };

    optionGroupDropdownGetter = async () => {
        let relatedOptionSet = this.getRelatedOptionSetFromSelected();
        if (!relatedOptionSet) return null;
        //load optiongroups related to optionSet
        this.setState({ loading: true });
        const optionGroups = await this.d2.models.optionGroup.list({
            fields: 'id,displayName,options[id,optionSet]',
            filter: `options.optionSet.id:eq:${relatedOptionSet.id}`,
            paging: false,
        });
        const withDisplay = optionGroups.toArray().map(toDisplay);
        this.setState({ optionGroups: withDisplay, loading: false });
        return withDisplay;
    };

    getFilteredByOptionSetOrAll(models) {
        if (!models) return [];
        const ruleAction = this.state.programRuleAction;
        if (shouldFilterOnOptionSet(ruleAction)) {
            const filtered = models.filter(
                elem => elem.model && elem.model.optionSet
            );
            return filtered;
        }
        return models;
    }

    render() {
        const modelDefinition = this.d2.models.programRuleActions;
        const ruleActionModel = this.state.programRuleAction;
        const currentActionType = ruleActionModel.programRuleActionType;
        const fieldMapping = programRuleActionTypes[currentActionType];

        const fieldConfig = [
            {
                name: 'programRuleActionType',
                component: DropDown,
                props: {
                    labelText: `${this.getTranslation('action')} (*)`,
                    fullWidth: true,
                    options: sortBy(
                        'text',
                        modelDefinition.modelProperties.programRuleActionType.constants
                            .filter(
                                o =>
                                    programRuleActionTypes[o] &&
                                    (o !== 'CREATEEVENT' ||
                                        (ruleActionModel.id !== undefined &&
                                            ruleActionModel.programRuleActionType ===
                                                'CREATEEVENT'))
                            )
                            .map(o => ({
                                text: this.getTranslation(
                                    programRuleActionTypes[o].label
                                ),
                                value: o,
                            }))
                    ),
                    value: ruleActionModel.programRuleActionType,
                    isRequired: true,
                },
            },
            {
                name: 'location',
                component: DropDown,
                props: {
                    labelText: this.getTranslation('display_widget'),
                    value: ruleActionModel.location,
                    options: [
                        {
                            text: this.getTranslation('feedback_widget'),
                            value: 'feedback',
                        },
                        {
                            text: this.getTranslation(
                                'program_indicator_widget'
                            ),
                            value: 'indicators',
                        },
                    ],
                    fullWidth: true,
                },
            },
            {
                name: 'dataElement',
                component: DropDown,
                props: {
                    labelText: this.getTranslation('data_element'),
                    options:
                        (this.state &&
                            this.getFilteredByOptionSetOrAll(
                                this.state.programDataElements
                            )) ||
                        [],
                    value: ruleActionModel.dataElement,
                    fullWidth: true,
                    disabled:
                        shouldFilterOnOptionSet(ruleActionModel) &&
                        !!ruleActionModel.trackedEntityAttribute,
                },
            },
            {
                name: 'trackedEntityAttribute',
                component: DropDown,
                props: {
                    labelText: this.getTranslation('tracked_entity_attribute'),
                    options:
                        (this.state &&
                            this.getFilteredByOptionSetOrAll(
                                this.state.programTrackedEntityAttributes
                            )) ||
                        [],
                    value: ruleActionModel.trackedEntityAttribute,
                    style: {
                        display: ruleActionModel.trackedEntityAttribute
                            ? 'inline-block'
                            : 'none',
                    },
                    fullWidth: true,
                    disabled:
                        shouldFilterOnOptionSet(ruleActionModel) &&
                        !!ruleActionModel.dataElement,
                },
            },
            {
                name: 'programStage',
                component: DropDown,
                props: {
                    labelText: this.getTranslation('program_stage'),
                    options: (this.state && this.state.programStages) || [],
                    value: ruleActionModel.programStage,
                    fullWidth: true,
                },
            },
            {
                name: 'programStageSection',
                component: DropDown,
                props: {
                    labelText: this.getTranslation('program_stage_section'),
                    options: (this.state && this.state.programSections) || [],
                    value: ruleActionModel.programStageSection,
                    disabled:
                        !this.state.programSections ||
                        this.state.programSections.length === 0,
                    fullWidth: true,
                },
            },
            {
                name: 'content',
                component:
                    currentActionType === 'ASSIGN' ? DropDown : TextField,
                props: {
                    labelText: this.getTranslation('content'),
                    value: ruleActionModel.content,
                    fullWidth: true,
                    options:
                        currentActionType === 'ASSIGN'
                            ? this.state.programVariables
                            : undefined,
                },
            },
            {
                name: 'data',
                component: ProgramRuleConditionField,
                props: {
                    labelText: this.getTranslation('data'),
                    value: ruleActionModel.data,
                    fullWidth: true,
                    hideOperators: true,
                    quickAddLink: false,
                    status: this.state.status,
                },
            },
            {
                name: 'templateUid',
                component: DropDown,
                props: {
                    labelText: this.getTranslation(
                        'program_notification_template'
                    ),
                    options:
                        (this.state && this.state.notificationTemplates) || [],
                    value: ruleActionModel.templateUid,
                    disabled:
                        !this.state.notificationTemplates ||
                        this.state.notificationTemplates === 0,
                    fullWidth: true,
                },
            },
            {
                name: 'option',
                component: DropdownWithLoading,
                props: {
                    labelText: this.getTranslation('option_to_hide'),
                    fullWidth: true,
                    value: ruleActionModel.option,
                    options: this.state.options,
                    disabled: !this.state.options,
                    loading: this.state.loading,
                },
            },
            {
                name: 'optionGroup',
                component: DropdownWithLoading,
                props: {
                    labelText: this.getTranslation('option_group'),
                    fullWidth: true,
                    value: ruleActionModel.optionGroup,
                    options: this.state.optionGroups,
                    disabled: !this.state.optionGroups,
                    loading: this.state.loading,
                },
            },
        ]
            .map(field => {
                if (field.name !== 'programRuleActionType') {
                    const isRequired =
                        fieldMapping &&
                        fieldMapping.required &&
                        fieldMapping.required.includes(field.name);

                    const isOptional =
                        fieldMapping &&
                        fieldMapping.optional &&
                        fieldMapping.optional.includes(field.name);

                    if (isOptional || isRequired) {
                        field.props.style = { display: 'inline-block' };
                        if (isRequired) {
                            field.props.isRequired = true;
                            field.props.labelText += ' (*)';
                        }
                    } else {
                        field.props.style = { display: 'none' };
                    }
                }
                return field;
            })
            .map(field => {
                if (
                    fieldMapping &&
                    fieldMapping.labelOverrides &&
                    fieldMapping.labelOverrides[field.name]
                ) {
                    field.props.labelText = this.getTranslation(
                        fieldMapping.labelOverrides[field.name]
                    );
                }

                return field;
            });

        return (
            <Dialog
                open={this.props.open}
                onRequestClose={this.props.onRequestClose}
                title={this.getTranslation('define_program_rule_action')}
                autoScrollBodyContent
                actionsContainerStyle={{ marginTop: 0 }}
                titleStyle={{ marginBottom: 0 }}
                actions={[
                    <FlatButton
                        label={this.getTranslation('cancel')}
                        style={{ marginRight: 16 }}
                        onClick={this.props.onRequestClose}
                    />,
                    <RaisedButton
                        label={this.getTranslation('commit')}
                        primary
                        onClick={this.save}
                    />,
                ]}
            >
                {this.state.programDataElements ? (
                    <FormBuilder
                        fields={fieldConfig}
                        onUpdateField={this.update}
                    />
                ) : (
                    <div>Loading...</div>
                )}
            </Dialog>
        );
    }
}

ProgramRuleActionDialog.contextTypes = { d2: React.PropTypes.any };

ProgramRuleActionDialog.propTypes = {
    open: React.PropTypes.bool.isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    onUpdateRuleActionModel: React.PropTypes.func.isRequired,
    program: React.PropTypes.object.isRequired,
    ruleActionModel: React.PropTypes.object.isRequired,
};

export default ProgramRuleActionDialog;
