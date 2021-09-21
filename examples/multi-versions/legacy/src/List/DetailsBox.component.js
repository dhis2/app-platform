import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from 'classnames';

import FontIcon from 'material-ui/FontIcon/FontIcon';

import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';

class DetailsBox extends Component {
    getTranslation = key => this.context.d2.i18n.getTranslation(key);

    getDetailBoxContent = () => {
        if (!this.props.source) {
            return (<div className="detail-box__status">Loading details...</div>);
        }

        return this.props.fields
            .filter(fieldName => this.props.source[fieldName])
            .map((fieldName) => {
                const valueToRender = this.getValueToRender(fieldName, this.props.source[fieldName]);

                return (
                    <div key={fieldName} className="detail-field">
                        <div className={`detail-field__label detail-field__${fieldName}-label`}>
                            {this.getTranslation(camelCaseToUnderscores(fieldName))}
                        </div>
                        <div className={`detail-field__value detail-field__${fieldName}`}>{valueToRender}</div>
                    </div>
                );
            });
    }

    getDateString = (dateValue) => {
        const stringifiedDate = new Date(dateValue).toString();

        return stringifiedDate === 'Invalid Date' ? dateValue : stringifiedDate;
    };

    getNamesToDisplay = (value) => {
        const namesToDisplay = value
            .map(v => (v.displayName ? v.displayName : v.name))
            .filter(name => name);
        return (
            <ul>
                {namesToDisplay.map(name => <li key={name}>{name}</li>)}
            </ul>
        );
    }

    // Suffix the url with the .json extension to always get the json representation of the api resource
    getJsonApiResource = value =>
        <a style={{ wordBreak: 'break-all' }} href={`${value}.json`} rel="noopener noreferrer" target="_blank" >{value}</a>;

    getValueToRender = (fieldName, value) => {
        if (Array.isArray(value) && value.length) {
            return this.getNamesToDisplay(value);
        }

        if (fieldName === 'created' || fieldName === 'lastUpdated') {
            return this.getDateString(value);
        }

        if (fieldName === 'href') {
            return this.getJsonApiResource(value);
        }

        return value;
    }

    render() {
        const classList = classes('details-box');
        const closeIcon = (
            <FontIcon
                className="details-box__close-button material-icons"
                onClick={this.props.onClose}
            >close</FontIcon>
        );

        if (this.props.showDetailBox === false) {
            return null;
        }

        return (
            <div className={classList}>
                {closeIcon}
                <div>{this.getDetailBoxContent()}</div>
            </div>
        );
    }
}

DetailsBox.propTypes = {
    fields: PropTypes.array,
    showDetailBox: PropTypes.bool,
    source: PropTypes.object,
    onClose: PropTypes.func,
};

DetailsBox.defaultProps = {
    source: PropTypes.object,
    fields: [
        'name',
        'locale',
        'shortName',
        'code',
        'displayDescription',
        'created',
        'lastUpdated',
        'id',
        'href',
    ],
    showDetailBox: false,
    onClose: () => {},
};

DetailsBox.contextTypes = {
    d2: PropTypes.object.isRequired,
};


export default DetailsBox;
