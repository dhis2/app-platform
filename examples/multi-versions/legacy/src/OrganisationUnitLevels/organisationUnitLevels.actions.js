import React, { PropTypes } from 'react';
import Action from 'd2-ui/lib/action/Action';
import { Observable, ReplaySubject } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import organisationUnitLevelsStore from './organisationUnitLevels.store';
import TextField from 'material-ui/TextField/TextField';
import SelectField from 'material-ui/SelectField/SelectField';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import fieldOrder from '../config/field-config/field-order';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';

const fieldForOrganisationUnitLevels = fieldOrder.for('organisationUnitLevel');

const actions = Action.createActionsFromNames(['initOrgUnitLevels', 'fieldUpdate', 'updateFormStatus', 'saveOrganisationUnitLevels']);

function DropDownFieldForOfflineLevels(props) {
    const { options, ...otherProps } = props;

    const availableOptions = [{ value: undefined, text: 'Default', label: ' ' }]
        .concat(options.map(option => ({ value: option, text: option, label: option })))
        .map((option, index) => (
            <MenuItem key={index} primaryText={option.text} value={option.value} label={option.label} />
        ));

    return (
        <SelectField {...otherProps} onChange={(event, index, value) => props.onChange({ target: { value } })}>
            {availableOptions}
        </SelectField>
    );
}

DropDownFieldForOfflineLevels.propTypes = {
    options: PropTypes.array,
};

const fieldOptions = new Map([
    ['name', {
        component: TextField,
    }],
    ['offlineLevels', {
        component: DropDownFieldForOfflineLevels,
        props: {
            options: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            ],
        },
    }],
]);

async function loadOrganisationUnitLevels() {
    const d2 = await getInstance();
    const api = d2.Api.getApi();

    return await api.get('filledOrganisationUnitLevels');
}

function isNameUnique(name) {
    return organisationUnitLevelsStore
        .state
        .fieldsForOrganisationUnitLevel
        .map(fieldConfigs => fieldConfigs
            .filter(fieldConfig => fieldConfig.name === 'name')
            .some(fieldConfig => fieldConfig.value === name)
        )
        .every(result => result === false);
}

async function getOrganisationUnitLevelFormFields() {
    const d2 = await getInstance();

    return fieldForOrganisationUnitLevels
        .map((fieldName) => {
            const fieldOption = fieldOptions.get(fieldName) || {};

            return {
                name: fieldName,
                component: fieldOption.component || TextField,
                props: Object.assign({
                    floatingLabelText: d2.i18n.getTranslation(camelCaseToUnderscores(fieldName)),
                }, fieldOption.props),
                validators: [{
                    validator: isNameUnique,
                    message: d2.i18n.getTranslation('value_not_unique'),
                }],
            };
        });
}

const organisationUnitLevelFormFields$ = Observable.fromPromise(getOrganisationUnitLevelFormFields());

function getFieldConfigsForAllFields(organisationUnitLevels, organisationUnitLevelFormFields) {
    return organisationUnitLevels
        .map((ouLevel) => {
            const result = organisationUnitLevelFormFields
                .map(fieldConfig => Object.assign({}, fieldConfig, { value: ouLevel[fieldConfig.name] }));

            result.organisationUnitLevel = ouLevel;
            return result;
        });
}

function buildFormStatus({ data }) {
    return organisationUnitLevelsStore
        .getState()
        .formStatus
        .map((status, index) => {
            if (index === data.levelIndex) {
                return data.formStatus.valid;
            }
            return status;
        });
}

actions.updateFormStatus
    .map(buildFormStatus)
    .subscribe((formStatusForAllLevels) => {
        organisationUnitLevelsStore.setState(Object.assign(
            {},
            organisationUnitLevelsStore.getState(),
            { formStatus: formStatusForAllLevels }
        ));
    });

actions.initOrgUnitLevels
    .flatMap(() => Observable.combineLatest(
        Observable.fromPromise(loadOrganisationUnitLevels()),
        organisationUnitLevelFormFields$,
        (organisationUnitLevels, organisationUnitLevelFormFields) => ({ organisationUnitLevels, organisationUnitLevelFormFields })
    ))
    .map(({ organisationUnitLevels, organisationUnitLevelFormFields }) => {
        const fieldConfigsForAllLevels = getFieldConfigsForAllFields(organisationUnitLevels, organisationUnitLevelFormFields);

        return {
            fieldConfigsForAllLevels,
            organisationUnitLevels,
        };
    })
    .subscribe(({ fieldConfigsForAllLevels, organisationUnitLevels }) => {
        organisationUnitLevelsStore.setState({
            isSaving: false,
            isLoading: false,
            fieldsForOrganisationUnitLevel: fieldConfigsForAllLevels,
            formStatus: fieldConfigsForAllLevels.map(() => true),
            organisationUnitLevels,
        });
    });

// FIXME: Weird solution to make an action usable with Observable.combineLatest. Also actions are never unsubscribed.
const fieldUpdateSubject$ = new ReplaySubject(1);
actions.fieldUpdate
    .subscribe(action => fieldUpdateSubject$.next(action));

Observable.combineLatest(
    fieldUpdateSubject$,
    organisationUnitLevelFormFields$,
    (action, organisationUnitLevelFormFields) => ({ action, organisationUnitLevelFormFields })
)
    .map(({ action, organisationUnitLevelFormFields }) => ({
        ...action.data,
        storeState: organisationUnitLevelsStore.getState(),
        organisationUnitLevelFormFields,
    }))
    .subscribe(({ storeState = { organisationUnitLevels: [] }, fieldName, fieldValue, organisationUnitLevel, organisationUnitLevelFormFields }) => {
        const organisationUnitToChangeValueFor = storeState.organisationUnitLevels
            .find(ouLevel => ouLevel === organisationUnitLevel);

        if (organisationUnitToChangeValueFor && fieldName) {
            organisationUnitToChangeValueFor[fieldName] = fieldValue;
        }

        organisationUnitLevelsStore.setState(Object.assign(
            {},
            storeState,
            {
                organisationUnitLevels: storeState.organisationUnitLevels,
                fieldsForOrganisationUnitLevel: getFieldConfigsForAllFields(storeState.organisationUnitLevels, organisationUnitLevelFormFields),
            }
        ));
    });

function saveOrganisationUnitLevels(action) {
    const { organisationUnitLevels, complete, error } = action;

    return getInstance()
        .then(d2 => d2.Api.getApi())
        .then(api => api.post('filledOrganisationUnitLevels', { organisationUnitLevels }, { dataType: 'text' }))
        .then(() => complete)
        .catch(() => error);
}

actions.saveOrganisationUnitLevels
    .map(action => ({
        organisationUnitLevels: organisationUnitLevelsStore
            .getState()
            .organisationUnitLevels
            .map(({ name, level, offlineLevels }) => ({ name, level, offlineLevels })),
        ...action,
    }))
    .do(() => {
        organisationUnitLevelsStore
            .setState({
                ...organisationUnitLevelsStore.getState(),
                isSaving: true,
            });
    })
    .flatMap(action => Observable.fromPromise(saveOrganisationUnitLevels(action)))
    .subscribe((callback) => {
        callback.call();
        actions.initOrgUnitLevels();
    });

export default actions;
