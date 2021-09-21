
import React from 'react';
import PropTypes from 'prop-types';

import IconButton from 'material-ui/IconButton';
import { camelCaseToUnderscores } from 'd2-utilizr';

import inlineHelpMapping from '../config/inlinehelp-mapping.json';

function mappingPathExists(mappingKey) {
    return mappingKey && inlineHelpMapping[mappingKey];
}

/**
 * Returns the "version" of the documentation that corresponds with the current dhis2 version.
 *
 * @param {Object} version - The version definition as provided by d2.system.version.
 * @param {number} version.minor - The minor dhis2 version. e.g. The 25 in 2.25.
 * @param {boolean} version.snapshot - True when the current version is the snapshot(master/development) branch.
 *
 * @returns {string} `master` for a snapshot branch. `25` for 2.25 etc.
 */
function getDocsVersion({ major, minor, snapshot }) {
    if (snapshot) {
        return 'master';
    }
    return `${major}.${minor}`;
}

/** 
 * If ${placeholder} is found in mappingKey, it will be replaced with a matching name if 
 * present from variablesToReplace.  
 * 
 * Eg. for the mappingKey "/edit/otherSection/${objectType}" the placeholder objectType
 * will be found. If an entry in variablesToReplace exists objectType will be replaced 
 * with the value to this entry, say constant. This will result in the new path  "/edit/otherSection/constant".
 * If no match is found, the path will return.
 * 
 * @param {string} mappingKey The mapping that may have a placeholder to replace
 * @param {Map} variablesToReplace The variables that are to be replaced with the placeholder 
 *
 * @returns {string} The matched path with replaced placeholders if found
 */
function replacePlaceholder(mappingKey, variablesToReplace) {
    const placeholderRegex = /\$\{(.+?)\}/g;

    return mappingKey.replace(placeholderRegex, (match, variable) => {
        if (variablesToReplace.has(variable)) {
            return variablesToReplace.get(variable);
        }
        return '.+?';
    });
}

/** 
 * Checks if the mappingKeyPath with replaced placeholders matches the path were currently on.
 * 
 * @param {string} path The path to be matched with a mappingKey 
 * @param {Map} variablesToReplace The variables that are to be replaced with a placeholder 
 *
 * @returns {string} The matched mappingKey with replaced placeholders if found
 */
function replaceMappingPathPlaceholder(path, variablesToReplace) {
    return Object.keys(inlineHelpMapping)
        .find((mappingKey) => {
            const pathToMatch = replacePlaceholder(mappingKey, variablesToReplace);
            return (new RegExp(pathToMatch)).test(path);
        });
}

// Replaces the placeholders of the matched mappingKey url to create the complete partial help content path.
function getPartialHelpContentPath(replacedMappingPath, variablesToReplaceCamel) {
    if (mappingPathExists(replacedMappingPath)) {
        return replacePlaceholder(inlineHelpMapping[replacedMappingPath], variablesToReplaceCamel);
    }

    return '';
}

/**
 * Attempts to find a help link as defined in the inlinehelp-mapping.js It will always pick the first match that it finds. Help links should therefore be
 * sorted with the longer links first.
 * The search is done using a regular expression that matches the path from the start. This means that paths that are longer/dynamic can still show help links.
 *
 * For example a help link key that is defined as  `/edit/dataElementSection/dataElement` would show up on both `/edit/dataElementSection/dataElement/add` and `/edit/dataElementSection/dataElement/wap68IYzTXr`.
 *
 * @param {string} path The current path/route that the browser is on. This is the path that the help link should be used for.
 * @param {string} schema The name of the schema to find help for.
 *
 * @returns {string} The partial path that the refers to the help content in the documentation.  e.g. `/en/user/html/manage_org_unit.html`
 */
function findHelpLinkForPath(path, schema) {
    const variablesToReplace = new Map([['objectType', schema]]);
    const variablesToReplaceCamel = new Map([['objectType', camelCaseToUnderscores(schema)]]);

    const replacedMappingPath = replaceMappingPathPlaceholder(path, variablesToReplace);

    return getPartialHelpContentPath(replacedMappingPath, variablesToReplaceCamel);
}

export default function HelpLink({ schema }, { d2 }) {
    const path = window.location.hash
        .replace(/^#/, '') // Remove leading hash
        .replace(/\?.+?$/, ''); // Remove query param/cache breaker
    const docsLink = `https://docs.dhis2.org/${getDocsVersion(d2.system.version)}`;
    const helpLink = findHelpLinkForPath(path, schema);

    if (helpLink) {
        return (
            <IconButton
                href={`${docsLink}${helpLink}`}
                target="_blank"
                rel="noopener noreferrer"
                tooltip={d2.i18n.getTranslation('open_user_guide')}
                tooltipPosition="bottom-center"
                iconClassName="material-icons"
                iconStyle={{ top: -2 }}
            >
                help_outline
            </IconButton>
        );
    }

    return null;
}

HelpLink.propTypes = {
    schema: PropTypes.string.isRequired,
};

HelpLink.contextTypes = {
    d2: PropTypes.object,
};
