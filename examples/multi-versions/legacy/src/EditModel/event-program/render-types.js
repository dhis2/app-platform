import React from 'react';
import { getOr, capitalize, } from 'lodash/fp';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export const DEFAULT = 'DEFAULT';
const LISTING = 'LISTING';
const SEQUENTIAL = 'SEQUENTIAL';
const MATRIX = 'MATRIX';
const DROPDOWN = 'DROPDOWN';
const VERTICAL_RADIOBUTTONS = 'VERTICAL_RADIOBUTTONS';
const HORIZONTAL_RADIOBUTTONS = 'HORIZONTAL_RADIOBUTTONS';
const VERTICAL_CHECKBOXES = 'VERTICAL_CHECKBOXES';
const HORIZONTAL_CHECKBOXES = 'HORIZONTAL_CHECKBOXES';
const SHARED_HEADER_RADIOBUTTONS = 'SHARED_HEADER_RADIOBUTTONS';
const ICONS_AS_BUTTONS = 'ICONS_AS_BUTTONS';
const SPINNER = 'SPINNER';
const ICON = 'ICON';
const TOGGLE = 'TOGGLE';
const VALUE = 'VALUE';
const SLIDER = 'SLIDER';
const LINEAR_SCALE = 'LINEAR_SCALE';

export const PROGRAM_STAGE_SECTION_RENDER_TYPES = [
    LISTING,
    SEQUENTIAL,
    MATRIX,
];

export const DEFAULT_PROGRAM_STAGE_RENDER_TYPE = LISTING;

export const DATA_ELEMENT_AND_TRACKED_ENTITY_ATTRIBUTE_RENDER_TYPES = [
    DEFAULT,
    DROPDOWN,
    VERTICAL_RADIOBUTTONS,
    HORIZONTAL_RADIOBUTTONS,
    VERTICAL_CHECKBOXES,
    HORIZONTAL_CHECKBOXES,
    SHARED_HEADER_RADIOBUTTONS,
    ICONS_AS_BUTTONS,
    SPINNER,
    ICON,
    TOGGLE,
    VALUE,
    SLIDER,
    LINEAR_SCALE,
];

export const MOBILE = 'MOBILE';
export const DESKTOP = 'DESKTOP';

export const DATA_ELEMENT_CLAZZ = 'org.hisp.dhis.program.ProgramStageDataElement';
export const TRACKED_ENTITY_ATTRIBUTE_CLAZZ = 'org.hisp.dhis.program.ProgramTrackedEntityAttribute';

export function getRenderTypeOptions(renderSubject, clazz, renderingOptions) {
    const subjectRenderOptions = renderingOptions.find((option) => {
        const clazzMatch = option.clazz === clazz;

        if (renderSubject.optionSet) {
            return clazzMatch && Boolean(option.hasOptionSet);
        }

        return clazzMatch && option.valueType === renderSubject.valueType;
    });
    return subjectRenderOptions ? subjectRenderOptions.renderingTypes : ['DEFAULT'];
}

const createRenderTypeChangeHandler = (device, target, changeHandler) => (_event, _index, renderType) => {
    const newState = {
        ...target,
        renderType: {
            ...target.renderType,
            [device]: {
                type: renderType,
            },
        },
    };
    changeHandler(newState);
};

const getComputedStyle = (device, inDialog) => {
    if (inDialog && device === MOBILE) {
        return { marginRight: '1rem' };
    }

    if (inDialog && device === DESKTOP) {
        return {};
    }
    // Not very elegant, but it does reduce the amount by which the SelectField
    // increases the table row height
    return {
        marginTop: '-20px',
        marginBottom: '-20px',
    };
};

const RenderTypeSelectField = ({ device, target, options, changeHandler, inDialog }, { d2 }) => {
    const props = {
        floatingLabelText: inDialog ? d2.i18n.getTranslation(`render_type_${device.toLowerCase()}`) : ' ',
        value: getOr(DEFAULT, `renderType.${device}.type`, target),
        onChange: createRenderTypeChangeHandler(device, target, changeHandler),
        fullWidth: !inDialog,
        style: getComputedStyle(device, inDialog),
        dropDownMenuProps: inDialog ? {} : { autoWidth: true },
    };

    return (
        <SelectField {...props}>
            { options.map(option => (
                <MenuItem
                    key={option}
                    value={option}
                    primaryText={capitalize(option).replace(/_/g, ' ')}
                />
            )) }
        </SelectField>
    );
};

RenderTypeSelectField.propTypes = {
    device: PropTypes.string.isRequired,
    target: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
    changeHandler: PropTypes.func.isRequired,
    inDialog: PropTypes.bool,
};

RenderTypeSelectField.contextTypes = {
    d2: PropTypes.object,
};

RenderTypeSelectField.defaultProps = {
    inDialog: false,
};

export default RenderTypeSelectField;

