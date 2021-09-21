import React, { Component, PropTypes } from 'react';
import { grey100, grey200, grey300, grey500 } from 'material-ui/styles/colors';
import { get, isEqual, find } from 'lodash/fp';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField/TextField';

const styles = {
    dataElementPicker: {
        marginLeft: '1.5rem',
    },

    dataElementList: {
        overflowY: 'auto',
        maxHeight: '500px',
    },

    header: {
        fontSize: '1.2rem',
        fontWeight: '500',
    },

    dataElement: {
        minHeight: '45px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.8rem',
        backgroundColor: grey200,
        marginBottom: '4px',
        borderRadius: '8px',
    },
};

const DataElementPicker = ({ availableDataElements, activeDataElements, onElementPicked, heading, onFilter, filterText }) => (
    <div style={styles.dataElementPicker}>
        <div style={styles.header}>{heading}</div>
        {onFilter && <TextField
            hintText={filterText}
            onChange={onFilter}
            fullWidth
        />}
        <div style={styles.dataElementList}>
            { availableDataElements.map((element) => {
                const elementIsActive = find(active =>
                    isEqual(get('id', active), get('id', element)), activeDataElements);

                return (
                    <AvailableDataElement
                        key={element.id}
                        dataElement={element}
                        pickDataElement={onElementPicked}
                        active={elementIsActive !== undefined}
                    />
                );
            })}
        </div>
    </div>
);


export class AvailableDataElement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false,
        };
    }

    onMouseEnter = () => {
        this.setState({ hover: true });
    };

    onMouseLeave = () => {
        this.setState({ hover: false });
    };

    getBackgroundColor = () => {
        if (this.props.active) {
            return grey100;
        }

        return this.state.hover ? grey200 : grey300;
    };

    pickDataElement = () => {
        if (!this.props.active) {
            this.props.pickDataElement(this.props.dataElement.id);
        }
    };

    render = () => (
        <div
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onClick={this.pickDataElement}
            style={{
                ...this.props.style,
                ...styles.dataElement,
                backgroundColor: this.getBackgroundColor(),
                color: this.props.active ? grey500 : 'black',
                cursor: this.props.active ? 'default' : 'pointer',
            }}
        >
            {this.props.dataElement.displayName}
            {!this.props.active && <FontIcon color="gray" className="material-icons">add</FontIcon>}
        </div>
    )
}

AvailableDataElement.propTypes = {
    dataElement: PropTypes.object.isRequired,
    pickDataElement: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
};

export default DataElementPicker;
