import React, { Component } from 'react';
import TextField from 'material-ui/TextField/TextField';
import Action from 'd2-ui/lib/action/Action';

export default class TextFormField extends Component {
    static getWantedProperties(props) {
        const omitProps = ['translateOptions', 'model', 'modelDefinition', 'models',
            'referenceType', 'referenceProperty', 'isInteger', 'isRequired', 'options'];

        return Object.keys(props).reduce((acc, key) => { // eslint-disable-line arrow-body-style
            return omitProps.indexOf(key) === -1 ? { ...acc, [key]: props[key] } : acc;
        }, {});
    }

    constructor(props, ...args) {
        super(props, ...args);
        this.state = {
            fieldValue: props.value || props.value === 0 ? props.value : '',
        };

        this.updateOnChange = Action.create(`updateOnKeyUp - ${props.name}`);
        this.onValueChanged = this.onValueChanged.bind(this);
    }

    componentDidMount() {
        // Debounce the value, so the request handler does not get executed on each change event
        this.subscription = this.updateOnChange
            .debounceTime(300)
            .map(action => action.data)
            .distinctUntilChanged()
            .subscribe((value) => {
                this.props.onChange({
                    target: {
                        value,
                    },
                });
            });
    }

    componentWillReceiveProps(newProps) {
        // Keep local state in sync with the passed in value
        if (newProps.value !== this.props.value) {
            this.setState({
                fieldValue: newProps.value ? newProps.value : '',
            });
        }
    }

    componentWillUnmount() {
        if (this.subscription && this.subscription.unsubscribe) {
            this.subscription.unsubscribe();
        }
    }

    onValueChanged(event) {
        event.preventDefault();
        event.stopPropagation();
        // Keep local state to keep the field responsiveness
        this.setState({
            fieldValue: event.currentTarget.value,
        });

        // Fire the update handler
        this.updateOnChange(event.currentTarget.value);
    }

    render() {
        const {
            label,
            labelText,
            multiLine,
            style,
            errorStyle,
            ...rest
        } = this.props;

        const restProps = TextFormField.getWantedProperties(rest);

        const styles = {
            errorStyle: {
                position: 'absolute',
                lineHeight: multiLine ? '48px' : '12px',
                marginTop: multiLine ? -16 : -12,
                bottom: '-0.9em',
            },
            fieldWrap: {
                position: 'relative',
            },
        };
        return (
            <div style={{ ...styles.fieldWrap, ...style }}>
                <TextField
                    errorStyle={{ ...styles.errorStyle, ...errorStyle }}
                    label={label}
                    multiLine={multiLine}
                    {...restProps}
                    value={this.state.fieldValue}
                    floatingLabelText={labelText}
                    onChange={this.onValueChanged}
                />
            </div>
        );
    }
}

TextFormField.propTypes = {
    name: React.PropTypes.string,
    value: React.PropTypes.any,
    label: React.PropTypes.string,
    labelText: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    multiLine: React.PropTypes.bool,
    style: React.PropTypes.any,
    errorStyle: React.PropTypes.object,
};

TextFormField.defaultProps = {
    name: '',
    style: undefined,
    value: null,
    label: '',
    onChange: () => {},
    multiLine: false,
    errorStyle: {},
};
