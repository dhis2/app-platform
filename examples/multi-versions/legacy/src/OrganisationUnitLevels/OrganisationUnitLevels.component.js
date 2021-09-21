import React, { PropTypes } from 'react';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import organisationUnitLevelsStore from './organisationUnitLevels.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import LinearProgress from 'material-ui/LinearProgress/LinearProgress';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import actions from './organisationUnitLevels.actions';
import IconButton from 'material-ui/IconButton/IconButton';
import Paper from 'material-ui/Paper/Paper';
import SaveButton from '../EditModel/SaveButton.component';
import FormButtons from '../EditModel/FormButtons.component';
import snackActions from '../Snackbar/snack.actions';
import Heading from 'd2-ui/lib/headings/Heading.component';
import TranslationDialog from 'd2-ui/lib/i18n/TranslationDialog.component';

function saveOrganisationUnitLevels(i18n) {
    actions.saveOrganisationUnitLevels()
        .subscribe(
            () => snackActions.show({ message: i18n.getTranslation('organisation_unit_levels_save_success') }),
            () => snackActions.show({ message: i18n.getTranslation('organisation_unit_levels_save_failed'), action: 'ok' })
        );
}

function OrganisationUnitLevels(props, context) {
    const canEdit = context.d2.currentUser.canUpdate(context.d2.models.organisationUnitLevel);

    if (props.isLoading) {
        return (
            <LinearProgress />
        );
    }

    const styles = {
        paperWrap: {
            padding: '4rem 5rem',
            maxWidth: 700,
            marginTop: '2rem',
        },
        rowStyle: {
            display: 'flex',
            flexDirection: 'row',
            height: '5rem',
        },
        formWrapStyle: {
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
        },
        fieldWrapStyle: {
            flex: 1,
            paddingRight: '1rem',
        },
        translateButtonWrap: {
            alignItems: 'flex-end',
            display: 'flex',
            flex: '5rem',
            height: '5rem',
            verticalAlign: 'middle',
        },
    };

    const fieldRows = props.fieldsForOrganisationUnitLevel.map((fieldsForLevel, index) => {
        let translateButton = null;
        if (fieldsForLevel.organisationUnitLevel.id && canEdit) {
            translateButton = (
                <div style={styles.translateButtonWrap}>
                    <IconButton iconClassName="material-icons" onClick={() => props.onTranslateClick(fieldsForLevel.organisationUnitLevel)}>translate</IconButton>
                </div>
            );
        }

        return (
            <div key={index} style={styles.rowStyle}>
                <FormBuilder
                    style={styles.formWrapStyle}
                    fieldWrapStyle={styles.fieldWrapStyle}
                    fields={fieldsForLevel.map(fieldConfig => ({
                        ...fieldConfig,
                        props: {
                            ...fieldConfig.props,
                            disabled: !canEdit,
                        },
                    }))}
                    onUpdateField={(fieldName, fieldValue) => {
                        actions.fieldUpdate({
                            organisationUnitLevel: fieldsForLevel.organisationUnitLevel,
                            fieldName,
                            fieldValue,
                        });
                    }}
                    onUpdateFormStatus={formStatus => actions.updateFormStatus({ levelIndex: index, formStatus })}
                />
                {translateButton}
            </div>
        );
    });

    return (
        <div>
            <Heading>{context.d2.i18n.getTranslation('organisation_unit_level_management')}</Heading>
            <Paper style={styles.paperWrap}>
                {fieldRows}
                <FormButtons>
                    {canEdit ? <SaveButton onClick={() => saveOrganisationUnitLevels(context.d2.i18n)} isValid={props.formStatus.every(v => v)} isSaving={props.isSaving} /> : []}
                </FormButtons>
            </Paper>
        </div>
    );
}
OrganisationUnitLevels.defaultProps = {
    fieldsForOrganisationUnitLevel: [],
    formStatus: [false],
    isLoading: true,
    isSaving: false,
};
OrganisationUnitLevels.propTypes = {
    fieldsForOrganisationUnitLevel: PropTypes.array,
    formStatus: PropTypes.array,
    isLoading: PropTypes.bool,
    isSaving: PropTypes.bool,
};

const componentState$ = organisationUnitLevelsStore;

const OrganisationUnitLevelsWithState = withStateFrom(componentState$, addD2Context(OrganisationUnitLevels));

export default addD2Context(class extends React.Component {
    constructor(...args) {
        super(...args);

        this.state = {
            translation: {
                open: false,
            },
        };

        this._onTranslateClick = this._onTranslateClick.bind(this);
        this._closeTranslationDialog = this._closeTranslationDialog.bind(this);
        this._translationSaved = this._translationSaved.bind(this);
        this._translationErrored = this._translationErrored.bind(this);
    }

    componentDidMount() {
        actions.initOrgUnitLevels();
    }

    render() {
        return (
            <div>
                <OrganisationUnitLevelsWithState onTranslateClick={this._onTranslateClick} />
                {this.state.translation.model ? <TranslationDialog
                    objectToTranslate={this.state.translation.model}
                    objectTypeToTranslate={this.state.translation.model && this.state.translation.model.modelDefinition}
                    open={this.state.translation.open}
                    onTranslationSaved={this._translationSaved}
                    onTranslationError={this._translationErrored}
                    onRequestClose={this._closeTranslationDialog}
                    fieldsToTranslate={['name']}
                /> : null }
            </div>
        );
    }

    _onTranslateClick(data) {
        const model = this.context.d2.models.organisationUnitLevel.create(data);

        this.setState({
            translation: {
                open: true,
                model,
            },
        });
    }

    _translationSaved() {
        snackActions.show({ message: this.context.d2.i18n.getTranslation('translation_saved') });
    }

    _translationErrored() {
        snackActions.show({ message: this.context.d2.i18n.getTranslation('translation_save_error'), action: 'ok' });
    }

    _closeTranslationDialog() {
        this.setState({
            translation: {
                open: false,
                model: undefined,
            },
        });
    }
});
