
/* Map to translate constants to something else in the UI.
*  Structured so that the same constant in one model may be translated
*  independently of others.
*  The constant should map to the i18n translation key*/

const constantDisplayNameMap= {
    'program': { //model
        'programType': { //field
            'WITH_REGISTRATION': 'TRACKER_PROGRAM', //map model name to a new displayname
            'WITHOUT_REGISTRATION': 'EVENT_PROGRAM'
        }
    },
    'programStageNotificationTemplate': {
        'notificationTrigger': {
            'COMPLETION': 'program_stage_completion',
        }
    },
    'programNotificationTemplate': {
        'notificationTrigger': {
            'COMPLETION': 'program_completion',
            'ENROLLMENT': 'program_enrollment'
        }
    }
}

/**
 * Used to translate constants from a model to
 * something else in the UI.
 * The value returned should later be translated by i18n.
 *
 * Useful when we have e.g "WITH_REGISTRATION" in the model
 * but want to show "Tracker program" in the UI.
 *
 * @param modelType - Modeltype that the constant should be translated for
 * @param fieldName
 * @param constantVal
 * @returns {*} The "mapped" value of the constant, or the constant not found in the  not exist
 */
export function constantNameConverter(modelType, fieldName, constantVal) {
    return constantDisplayNameMap[modelType] && constantDisplayNameMap[modelType][fieldName] &&
        constantDisplayNameMap[modelType][fieldName][constantVal] || constantVal;
}

export default constantNameConverter;