import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from 'd2-ui/lib/layout/Row.component';
import Column from 'd2-ui/lib/layout/Column.component';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField/TextField';
import Heading from 'd2-ui/lib/headings/Heading.component';

import VariableList from './VariableList';

const styles = {
    divider: {
        marginTop: '2rem',
        marginBottom: '2rem',
        marginLeft: '-5rem',
        marginRight: '-5rem',
    },
    heading: {
        fontSize: '1.25rem',
    },
    subject: {
        flex: '0 0 72px',
    },
    fieldWrap: {
        position: 'relative',
    },
};

export default class SubjectAndMessageTemplateFields extends Component {
    state = {
        lastActiveField: 'subjectTemplate',
        lastIndex: 0,
    };

    setActiveField(field) {
        return (event) => {
            this.setState({
                lastActiveField: field,
                lastIndex: event.target.selectionEnd,
            });
        };
    }


    insertVariable = (variable) => {
        const lastIndex = this.state.lastIndex;
        const currentValue = (this.props.model[this.state.lastActiveField] || '');

        this.props.onUpdate({
            fieldName: this.state.lastActiveField,
            value: `${currentValue.slice(0, lastIndex)}${variable}${currentValue.slice(lastIndex)}`,
        });
    }

    render() {
        const d2 = this.context.d2;

        const subjectChange = (event, value) => this.props.onUpdate({ fieldName: 'subjectTemplate', value });
        const messageChange = (event, value) => this.props.onUpdate({ fieldName: 'messageTemplate', value });
        const messageLabel = d2.i18n.getTranslation('message_template');

        return (
            <div style={{ ...styles.fieldWrap, ...this.props.style }}>
                <Divider style={styles.divider} />
                <Heading level={3} style={styles.heading}>
                    Message template
                </Heading>
                <Row>
                    <Column>
                        <div style={styles.subject}>
                            <TextField
                                label="subjectTemplate"
                                fullWidth
                                floatingLabelText={d2.i18n.getTranslation('subject_template')}
                                onBlur={this.setActiveField('subjectTemplate')}
                                value={this.props.model.subjectTemplate || ''}
                                onChange={subjectChange}
                                onKeyUp={this.setActiveField('subjectTemplate')}
                            />
                        </div>
                        <div>
                            <TextField
                                label="messageTemplate"
                                multiLine
                                fullWidth
                                errorText={this.props.errorText}
                                required={this.props.isRequired}
                                floatingLabelText={`${messageLabel} ${this.props.isRequired ? '(*)' : ''}`}
                                onBlur={this.setActiveField('messageTemplate')}
                                value={this.props.model.messageTemplate || ''}
                                onChange={messageChange}
                                onKeyUp={this.setActiveField('messageTemplate')}
                            />
                        </div>
                    </Column>
                    <VariableList onItemSelected={this.insertVariable} variableTypes={this.props.variableTypes} />
                </Row>
                <Divider style={styles.divider} />
            </div>
        );
    }
}

SubjectAndMessageTemplateFields.propTypes = {
    errorText: PropTypes.string,
    isRequired: PropTypes.bool,
    style: PropTypes.object,
    onUpdate: PropTypes.func.isRequired,
    model: PropTypes.object.isRequired,
    variableTypes: PropTypes.array.isRequired,
};

SubjectAndMessageTemplateFields.defaultProps = {
    errorText: '',
    isRequired: false,
    style: {},
};

SubjectAndMessageTemplateFields.contextTypes = { d2: PropTypes.object };
