import { combineEpics } from 'redux-observable';
import { getOr, get, has, map, compose, isEqual, includes, negate, filter, __ } from 'lodash/fp';
import { generateUid } from 'd2/lib/uid';
import { Observable } from 'rxjs';
import {
    PROGRAM_ATTRIBUTES_ADD, PROGRAM_ATTRIBUTES_REMOVE, PROGRAM_ATTRIBUTES_ADDREMOVE_COMPLETE,
    PROGRAM_ATTRIBUTES_EDIT, PROGRAM_ATTRIBUTES_EDIT_COMPLETE, PROGRAM_ATTRIBUTES_SET_ORDER
} from './actions';
import snackActions from "../../../../Snackbar/snack.actions";

const programAttributeExistsInAttributeUidList = uids => compose(includes(__, uids), get('trackedEntityAttribute.id'));
const keepProgramAttributesNotInUidList = uids => filter(negate(programAttributeExistsInAttributeUidList(uids)));

const addAttributeToProgram = store => action$ => action$
    .ofType(PROGRAM_ATTRIBUTES_ADD)
    .map((action) => {
        const state = store.getState();
        const program = getOr([], 'program', state);
        const programAttributes = getOr([], 'programTrackedEntityAttributes', program);
        const attributesIdsToAdd = getOr([], 'payload.attributes', action);
        
        // TODO: Simplify this once JIRA issue DHIS2-4207 is done
        // Currently simple saving failed for programAttributes that have a renderType
        // Saving in this case only works when a program.id and trackedEntityAttribute.id are provided
        let sortOrder = programAttributes.length;
        const attributesToAdd = map((id) => {
            sortOrder += 1;
            const { optionSet, valueType, displayName } = state.availableAttributes.find(attribute => attribute.id === id);
            return {
                id: generateUid(),
                trackedEntityAttribute: {
                    id,
                },
                program: {
                    id: program.id,
                },
                displayName: `${program.displayName} ${displayName}`,
                optionSet,
                valueType,
                sortOrder,
            };
        }, attributesIdsToAdd);
        program.programTrackedEntityAttributes = programAttributes.concat(attributesToAdd);
        store.setState({
            ...store.getState(),
            program,
        });
    })
    .mapTo({ type: PROGRAM_ATTRIBUTES_ADDREMOVE_COMPLETE });

const removeAttributeFromProgram = store => action$ => action$
    .ofType(PROGRAM_ATTRIBUTES_REMOVE)
    .map((action) => {
        const state = store.getState();
        const program = getOr([], 'program', state);
        const programAttributes = getOr([], 'programTrackedEntityAttributes', program);
        let attributeIdsToRemove = getOr([], 'payload.attributes', action)

        //Prevent removal of TEAs that are in selected TET
        if(has('trackedEntityType.trackedEntityTypeAttributes', program)) {
            const attributesInTet = program.trackedEntityType.trackedEntityTypeAttributes;
            const withoutTetAttrs = attributeIdsToRemove.filter(a => !attributesInTet
                .find(teta => teta.trackedEntityAttribute.id === a));

            if(attributeIdsToRemove.length !== withoutTetAttrs.length) {
                attributeIdsToRemove = withoutTetAttrs;
                snackActions.show({message: "cannot_remove_program_attribute_inherited_from_tet", translate: true})
            }
        }

        const removeAttributes = keepProgramAttributesNotInUidList(attributeIdsToRemove);

        program.programTrackedEntityAttributes = removeAttributes(programAttributes);
        store.setState({
            ...store.getState(),
            program,
        });
    })
    .mapTo({ type: PROGRAM_ATTRIBUTES_ADDREMOVE_COMPLETE });

const isObjectWithId = id => compose(isEqual(id), get('id'));

const editAttribute = store => action$ => action$
    .ofType(PROGRAM_ATTRIBUTES_EDIT)
    .map((action) => {
        const program = getOr([], 'program', store.getState());
        const programAttributes = getOr([], 'programTrackedEntityAttributes', program);

        const programAttributeId = get('payload.attribute.id', action);

        const programAttribute = programAttributes
            .find(isObjectWithId(programAttributeId));

        program.programTrackedEntityAttributes = programAttributes
            .map((attr) => {
                if (programAttribute === attr) {
                    return action.payload.attribute;
                }
                return attr;
            });

        store.setState({
            ...store.getState(),
            program,
        });
    })
    .mapTo({ type: PROGRAM_ATTRIBUTES_EDIT_COMPLETE });

const setAttributesOrder = store => action$ => action$
    .ofType(PROGRAM_ATTRIBUTES_SET_ORDER)
    .map((action) => {
        const { payload : { newOrderIds} } = action;
        const program = getOr([], 'program', store.getState());
        const programAttributes = getOr([], 'programTrackedEntityAttributes', program);
        const newAssignedAttributes = newOrderIds.map(teaId =>
            programAttributes.find(attribute => attribute.trackedEntityAttribute.id === teaId));
        program.programTrackedEntityAttributes = newAssignedAttributes;
        store.setState({
            ...store.getState(),
            program
        })

    })
    .flatMapTo(Observable.never())

export default function createEpicsForStore(store) {
    return combineEpics(
        addAttributeToProgram(store),
        removeAttributeFromProgram(store),
        editAttribute(store),
        setAttributesOrder(store)
    );
}
