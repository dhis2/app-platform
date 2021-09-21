import React from 'react';
import MenuCards from './MenuCards.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import menuCardsStore from './menuCardsStore';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';

const sectionsForAllCards$ = menuCardsStore
    .map(sections => ({ sections }));

function MenuCardsForAllSections(props) {
    return (
        <div>
            {props.sections
                // Only show sections that have items
                .filter(metaDataSection => metaDataSection.items.length > 0)
                .map(metaDataSection => (
                    <div key={metaDataSection.key}>
                        <Heading>{metaDataSection.name}</Heading>
                        <MenuCards menuItems={metaDataSection.items} />
                    </div>
                ))}
        </div>
    );
}
MenuCardsForAllSections.defaultProps = {
    sections: [],
};

export default withStateFrom(sectionsForAllCards$, MenuCardsForAllSections);
