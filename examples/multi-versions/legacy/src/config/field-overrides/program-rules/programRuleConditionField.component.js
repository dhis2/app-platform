import React from 'react';
import { PropTypes } from 'prop-types';

import { RaisedButton, IconButton, Divider } from 'material-ui';
import { Link } from 'react-router-dom';

import programRuleBuiltInVariables from './programRuleBuiltInVariables';
import programRuleFunctions from './programRuleFunctions';
import TextEditor from '../../../forms/form-fields/text-editor-field';
import modelToEditStore from '../../../EditModel/modelToEditStore';
import OperatorButtons from '../../../EditModel/OperatorButtons.component';
import { ExpressionDescription } from '../program-indicator/ExpressionStatusIcon';


const styles = {
    outerWrap: {
        marginTop: 32,
        marginBottom: 32,
        minHeight: 170,
        minWidth: 680,
        fontSize: 16,
        width: '100%',
    },
    labelStyle: {
        fontSize: 16,
        color: 'rgba(0,0,0,0.3)',
    },
    leftWrap: {
        marginRight: 380,
    },
    rightWrap: {
        width: 360,
        float: 'right',
        marginRight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    rightScroll: {
        overflowX: 'hidden',
        margin: '8px 0',
        transition: 'all 175ms ease-in-out',
        flexGrow: 1,
    },
    insertButton: {
        display: 'block',
        marginTop: 8,
        marginBottom: 4,
    },
    operatorButton: {
        marginRight: 8,
        marginTop: 8,
        minWidth: 50,
    },
    operatorButtonSeparator: {
        display: 'inline-block',
        marginTop: 8,
        marginLeft: 8,
        whiteSpace: 'nowrap',
    },
    expand: {
        cursor: 'pointer',
        fontSize: 14,
    },
    innerWrapperButtonWrapper: {
        float: 'right',
        margin: '-16px 0 -18px',
    },
    varSyntax: {
        opacity: 0.4,
    },
    dividerStyle: {
        marginTop: 9,
        marginBottom: 9,
    },
};

class ProgramRuleConditionField extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.d2 = context.d2;
        this.getTranslation = this.d2.i18n.getTranslation.bind(this.d2.i18n);

        this.state = {
            programRuleVariables: [],
            expand: 'v',
        };
    }

    componentDidMount() {
        this.sub = modelToEditStore.subscribe((modelToEdit) => {
            this.getProgramRuleVariablesForProgram(modelToEdit.program);
        });
    }

    componentWillUnmount() {
        if (this.sub) {
            this.sub.unsubscribe();
            delete this.sub;
        }
    }

    getProgramRuleVariablesForProgram(program) {
        if (program) {
            this.d2.models.programRuleVariables.list({ filter: `program.id:eq:${program.id}`, paging: false })
                .then((list) => {
                    // If the component has been unmounted while the query was in progress,
                    // this.sub will have been deleted
                    if (this.sub) {
                        this.setState({ programRuleVariables: list.toArray() });
                    }
                });
        } else {
            this.setState({ programRuleVariables: [] });
        }
    }

    makeTextPusher = text => () => this.pushText(text);

    pushText = (text) => {
        if (this.editor) {
            this.editor.insertText(text);
        }
    };

    expander = section => () => this.setState({ expand: section });

    isSectionExpanded = section => this.state.expand === section;

    isSectionWithQuickButtons = section => (this.props.quickAddLink && section === 'variables');

    makeArrowStyle = section => ({
        display: 'inline-block',
        marginRight: 8,
        transition: 'all 175ms ease-out',
        transform: this.isSectionExpanded(section) ? 'rotateZ(90deg)' : undefined,
    });

    makeSectionListStyle = section =>
        Object.assign(
            {
                maxHeight: this.isSectionExpanded(section) ? 350 : 0,
                overflowY: this.isSectionExpanded(section) ? 'auto' : 'auto',
                padding: this.isSectionExpanded(section) ? '0 4px 4px 2px' : '0 2px',
            },
            styles.rightScroll,
        );

    refreshProgramRuleVariables = (e) => {
        this.getProgramRuleVariablesForProgram(modelToEditStore.getState().program);
        e.stopPropagation();
    };

    programRuleVariableButtonRenderer = (v, i) => {
        const varSymbol = v.programRuleVariableSourceType === 'TEI_ATTRIBUTE' ? 'A' : '#';
        const varLabel = (
            <span>
                <span style={styles.varSyntax}>{varSymbol}{'{'}</span>
                {v.displayName}
                <span style={styles.varSyntax}>{'}'}</span>
            </span>
        );

        const varText = `${varSymbol}{${v.displayName}}`;
        return this.renderRaisedButton(i, varLabel, varText);
    };

    renderQuickAddButtons = () => {
        const AddVariableButton = (
            <IconButton
                iconClassName="material-icons"
                disabled={this.props.disabled}
            >add_circle_outline
            </IconButton>
        );

        const RefreshVariableButton = (
            <IconButton
                iconClassName="material-icons"
                onClick={this.refreshProgramRuleVariables}
                disabled={this.props.disabled}
            >refresh
            </IconButton>
        );

        return (
            <div style={styles.innerWrapperButtonWrapper}>
                <Link
                    to="/edit/programSection/programRuleVariable/add"
                    target="_blank"
                    rel="noopener nofollow"
                >{AddVariableButton}
                </Link>
                {RefreshVariableButton}
            </div>
        );
    }

    renderSection = (sectionName, sectionContent) => (
        <div>
            <div onClick={this.expander(sectionName)} style={styles.expand}>
                <div style={this.makeArrowStyle(sectionName)}>&#9656;</div>
                {this.getTranslation(sectionName)}
                {this.isSectionWithQuickButtons(sectionName) && this.renderQuickAddButtons}
            </div>

            <div style={this.makeSectionListStyle(sectionName)}>
                {sectionContent}
            </div>
            {this.isSectionExpanded(sectionName) && <Divider style={styles.dividerStyle} />}
        </div>
    )

    renderBuiltInVariablesMenu = () => {
        const sectionName = 'built_in_variables';
        const sectionContent = programRuleBuiltInVariables.map((varLabel, i) =>
            this.renderRaisedButton(i, varLabel, varLabel));
        return this.renderSection(sectionName, sectionContent);
    }

    renderVariablesMenu = () => {
        const sectionName = 'variables';
        const sectionContent = this.state.programRuleVariables
            .map(this.programRuleVariableButtonRenderer);
        return this.renderSection(sectionName, sectionContent);
    }

    renderFunctionsMenu = () => {
        const sectionName = 'functions';
        const sectionContent = programRuleFunctions.map((funcLabel, i) =>
            this.renderRaisedButton(i, funcLabel, funcLabel));
        return this.renderSection(sectionName, sectionContent);
    }

    renderRaisedButton = (key, label, text) => (
        <RaisedButton
            key={key}
            label={label}
            labelStyle={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            style={styles.insertButton}
            disabled={this.props.disabled}
            onClick={this.makeTextPusher(text)}
            title={text}
            buttonStyle={{textAlign: 'left'}}
        />
    );

    render() {
        const ref = (r) => { this.editor = r; };
        styles.outerWrap = {
            ...styles.outerWrap,
            ...{ color: this.props.disabled ? 'rgba(0,0,0,0.3)' : 'inherit' },
        };

        const { status } = this.props;

        return <div style={Object.assign(styles.outerWrap, this.props.style)}>
                <div style={styles.labelStyle}>
                    {this.props.labelText}
                </div>

                <div style={styles.rightWrap}>
                    {this.renderBuiltInVariablesMenu()}
                    {this.renderVariablesMenu()}
                    {this.renderFunctionsMenu()}
                </div>

                <div style={styles.leftWrap}>
                    <TextEditor
                        placeholder={this.getTranslation('enter_expression')}
                        editorState={this.state.editorState}
                        value={this.props.value}
                        onChange={this.props.onChange}
                        ref={ref}
                        disabled={this.props.disabled} />
                    <OperatorButtons onClick={this.pushText} />

                    <ExpressionDescription status={status} />
                </div>
                <div style={{ clear: 'both' }} />
            </div>;
    }
}

ProgramRuleConditionField.contextTypes = {
    d2: PropTypes.any,
};

ProgramRuleConditionField.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    labelText: PropTypes.string,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    quickAddLink: PropTypes.bool,
};

ProgramRuleConditionField.defaultProps = {
    disabled: false,
    quickAddLink: true,
    value: '',
    labelText: '',
    style: {},
};

export default ProgramRuleConditionField;
