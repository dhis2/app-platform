import React from 'react';
import PropTypes from 'prop-types';
import { List, ListItem } from 'material-ui/List';
import Heading from 'd2-ui/lib/headings/Heading.component';

const styles = {
    wrapper: {
        flex: '0 0 33%',
    },
    heading: {
        fontSize: '1rem',
        paddingBottom: '1rem',
    },
    listWrapper: {
        maxHeight: '300px',
        overflowY: 'scroll',
    },
};

const VariableList = ({ onItemSelected, variableTypes }, { d2 }) => {
    const renderListItem = ([type, name]) => {
        const varName = name.id
            ? type === 'A'
                ? name.trackedEntityAttribute.id
                : name.id
            : name;

        const label = name.displayName
            ? name.displayName
            : d2.i18n.getTranslation(name);

        const selectItem = () => onItemSelected(`${type}{${varName}}`);

        return (<ListItem key={label} primaryText={label} onClick={selectItem} />);
    };

    const listItems = variableTypes.map(renderListItem);

    return (
        <div style={styles.wrapper}>
            <Heading level={4} style={styles.heading}>
                Template variables
            </Heading>
            <div style={styles.listWrapper}>
                <List>
                    {listItems}
                </List>
            </div>
        </div>
    );
};

VariableList.propTypes = {
    onItemSelected: PropTypes.func.isRequired,
    variableTypes: PropTypes.array.isRequired,
};

VariableList.contextTypes = { d2: PropTypes.object };

export default VariableList;
