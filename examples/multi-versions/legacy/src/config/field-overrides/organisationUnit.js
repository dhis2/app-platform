import { isStartDateBeforeEndDate } from 'd2-ui/lib/forms/Validators';
import OrgUnitSelectDialogField from '../../forms/form-fields/orgunit-select-dialog-field';
import GeometryField, { validators as GeometryValidators } from '../../forms/form-fields/geometry-field';
import { ImageSelect, ImageValidators } from '../../forms/form-fields/image-select';

export default new Map([
    [
        'image',
        {
            component: ImageSelect,
            validator: ImageValidators,
        }
    ],
    [
        'parent',
        {
            component: OrgUnitSelectDialogField,
            fieldOptions: {
                labelText: 'parent_organisation_unit',
            },
        },
    ],
    [
        'geometry', {
            component: GeometryField,
            validators: GeometryValidators,
        },
    ],
    [
        'openingDate', {
            validators: [{
                validator(value, formState) {
                    return isStartDateBeforeEndDate(value, formState.fields.closedDate.value);
                },
                message: 'closed_date_cannot_be_before_opening_date',
            }],
        },
    ],
    [
        'closedDate', {
            validators: [{
                validator(value, formState) {
                    return isStartDateBeforeEndDate(formState.fields.openingDate.value, value);
                },
                message: 'closed_date_cannot_be_before_opening_date',
            }],
        },
    ],
]);
