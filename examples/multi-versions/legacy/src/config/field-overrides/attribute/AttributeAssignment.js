import React from 'react';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import Translate from 'd2-ui/lib/i18n/Translate.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import Checkbox from '../../../forms/form-fields/check-box';
import actions from '../../../EditModel/objectActions';
import { get } from 'lodash/fp';

const extractValueFromEvent = get('target.value');

const toggleBooleanOnModel = fieldName => event => actions.update({
    fieldName,
    value: extractValueFromEvent(event),
});

const styles = {
    field: {
        paddingTop: '1rem',
    },

    wrap: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        maxHeight: '500px',
    },

    item: {
        maxHeight: '48px',
    },

    heading: {
        fontSize: '1.2rem',
    },
};

const onlyPropertiesEndingOnAttribute = propertyName => /Attribute$/.test(propertyName);
const extractSchemaNameToSnakeCase = propertyName => camelCaseToUnderscores(propertyName.replace(/Attribute$/, ''));

export default function AttributeAssignment({ model }) {
    const attributeReceiverCheckBoxes = Object
        .keys(model)
        .filter(onlyPropertiesEndingOnAttribute)
        .sort()
        .map(propertyName => (
            <div key={propertyName} style={styles.item}>
                <Checkbox
                    labelText={<Translate>{extractSchemaNameToSnakeCase(propertyName)}</Translate>}
                    value={model[`${propertyName}`]}
                    onChange={toggleBooleanOnModel(propertyName)}
                />
            </div>
        ));

    return (
        <div style={styles.field}>
            <Heading level={5} style={styles.heading}>
                <Translate>the_custom_attribute_will_be_applied_to_the_selected_objects</Translate>
            </Heading>

            <div style={styles.wrap}>
                {attributeReceiverCheckBoxes}
            </div>
        </div>
    );
}
