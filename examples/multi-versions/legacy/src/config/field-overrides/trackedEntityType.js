import AssignTrackedEntityTypeAttributes from './tracked-entity-type/AssignTrackedEntityTypeAttributes.component';
import { featureTypeOverride } from './program';

export default new Map([
    [
        'trackedEntityTypeAttributes',
        {
            component: AssignTrackedEntityTypeAttributes,
        },
    ],
    [
        'featureType',
        {
            fieldOptions: {
                options: featureTypeOverride
            },
        },
    ],
]);
