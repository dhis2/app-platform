import React from 'react';
import TreeView from 'd2-ui/lib/tree-view/TreeView.component';
import withState from 'recompose/withState';

function CollapsibleList({ items, label, onItemClick, expanded, setExpanded }) {
    const styles = {
        collapsibleListWrap: {
            padding: '.5rem',
        },
        collapsibleListLabel: {
            fontWeight: 'bold',
        },
        firstCollapsibleListItem: {
            fontSize: '.75rem',
            padding: '.75rem 0',
            cursor: 'pointer',
        },
        collapsibleListItem: {
            fontSize: '.75rem',
            padding: '.5rem 0',
            cursor: 'pointer',
            borderTop: '1px dotted #CCC',
        },
    };

    const children = items.map((item, index) => (
        <div
            key={item.value} onClick={() => onItemClick(item.value)}
            style={index === 0 ? styles.firstCollapsibleListItem : styles.collapsibleListItem}
        >
            {item.label}
        </div>
    ));

    const labelComponent = (<span style={styles.collapsibleListLabel}>{label}</span>);

    return (
        <div style={styles.collapsibleListWrap}>
            <TreeView
                label={labelComponent}
                children={children}
                initiallyExpanded={expanded}
                onClick={() => setExpanded(true)}
            />
        </div>
    );
}

const enhance = withState('expanded', 'setExpanded', false);

export default enhance(CollapsibleList);
