import React from 'react';
import CollapsibleList from './CollapsibleList';

function CollapsibleLists({ listSources, onSelect }) {
    const renderedItemLists = listSources
        .map(({ label, items }) => (
            <CollapsibleList
                key={label}
                label={label}
                items={items}
                onItemClick={onSelect}
            />
        ));

    return (
        <div>{ renderedItemLists }</div>
    );
}

export default CollapsibleLists;
