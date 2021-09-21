import Store from 'd2-ui/lib/store/Store';
import { getInstance as getD2 } from 'd2/lib/d2';
import { Observable } from 'rxjs';
import isString from 'd2-utilizr/lib/isString';

export const requestParams = new Map([
    ['dataElement', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'dataElementGroups[id,name,dataElementGroupSet[id]]',
        ].join(','),
    }],
    ['legendSet', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'legends[id,name,displayName,startValue,endValue,color]',
        ].join(','),
    }],
    ['optionSet', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'options[id,name,displayName,code,style]',
        ].join(','),
    }],
    ['dataSet', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'categoryCombo[id,name]',
            'dataSetElements[id,dataSet[id],dataElement[id,displayName,categoryCombo[id,displayName]]',
            'categoryCombo[id,displayName]]',
            'indicators[id,displayName,categoryCombo[id,displayName]]',
            'organisationUnits[id,path]',
            'sections[:all,dataElements[id,displayName],categoryCombos[id,displayName],',
            'greyedFields[categoryOptionCombo[id,displayName],dataElement[id,displayName]]]',
        ].join(','),
    }],
    ['categoryOption', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'organisationUnits[id,path,displayName]',
        ].join(','),
    }],
    ['organisationUnitGroup', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'organisationUnits[id,path,displayName]',
        ].join(','),
    }],
    ['program', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'organisationUnits[id,path]',
            'dataEntryForm[:owner]',
            'programStages[:owner,notificationTemplates[displayName,:owner],nextScheduleDate[id,displayName]]',
            'notificationTemplates[:owner]',
        ].join(','),
    }],
    ['programIndicator', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'program[id,displayName,programType',
            'programTrackedEntityAttributes[id,trackedEntityAttribute[id,displayName,valueType]]]',
        ].join(','),
    }],
    ['programRule', {
        fields: [
            ':all',
            'program[id,displayName,programType]',
            'programRuleActions[:all',
            'templateUid',
            'dataElement[id,displayName]',
            'option[id,displayName]',
            'optionGroup[id,displayName]',
            'trackedEntityAttribute[id,displayName]',
            'programStage[id,displayName]',
            'programStageSection[id,displayName]]',
        ].join(','),
    }],
    ['optionGroup', {
        fields: [
            ':all',
            'attributeValues[:all,attribute[id,name,displayName]]',
            'options[id,name,displayName]'
        ].join(','),
    }],
]);

/**
 * Called when cloning through the context-menu
 *
 * Some objects may need special case handling when cloning,
 * and cannot be too generic - as some objects need new ID's for
 * nested objects (often the case with embedded objects),
 * and some should keep them (for shared references between objects).
 *
 * Ideally this should be done by the server.
 *
 * @param objectType to check for. ie. "indicator"
 * @param model of the objectType to use for the special case.
 * @returns {*} the model after its's processed by a special case or the original model.
 */
function cloneHandlerByObjectType(objectType, model) {
    switch(objectType) {
        case'programIndicator': {
            //Clear analyticsPeriodBoundaries ids, let server generate them
            model.analyticsPeriodBoundaries = model.analyticsPeriodBoundaries.map((a) => ({
                ...a,
                id: undefined
            }))
            return model;
        }
        default: 
            return model;
    }
}

function loadModelFromD2(objectType, objectId) {
    return getD2().then((d2) => {
        if (d2.models[objectType]) {
            return d2.models[objectType]
                .get(objectId, requestParams.get(objectType));
        }
        return Promise.reject('Invalid model');
    });
}

const singleModelStoreConfig = {
    getObjectOfTypeById({ objectType, objectId }) {
        return Observable.fromPromise(loadModelFromD2(objectType, objectId))
            .do((model) => {
                this.setState(model);
            });
    },

    getObjectOfTypeByIdAndClone({ objectType, objectId }) {
        const result = loadModelFromD2(objectType, objectId)
            .then((model) => {
                // Clear out the id to create a new model with the same data
                model.id = undefined;
                // Some objects also have a uuid property that should be cleared
                model.uuid = undefined;
                //let server handle created date
                model.created = undefined;
                // eslint-disable-next-line no-param-reassign
                model = cloneHandlerByObjectType(objectType, model);
                this.setState(model);
            });

        return Observable.fromPromise(result);
    },

    save() {
        // Save new locale entries via the extended ModelDefinition, not the model directly
        const importResultPromise = this.state.modelDefinition.name === 'locale' ?
            this.state.modelDefinition.save(this.state) :
            this.state.save(true);
        
        importResultPromise
            .then(response => response)
            .catch((response) => {
                if (isString(response)) {
                    return Promise.reject(response);
                }

                if (response.messages && response.messages.length > 0) {
                    return Promise.reject(response.messages[0].message);
                }

                if (response && response.response && response.response.errorReports && response.response.errorReports.length > 0) {
                    return Promise.reject(response.response.errorReports[0].message);
                }

                if (response && response.message) {
                    return Promise.reject(response.message);
                }

                return Promise.reject('Failed to save');
            });

        return Observable.fromPromise(importResultPromise);
    },
};

export default {
    create(config) {
        const storeConfig = Object.assign({}, singleModelStoreConfig, config || {});

        return Store.create(storeConfig);
    },
};
