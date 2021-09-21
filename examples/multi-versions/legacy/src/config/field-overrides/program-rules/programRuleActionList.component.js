import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import DataTable from 'd2-ui/lib/data-table/DataTable.component';

import ProgramRuleActionDialog from './programRuleActionDialog.component';
import programRuleActionTypes from './programRuleActionTypes';

import snackActions from '../../../Snackbar/snack.actions';

class ProgramRuleActionsList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.d2 = context.d2;
        this.getTranslation = this.d2.i18n.getTranslation.bind(context.d2.i18n);
        this.addProgramRuleAction = this.addProgramRuleAction.bind(this);

        this.state = {
            dialogOpen: false,
            currentRuleActionModel: {},
            notificationTemplates: {
                byActionId: {},
                loaded: false,
            },
        };
    }
    componentDidMount() {
        this.loadProgramRuleActionTemplate();
    }

    /*
        Due to a change in the API, we cannot use field-filtering for notificationTemplates in a rule.
        It only returns an ID-string, so we need to load these manually
    */
    loadProgramRuleActionTemplate() {
        const programRuleActions = this.props.model[this.props.referenceProperty].toArray();

        const promises = programRuleActions
            .filter(action => action.templateUid)
            .map(action =>
                this.d2.models.programNotificationTemplates
                .get(action.templateUid)
                .then(notificationTemplate => ({
                    actionId: action.id,
                    id: notificationTemplate.id,
                    displayName: notificationTemplate.displayName,
                }))
            )

        // Once all rules with notificationTemplates are loaded, we consolidate the results to a state
        Promise.all(promises).then(results => {
            const byActionIdState = results.reduce((result, notificationTemplate) => ({
                ...result,
                [notificationTemplate.actionId]: {
                    ...notificationTemplate
                }
            }), {});
            this.setState({
                notificationTemplates: {
                    byActionId: byActionIdState,
                    loaded: true
                }
            })
        });
    }

    addProgramRuleAction() {
        this.setState({
            dialogOpen: true,
            currentRuleActionModel: Object.assign(
                this.d2.models.programRuleActions.create(),
                { programRule: { id: this.props.model.id } }
            ),
        });
    }

    editAction = (model) => {
        this.setState({
            dialogOpen: true,
            currentRuleActionModel: Object.assign(model.clone(), {
                dataElement: model.dataElement && model.dataElement.id || undefined,
                trackedEntityAttribute: model.trackedEntityAttribute && model.trackedEntityAttribute.id || undefined,
                programStage: model.programStage && model.programStage.id || undefined,
                programStageSection: model.programStageSection && model.programStageSection.id || undefined,
                option: model.option && model.option.id || undefined,
                optionGroup: model.optionGroup && model.optionGroup.id || undefined,
            }),
        });
    }

    deleteAction = (model) => {
        snackActions.show({
            message: this.getTranslation('confirm_delete_program_rule_action'),
            action: 'confirm',
            onActionTouchTap: () => {
                this.props.onChange({ target: { value: this.props.model.programRuleActions.remove(model) } });
                snackActions.show({ message: this.getTranslation('program_rule_action_deleted') });
            },
        });
    }

    onChangeMakeDirtyHandler = (...p) => {
        const event = p[0];

        this.props.onChange(...p);
        this.props.model.dirty = true;
    };

    handleRuleChange = (ruleAction) => {
        // Update the notificationTemplates with selected template
        if(ruleAction.notificationTemplate) {
            this.setState(state => ({
                notificationTemplates: {
                    ...state.notificationTemplates,
                    byActionId: {
                        ...state.notificationTemplates.byActionId,
                        [ruleAction.id]: ruleAction.notificationTemplate
                    }
                }
            }))
        }
    }

    render() {
        const programRuleActions = this.props.model[this.props.referenceProperty].toArray();

        const displayActions = programRuleActions.map((action) => {
            let actionDetails = action.programRuleActionType;
            let field;

            switch (action.programRuleActionType) {
            case 'SHOWWARNING':
            case 'SHOWERROR':
            case 'WARNINGONCOMPLETE':
            case 'ERRORONCOMPLETE':
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    (
                        action.programRuleActionType !== 'WARNINGONCOMPLETE' &&
                        action.programRuleActionType !== 'ERRORONCOMPLETE' &&
                        action.trackedEntityAttribute
                    ) ? `"${action.trackedEntityAttribute.displayName}"` : '',
                ].filter(s => s).map(s => s.trim()).join(', ');
                // NO BREAK!

            case 'DISPLAYTEXT':
            case 'DISPLAYKEYVALUEPAIR':
                if (!field && action.location) {
                    if (action.location === 'feedback') field = this.getTranslation('feedback_widget');
                    else if (action.location === 'indicators') field = this.getTranslation('program_indicator_widget');
                }
                field = field ? ` ${this.getTranslation('on')} ${field}` : '';
                const text = action.content ? (action.content.length > 25 ? `${action.content.substr(0, 22)}...` : action.content) : '';
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ` +
                    `"${text}"${field}`;
                break;

            case 'HIDEFIELD':
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.trackedEntityAttribute && `"${action.trackedEntityAttribute.displayName}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ${
                    field}`;
                break;

            case 'HIDESECTION':
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ` +
                    `"${action.programStageSection && action.programStageSection.displayName}"`;
                break;

            case 'HIDEPROGRAMSTAGE':
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ` +
                    `"${action.programStage && action.programStage.displayName}"`;
                break;

            case 'ASSIGN':
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.content && `"${action.content}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ` +
                    `"${action.data}" ${this.getTranslation('to_field')} ${field}`;
                break;

            case 'CREATEEVENT':
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)} ` +
                    `${this.getTranslation('in_program_stage')}: ` +
                    `${action.programStage && action.programStage.displayName}`;
                break;

            case 'SETMANDATORYFIELD':
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.trackedEntityAttribute && `"${action.trackedEntityAttribute.displayName}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ${
                    field}`;
                break;

            case 'SCHEDULEMESSAGE':
            case 'SENDMESSAGE': {
                const withDateString = action.data ? `${this.getTranslation('at_date')} "${action.data}"` : ''
                const actionId = action.id;
                const displayName = this.state.notificationTemplates.loaded &&
                    this.state.notificationTemplates.byActionId[actionId]
                        ? this.state.notificationTemplates.byActionId[actionId].displayName
                        : this.getTranslation('no_notification_template_specified');

                actionDetails = `${this.getTranslation(
                    programRuleActionTypes[action.programRuleActionType].label)
                }: ${displayName} ${withDateString}`;

                break;
            }

            case 'HIDEOPTION':
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.trackedEntityAttribute && `"${action.trackedEntityAttribute.displayName}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                const option = action.option && action.option.displayName;
                field = field ? `"${option}" ${this.getTranslation('on')} ${field}` : '';
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ${
                    field}`;
                break;

            case 'SHOWOPTIONGROUP': {
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.trackedEntityAttribute && `"${action.trackedEntityAttribute.displayName}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                const optionGrp = action.optionGroup && action.optionGroup.displayName;
                field = field ? `"${optionGrp}" ${this.getTranslation('on')} ${field}` : '';
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ${
                    field}`;
                break;
            }

            case 'HIDEOPTIONGROUP': {
                field = [
                    action.dataElement && `"${action.dataElement.displayName}"`,
                    action.trackedEntityAttribute && `"${action.trackedEntityAttribute.displayName}"`,
                ].filter(s => s).map(s => s.trim()).join(', ');
                const optionGrp = action.optionGroup && action.optionGroup.displayName;
                field = field ? `"${optionGrp}" ${this.getTranslation('on')} ${field}` : '';
                actionDetails = `${this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)}: ${
                    field}`;
                break;
                }

            default:
                actionDetails = action.programRuleActionType;
            }

            return Object.assign(action, {
                action: programRuleActionTypes.hasOwnProperty(action.programRuleActionType)
                    ? this.getTranslation(programRuleActionTypes[action.programRuleActionType].label)
                    : action.programRuleActionType,
                actionDetails,
            });
        });

        const styles = {
            wrap: Object.assign({
                marginTop: 16,
                marginBottom: 16,
                position: 'relative',
                width: '100%',
            }, this.props.style),
            fab: {
                position: 'absolute',
                right: 64,
                bottom: 0,
                zIndex: 1000,
            },
            note: {
                whiteSpace: 'nowrap',
                width: '100%',
                textOverflow: 'ellipsis',
                overflowX: 'hidden',
                fontStyle: 'italic',
            },
            b: {
                marginRight: 4,
            },
        };

        return (
            <div style={styles.wrap}>
                <div style={styles.fab}>
                    <FloatingActionButton onClick={this.addProgramRuleAction} disabled={this.props.disabled}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    columns={['actionDetails']}
                    rows={displayActions}
                    contextMenuActions={{
                        edit: this.editAction,
                        delete: this.deleteAction,
                    }}
                    primaryAction={this.editAction}
                />
                {this.state.dialogOpen &&
                    <ProgramRuleActionDialog
                        open={this.state.dialogOpen}
                        ruleActionModel={this.state.currentRuleActionModel}
                        program={this.props.model.program}
                        parentModel={this.props.model}
                        onRequestClose={() => this.setState({ dialogOpen: false })}
                        onChange={this.onChangeMakeDirtyHandler}
                        onUpdateRuleActionModel={this.handleRuleChange}
                    />
                }
            </div>
        );
    }
}

ProgramRuleActionsList.contextTypes = { d2: React.PropTypes.any };

ProgramRuleActionsList.propTypes = {
    referenceProperty: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
};

export default ProgramRuleActionsList;
