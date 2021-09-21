import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropDownAsyncGetter from '../../../forms/form-fields/drop-down-async-getter';

class LocaleDropDown extends Component {
    constructor(props, context) {
        super(props, context);
        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
        this.getter = () =>
            context.d2.Api.getApi().get(props.getUrl)
                .then(options => Object.keys(options).map((optionKey) => {
                    const text = options[optionKey];
                    return {
                        value: optionKey,
                        text,
                    };
                }));
    }

    render() {
        const { value, labelKey, getUrl, ...rest } = this.props;
        const extendedProps = {
            ...rest,
            getter: this.getter,
            value: value && value.id ? value.id : value,
            labelText: `${this.getTranslation(labelKey)} *`,
            useValueDotId: false,
        };

        return <DropDownAsyncGetter {...extendedProps} />;
    }
}

LocaleDropDown.propTypes = {
    style: PropTypes.object,
    model: PropTypes.shape({
        notificationRecipient: PropTypes.string,
    }),
    value: PropTypes.string,
    labelKey: PropTypes.string.isRequired,
    getUrl: PropTypes.string.isRequired,
};

LocaleDropDown.defaultProps = {
    style: {},
    model: null,
    value: null,
};

LocaleDropDown.contextTypes = {
    d2: PropTypes.object,
};

export default LocaleDropDown;
