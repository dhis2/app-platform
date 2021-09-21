const inputPattern = /<input.*?\/>/gi;

/* AttributeIdPattern is used in tracker-programs Custom registration forms
   programIdPattern is used in tracker-programs Custom registration forms
        Fixed to incidentDate and enrollmentDate
* id is used for combined-ids:
*   - Event-programs data entry form (dataElementId-categoryOptionId)
*   - Tracker-programs Data entry form (programStageId-dataElementId)*/
export const elementPatterns = {
    programid: /attributeid="(\w*?)"/,
    attributeid: /programid="(\w*?)"/,
    id: /id="(\w*?)-(\w*?)-val"/
}

//When matching with exec, match[0] will be idString, including the ID. Ie: attributeid="someid"
const allPatterns = /attributeid="(\w*?)"|programid="(\w*?)"|id="((\w*?)-(\w*?)-val)"/

//Map over the position of the match of the pattern in the allPattern.
//matchIndexes[attributeid] will be the id of the element matched.
const matchIndexes = {
    'attributeid': 1,
    'programid': 2,
    'id': 3,
}

export function generateHtmlForField(id, styleAttr, disabledAttr, label, nameAttr = "entryfield", fieldType='id') {
    const style = styleAttr ? ` style=${styleAttr}` : '';
    const disabled = disabledAttr ? ` disabled=${disabledAttr}` : '';
    const name = nameAttr ? `name="${nameAttr}"` : '';

    const attr = `${name} title="${label}" value="[ ${label} ]"${style}${disabled}`.trim();
    return `<input ${fieldType}="${id}" ${attr}/>`;

}

/* Operands with ID's that contain a dot ('.') are a combined IDs of two objects.
 The API returns ie. "dataElementId.categoryOptionId", which are transformed to the format expected by
 custom forms: "dataElementId-categoryOptionId-val"
    This is used for programStageId-dataElementId for Tracker-programs.
    And dataElementId-categoryOptionId for event-programs
 */
export function transformElementsToCustomForm(elements) {
    elements
        .filter(op => op.id.indexOf('.') !== -1)
        .reduce((out, op) => {
            const id = `${op.id.split('.').join('-')}-val`;
            out[id] = op.displayName; // eslint-disable-line
            return out;
        }, {});
}


/**
 * Gets the id and idString from a matched element.
 *
 *  The idString is the entire string to be used as a html-attribute.
 *  Ie. attributeid="IpHINAT79UW"
 *  The id is then "IpHINAT79UW".
 *
 * @param match the Regex-match object to use
 * @returns {*} an object with idString, id and fieldType of the element.
 */
function getFieldInfoFromMatch(match) {
    if(!match) return null;
    for(let patternId in matchIndexes) {
        const index = matchIndexes[patternId];
        const elemId = match[index];
        if(elemId) {
            let id = elemId;
            return {
                idString: match[0],
                id,
                fieldType: patternId
            }
        }
    }
    return null;
}

/**
 * Processes the formData and generates the output.
 * This is used when the form is loaded, and we parse through
 * the html and generate meta-data, like the ids used in the form.
 * @param formData to use (raw html)
 * @param elements elements that can be in the form. Object with
 * the shape of inputPattern: Name of element. Like: { kffjgj5kf12: Name, kggjgj5kf12: Gender  }
 * @returns {{usedIds: Array, outHtml: string}}
 */
export function processFormData(formData, elements) {
    const inHtml = formData;
    let outHtml = '';

    const usedIds = [];
    let inputElement = inputPattern.exec(inHtml);
    let inPos = 0;
    while (inputElement !== null) {
        outHtml += inHtml.substr(inPos, inputElement.index - inPos);
        inPos = inputPattern.lastIndex;
        const inputHtml = inputElement[0];
        const inputStyle = (/style="(.*?)"/.exec(inputHtml) || ['', ''])[1];
        const inputDisabled = /disabled/.exec(inputHtml) !== null;

        const allMatch = allPatterns.exec(inputHtml);
        const fieldInfo = getFieldInfoFromMatch(allMatch);

        if (fieldInfo && fieldInfo.idString && fieldInfo.id) {
            const { id, fieldType } = fieldInfo;
            usedIds.push(id);
            const label = elements && elements[id];
            const nameAttr = fieldType === "id" ? "entryfield" : null; //used for data-entry
            outHtml += generateHtmlForField(id, inputStyle, inputDisabled, label, nameAttr, fieldType);
        } else {
            outHtml += inputHtml;
        }

        inputElement = inputPattern.exec(inHtml);
    }
    outHtml += inHtml.substr(inPos);
    return {
        usedIds,
        outHtml
    }
}

/**
 * Helper to bind the keys of an object to given function
 * So that multiple elements can be bound to the same function.
 * The first parameter of each bound function will be the key.
 * @param obj Object with keys to bind
 * @param func Function to bind each key to
 * @param selfArg this context of the function
 * @param extraArgs An object of extra arguments
 * @returns {{}} - And object where each property is a bound function
 */
export function bindFuncsToKeys(obj, func, selfArg, extraArgs) {
    const boundFuncs = {};
    Object.keys(obj).forEach((x) => {
        boundFuncs[x] = func.bind(selfArg, x, extraArgs);
    });
    return boundFuncs;
}

export function insertElement(id, label, editor, fieldType = 'id') {
    const nameAttr = fieldType === "id" ? "entryfield" : null; //used for data-entry
    const elementHtml = generateHtmlForField(id, null, null, label, nameAttr, fieldType);
    editor.insertHtml(elementHtml, 'unfiltered_html');
    // Move the current selection to just after the newly inserted element
    const range = editor.getSelection().getRanges()[0];
    range && range.moveToElementEditablePosition(range.endContainer, true);
}

export function insertFlag(img, editor) {
    editor.insertHtml(`<img src="../dhis-web-commons/flags/${img}" />`, 'unfiltered_html');
    const range = editor.getSelection().getRanges()[0];
    range && range.moveToElementEditablePosition(range.endContainer, true);
}