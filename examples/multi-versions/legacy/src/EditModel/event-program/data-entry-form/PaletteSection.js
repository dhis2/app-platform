import React from 'react';
import pure from 'recompose/pure';

function PaletteSection({ keySet, label, filter, expand, expandClick, usedIds, insertFn, styles }, { d2 }) {
    const filteredItems = Object.keys(keySet)
        .filter(key => !filter.length || filter.every(
            filter => keySet[key].toLowerCase().indexOf(filter.toLowerCase()) !== -1
        ));

    const cellClass = label === expand ? 'cell expanded' : 'cell';

    return (
        <div className={cellClass}>
            <div style={{...styles}} className="header" onClick={expandClick}>
                <div className="arrow">&#9656;</div>
                {d2.i18n.getTranslation(label)}:
                <div className="count">{filteredItems.length}</div>
            </div>
            <div className="items">
                {
                    filteredItems
                        .sort((a, b) => keySet[a] ? keySet[a].localeCompare(keySet[b]) : a.localeCompare(b))
                        .map((key) => {
                            // Active items are items that are not already added to the form
                            const isActive = usedIds.indexOf(key) === -1;
                            const className = isActive ? 'item active' : 'item inactive';
                            const name = keySet[key].name || keySet[key];

                            return (
                                <div key={key} className={className} title={name}>
                                    <a onClick={insertFn[key]}>{name}</a>
                                </div>
                            );
                        })
                }

            </div>
        </div>
    );
}

PaletteSection.contextTypes = {
    d2: React.PropTypes.object,
};

export const PurePaletteSection = pure(PaletteSection);
export default PurePaletteSection;