import { get, getOr, first, map, compose, groupBy, flatten, filter } from 'lodash/fp';

const importStatus = {
    OK: 'OK',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};

const extractErrorReports = compose(flatten, map(getOr([], 'objectReports')));
const fixUidIfNeeded = map((objectReport) => {
    const getUidFromErrorReports = compose(get('mainId'), first, filter(get('mainId')), getOr([], 'errorReports'));

    const id = getOr(getUidFromErrorReports(objectReport), 'uid', objectReport);

    return {
        ...objectReport,
        id,
        errors: compose(groupBy('errorProperty'), getOr([], 'errorReports'))(objectReport),
    };
});

const getErrorsPerObject = compose(fixUidIfNeeded, extractErrorReports);

export const getImportStatus = ({ status, typeReports = [], ...other }) => {
    const isOk = () => importStatus.OK === status;

    return {
        ...other,
        typeReports,
        status,
        isOk,
        errorsPerObject: getErrorsPerObject(typeReports),
    };
};
