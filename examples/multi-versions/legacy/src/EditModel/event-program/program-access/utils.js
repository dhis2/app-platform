import { isEqual } from 'lodash/fp';

export const areSharingPropertiesSimilar = (a, b) => {
    if (a.publicAccess !== b.publicAccess) return false;
    if (!!a.externalAccess !== !!b.externalAccess) return false;

    const compareFunction = (a, b) => a.id < b.id;
    if (
        !isEqual(
            Array.sort(a.userAccesses || [], compareFunction),
            Array.sort(b.userAccesses || [], compareFunction),
        )
    ) {
        return false;
    }

    return isEqual(
        Array.sort(a.userGroupAccesses || [], compareFunction),
        Array.sort(b.userGroupAccesses || [], compareFunction),
    );
};

export const extractDisplayName = model => model.dataValues.displayName;

const getPublicAccessDescription = publicAccess => {
    if (publicAccess.substr(0, 4) === '----') return 'No public access';
    if (publicAccess.substr(0, 4) === 'rwrw') return 'Complete public access';

    let description = '';
    switch (publicAccess.substr(0, 2)) {
        case 'rw':
            description += 'Public metadata read- and write access';
            break;
        case 'r-':
            description += 'Public metadata read access';
            break;
        default:
            description += 'No public metadata access';
            break;
    }

    description = description += ', ';

    switch (publicAccess.substr(2, 2)) {
        case 'rw':
            return description + 'public data read- and write access';
        case 'r-':
            return description + 'public data read access';
        default:
            return description + 'no public data access';
    }
};

export const generateSharingDescription = ({ publicAccess, userGroupAccesses, userAccesses }) => {
    const publicAccessDescription = getPublicAccessDescription(publicAccess);
    const userGroupCount = userGroupAccesses ? userGroupAccesses.length : 0;
    const userCount = userAccesses ? userAccesses.length : 0;

    let description = publicAccessDescription;
    if (userCount || userGroupCount) {
        description += ', accessible to ';
        if (userCount) {
            const plural = userCount > 1 ? 's' : '';
            description += `${userCount} user${plural}`;
        }

        if (userGroupCount) {
            if (userCount) description += ' and ';

            const plural = userGroupCount > 1 ? 's' : '';
            description += `${userGroupCount} user group${plural}`;
        }
    }

    return description;
};
