import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField/SelectField';
import TextField from 'material-ui/TextField';
import isString from 'd2-utilizr/lib/isString';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem/MenuItem';

class Dropdown extends Component {
    constructor(props, context) {
        super(props, context);

        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);

        this.state = {
            value: this.props.value,
            options: this.getOptions(this.props.options, this.props.isRequired),
            dialogOpen: false,
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            options: this.getOptions(newProps.options, newProps.isRequired),
        });
    }

    onChange = (event, index, value) => {
        this.props.onChange({
            target: {
                value,
            },
        });
    }

    getOptions(options) {
        const opts = options
            .map(option => ({
                value: option.value,
                text: option.text,
            }));

        return opts
            .map((option) => {
                if (option.text && this.props.translateOptions) {
                    option.text = isString(option.text) ? this.getTranslation(option.text.toLowerCase()) : option.text;
                }
                return option;
            });
    }

    getOptionText = value => (value && this.state.options.length
        ? this.state.options.find(option => option.value === value).text
        : '')

    closeDialog = () => {
        this.setState({ dialogOpen: false });
    }

    openDialog = () => {
        this.setState({ dialogOpen: true, filterText: '' });
    }

    textFieldOnChange = (e, value) => {
        this.setState({ filterText: value });
    }

    renderDialogOption = (value, label) => (
        <div
            style={{ cursor: 'pointer', margin: 8 }}
            key={value}
            onClick={() => {
                this.props.onChange({ target: { value } });
                this.setState({ dialogOpen: false, value });
            }}
        ><a>{label}</a></div>
    )

    renderOptions = () => {
        const options = this.state.options
            .map(option => (
                <MenuItem
                    primaryText={option.text}
                    key={option.text}
                    value={option.value}
                    label={option.text}
                />
            ));

        if (!this.props.isRequired) {
            // When the value is not required we add an item that sets the value to null
            // For this value we pass an empty label to not show the label no_value
            // when this option is selected.
            options.unshift([
                <MenuItem
                    primaryText={this.getTranslation('no_value')}
                    key="no_value"
                    value={null}
                    label=" "
                />,
            ]);
        }

        return options;
    }

    renderSelectField(other) {
        return (
            <SelectField
                value={this.state.value}
                fullWidth={this.props.fullWidth}
                errorText={this.props.errorText}
                {...other}
                onChange={this.onChange}
                floatingLabelText={this.props.labelText}
            >
                {this.renderOptions()}
            </SelectField>
        );
    }


    renderDialogDropDown(other) {
        const styles = {
            fieldStyle: {
                width: this.props.fullWidth ? '100%' : 'inherit',
                position: 'relative',
                top: this.props.top,
            },
            openInNew: {
                position: 'absolute',
                top: 36,
                right: 10,
                color: 'rgba(0,0,0,0.25)',
                cursor: 'pointer',
            },
        };

        return (
            <div style={styles.fieldStyle}>
                <Dialog
                    title={this.props.labelText}
                    open={this.state.dialogOpen}
                    onRequestClose={this.closeDialog}
                    autoScrollBodyContent
                    autoDetectWindowHeight
                    actions={[
                        <FlatButton onClick={this.closeDialog} label={this.getTranslation('cancel')} />,
                    ]}
                >
                    <TextField
                        floatingLabelText="Filter list"
                        onChange={this.textFieldOnChange}
                        style={styles.textField}
                    />
                    {!this.props.isRequired && this.renderDialogOption(null, this.getTranslation('no_value'))}
                    {this.state.options
                        .filter(o => !this.state.filterText || this.state.filterText
                            .trim().toLocaleLowerCase().split(' ').every(
                                f => o.text.toLocaleLowerCase().includes(f.toLocaleLowerCase()),
                            ),
                        )
                        .map(o => this.renderDialogOption(o.value, o.text))
                    }
                </Dialog>
                <TextField
                    {...other}
                    fullWidth={this.props.fullWidth}
                    value={this.getOptionText(this.state.value)}
                    onClick={this.openDialog}
                    onChange={this.openDialog}
                    style={styles.textField}
                    floatingLabelText={this.props.labelText}
                    inputStyle={{ cursor: 'pointer' }}
                />
                <div style={styles.openInNew} className="material-icons" onClick={this.openDialog}>open_in_new</div>
            </div>
        );
    }

    render() {
        const {
            onFocus,
            onBlur,
            labelText,
            modelDefinition,
            models,
            referenceType,
            referenceProperty,
            isInteger,
            translateOptions,
            isRequired,
            options,
            model,
            limit,
            fullWidth,
            top,
            translateLabel,
            style,
            ...other
        } = this.props;

        if (style && style.display && style.display === 'none') {
            return null;
        }

        return (
            this.state.options.length > limit
                ? this.renderDialogDropDown(other)
                : this.renderSelectField(other)
        );
    }
}

Dropdown.propTypes = {
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    fullWidth: PropTypes.bool,
    translateOptions: PropTypes.bool,
    isInteger: PropTypes.bool,
    isRequired: PropTypes.bool,
    limit: PropTypes.number,
    top: PropTypes.any,
    style: PropTypes.any,
    value: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
    ]),
    labelText: PropTypes.string,
    errorText: PropTypes.string,
    translateLabel: PropTypes.bool,
    referenceProperty: PropTypes.string,
    modelDefinition: PropTypes.object,
    models: PropTypes.object,
    model: PropTypes.object,
    referenceType: PropTypes.object,
    options: PropTypes.array.isRequired,
};

Dropdown.defaultProps = {
    onFocus: () => {},
    onBlur: () => {},
    onChange: () => {},
    limit: 50,
    translateOptions: false,
    isRequired: false,
    fullWidth: true,
    isInteger: false,
    top: undefined,
    style: undefined,
    value: '',
    labelText: '',
    errorText: '',
    translateLabel: false,
    referenceProperty: '',
    modelDefinition: {},
    models: {},
    model: {},
    referenceType: {},
};

Dropdown.contextTypes = {
    d2: React.PropTypes.any,
};

export default Dropdown;
