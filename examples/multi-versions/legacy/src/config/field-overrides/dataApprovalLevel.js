import DropDownAsyncGetter from '../../forms/form-fields/drop-down-async-getter';

async function getOrgUnitLevels(model, d2) {
    const list = await d2.models.organisationUnitLevels.list({
        order: 'level:asc',
    });

    return list.toArray().map(level => ({
        text: level.displayName,
        value: level.level,
    }));
}

export default new Map([
    ['orgUnitLevel', {
        component: DropDownAsyncGetter,
        persisted: true,
        fieldOptions: {
            getter: getOrgUnitLevels,
            useValueDotId: false,
        },
    }],
]);
