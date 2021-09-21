import DropDownAsyncGetter from '../../forms/form-fields/drop-down-async-getter';


async function getProgramDataElements(model, d2) {
    if (model && model.program && model.program.id) {
        const list = await d2.Api.getApi().get(['programs', model.program.id].join('/'), {
            fields: 'programStages[id,programStageDataElements[dataElement[id,displayName]]]',
        });

        return Object.values(list.programStages
            .filter((stage) => {
                // If a program stage is selected, AND the program rule type uses the program stage, only show
                // variables from the selected stage - otherwise show variables from all stages
                if (model.programStage &&
                    model.programStage.id &&
                    model.programRuleVariableSourceType === 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE') {
                    return stage.id === model.programStage.id;
                }
                return true;
            })
            .map(stage => stage.programStageDataElements.map(psde => psde.dataElement))
            .reduce((a, stage) => a.concat(stage), [])
            .reduce((o, de) => { o[de.id] = de; return o; }, {}))
            .map(de => ({ text: de.displayName, value: de.id, model: de }))
            .sort((a, b) => a.text.localeCompare(b.text));
    }

    return [];
}


async function getProgramStages(model, d2) {
    if (model && model.program && model.program.id) {
        const list = await d2.Api.getApi().get(['programs', model.program.id].join('/'), {
            fields: 'programStages[id,displayName]',
        });

        return list.programStages
            .map(stage => ({ text: stage.displayName, value: stage.id }))
            .sort((a, b) => a.text.localeCompare(b.text));
    }

    return [];
}


async function getProgramTrackedEntityAttributes(model, d2) {
    if (model && model.program && model.program.id) {
        const list = await d2.Api.getApi().get(['programs', model.program.id].join('/'), {
            fields: 'programTrackedEntityAttributes[displayName,trackedEntityAttribute[id]]',
        });

        return list.programTrackedEntityAttributes
            .map(tea => ({ text: tea.displayName, value: tea.trackedEntityAttribute.id }))
            .sort((a, b) => a.text.localeCompare(b.text));
    }

    return [];
}


function hasProgram(model) {
    return model && model.program && model.program.id;
}

function hasProgramAndMaybeStageToo(model) {
    return (model && model.program && model.program.id &&
        model.programRuleVariableSourceType !== 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE') ||
        (model.programStage && model.programStage.id);
}


export default new Map([
    ['name', {
        validators: [{
            message: 'this_field_can_only_contain_letters_numbers_space_dash_dot_and_underscore',
            validator(value) {
                return /^[\w _.-]+$/gim.test(value);
            },
        }],
    }],
    ['dataElement', {
        component: DropDownAsyncGetter,
        fieldOptions: {
            getter: getProgramDataElements,
            shouldRender: hasProgramAndMaybeStageToo,
        },
    }],
    ['trackedEntityAttribute', {
        component: DropDownAsyncGetter,
        fieldOptions: {
            getter: getProgramTrackedEntityAttributes,
            shouldRender: hasProgram,
        },
    }],
    ['programStage', {
        component: DropDownAsyncGetter,
        fieldOptions: {
            getter: getProgramStages,
            shouldRender: hasProgram,
        },
    }],
]);
