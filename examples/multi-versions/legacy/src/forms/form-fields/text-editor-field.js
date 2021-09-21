import React from 'react';

// TODO: Put this in D2-UI
// TODO: Auto-completion
// TODO: Hacketihacks!

const styles = {
    outerWrap: {
        marginTop: 32,
        marginBottom: 32,
    },

    ed17x0r: {
        minHeight: 75,
        width: '100%',
        fontSize: 15,
        fontFamily: 'monospace',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 3,
        marginTop: 3,
        padding: 4,
    },

};

class TextEditorField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.onChange = (event) => {
            const value = event.target.value;
            this.setState({ value });

            if (this.hackyDebounceTimeout) {
                clearTimeout(this.hackyDebounceTimeout);
            }

            this.hackyDebounceTimeout = setTimeout(() => {
                this.props.onChange({ target: { value } });
            }, 250);
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.value && newProps.value !== this.props.value) {
            this.setState({ value: newProps.value }, () => {
                if (this.editor) {
                    this.editor.focus();
                }
            });
        }
    }

    insertText(text) {
        if (this.editor) {
            const value = this.editor.value;
            const selectionStart = this.editor.selectionStart;
            const selectionEnd = this.editor.selectionEnd;
            this.props.onChange({
                target: {
                    value: `${value.substr(0, selectionStart)}${text}${value.substr(selectionEnd)}`.trim(),
                },
            });
            window.setTimeout(() => {
                this.editor.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
            });
        }
    }

    render() {
        return (
            <textarea
                disabled={this.props.disabled}
                style={styles.ed17x0r}
                value={this.state.value}
                onChange={this.onChange}
                ref={r => (this.editor = r)}
            />
        );
    }
}

TextEditorField.propTypes = {
    value: React.PropTypes.any,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,
};

TextEditorField.contextTypes = {
    d2: React.PropTypes.any,
};

TextEditorField.defaultProps = {
    value: '',
    disabled: false,
    onChange: null,
};


export default TextEditorField;
