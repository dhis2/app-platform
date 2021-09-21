import mapProps from 'recompose/mapProps';
import { identity, noop, getOr, get } from 'lodash/fp';
import CollapsibleList from './CollapsibleList';

const AttributeSelector = mapProps(({ program, onSelect = noop, ...props }) => {
    const programAttributeItems = getOr([], 'programTrackedEntityAttributes', program)
        .map(get('trackedEntityAttribute'))
        .filter(identity) // TODO: Also filter on valueType
        .map(trackedEntityAttribute => ({
            label: trackedEntityAttribute.displayName,
            value: `A{${trackedEntityAttribute.id}}`,
        }));

    return {
        ...props,
        items: programAttributeItems,
        onItemClick: onSelect,
    };
})(CollapsibleList);

export default AttributeSelector;
