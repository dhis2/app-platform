import React from 'react';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import SelectField from 'material-ui/SelectField/SelectField';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import Paper from 'material-ui/Paper/Paper';
import TextField from 'material-ui/TextField/TextField';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import Action from 'd2-ui/lib/action/Action';
import mapPropsStream from 'recompose/mapPropsStream';
import { compose, getOr, noop, curry } from 'lodash/fp';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { programDataEntryFormChanged, programDataEntryFormRemove } from './actions';
import eventProgramStore from '../eventProgramStore';
import CKEditor from './CKEditor';
import PaletteSection from './PaletteSection';
import { bindFuncsToKeys, processFormData, insertElement as insElem } from "./dataEntryFormUtils";
import PropTypes from 'prop-types';

const pteaToAttributes = ({programTrackedEntityAttributes, availableAttributes })  => {
    const out = {};
    programTrackedEntityAttributes.map(ptea => {
        const attr = availableAttributes.find(attr => attr.id === ptea.trackedEntityAttribute.id);
        out[attr.id] = attr.displayName
    })
    return out;
}

const PurePaletteSection = PaletteSection;

const styles = {
    heading: {
        paddingBottom: 18,
    },
    formContainer: {},
    formPaper: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        margin: '0 auto 2rem',
        padding: '4rem 4rem',
        alignItems: 'center',
    },
    formSection: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    cancelButton: {
        marginLeft: '2rem',
    },
    deleteButton: {
        marginLeft: '2rem',
    },
    paletteHeader: {},
    paletteFilter: {
        padding: '0 8px 8px',
    },
    paletteFilterField: {
        width: '100%',
    },
    greySwitch: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
    },
};


class EditDataEntryForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.getTranslation = this.context.d2.i18n.getTranslation.bind(this.context.d2.i18n);

        const dataEntryForm = props.dataEntryForm;

        const programElements = {
            'incidentDate': this.getTranslation('date_of_incident'),
            'enrollmentDate': this.getTranslation('date_of_enrollment')
        }

        const { usedIds, outHtml } = processFormData(getOr('', 'htmlCode', dataEntryForm), { ...programElements, ...this.props.elements });
        const formHtml = dataEntryForm ? outHtml : '';
        this.state = {
            usedIds: usedIds || [],
            filter: '',
            expand: 'attributes',
            insertFn: {
                ...bindFuncsToKeys(props.elements, this.insertElement, this),
                ...bindFuncsToKeys(programElements, this.insertProgramElement, this)
            },
            formTitle: this.props.formTitle,
            formHtml,
            programElements
        };

        // Create element filtering action
        this.filterAction = Action.create('filter');
        this.disposables = new Set();
        this.disposables.add(this.filterAction
            .map(({ data, complete, error }) => ({ data: data[1], complete, error }))
            .debounceTime(75)
            .subscribe((args) => {
                const filter = args.data
                    .split(' ')
                    .filter(x => x.length);
                this.setState({ filter });
            }));


        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleStyleChange = this.handleStyleChange.bind(this);
        this.setEditorReference = this.setEditorReference.bind(this);
    }

    componentWillUnmount() {
        this.disposables.forEach(disposable => disposable.unsubscribe());
    }

    //Used for when the form is deleted, to update the form
    componentWillReceiveProps({ dataEntryForm }) {
        if (this.props.dataEntryForm && !dataEntryForm) {
            this._editor.setData('');
        }
    }

    handleDeleteClick() {
        this.props.onFormDelete();
    }

    handleStyleChange(e, i, value) {
        if (this.props.dataEntryForm.style !== value) {
            this.props.onStyleChange(value);
        }
    }

    handleEditorChanged = (editorData) => {
        //prevent creation of new dataEntryForm when empty
        if(!editorData && !this.props.dataEntryForm) {
            return;
        }
        const { usedIds, outHtml} = processFormData(editorData, { ...this.state.programElements, ...this.props.elements } );

        this.setState({
            usedIds,
        }, () => {
            // Emit a value when the html changed
            if (!this.props.dataEntryForm || this.props.dataEntryForm.htmlCode !== outHtml) {
                this.props.onFormChange(outHtml);
            }
        });
    }

    insertElement(id) {
        if (this.state.usedIds.indexOf(id) !== -1) {
            return;
        }
        return insElem(id, this.props.elements[id], this._editor, 'attributeid');
    }

    insertProgramElement(id) {
        if (this.state.usedIds.indexOf(id) !== -1) {
            return;
        }
        return insElem(id, this.state.programElements[id], this._editor, 'programid');
    }

    setEditorReference(editor) {
        this._editor = editor;
    }

    renderPalette() {
        return (
            <div className="paletteContainer" style={{ }}>
                <div className="palette">
                    <div style={styles.paletteFilter}>
                        <TextField
                            hintText={this.getTranslation('filter_elements')}
                            style={styles.paletteFilterField}
                            onChange={this.filterAction}
                            fullWidth
                        />
                    </div>
                    <div className="elements">
                        <PurePaletteSection
                            keySet={this.props.elements}
                            label="attributes"
                            filter={this.state.filter}
                            expand={this.state.expand}
                            expandClick={() => { this.setState({ expand: 'attributes' }); }}
                            usedIds={this.state.usedIds}
                            insertFn={this.state.insertFn}
                        />

                    </div>
                    <div className="elements">
                        <PurePaletteSection
                            keySet={this.state.programElements}
                            label="program"
                            filter={this.state.filter}
                            expand={this.state.expand}
                            expandClick={() => { this.setState({ expand: 'program' }); }}
                            usedIds={this.state.usedIds}
                            insertFn={this.state.insertFn}
                        />

                    </div>
                </div>
            </div>
        );
    }
    render() {
        const props = this.props;

        return this.state.formHtml === undefined ? <LoadingMask /> : (
            <div style={Object.assign({}, styles.formContainer, { })}>
                <div className="programStageEditForm">
                    <div className="left">
                        <CKEditor
                            onEditorChange={this.handleEditorChanged}
                            onEditorInitialized={this.setEditorReference}
                            initialContent={this.state.formHtml}
                        />
                        <Paper style={styles.formPaper}>
                            <div style={styles.formSection}>
                                <TextField
                                    floatingLabelText={this.getTranslation('form_name')}
                                    defaultValue={this.props.program.displayName}
                                    onChange={this.props.onFormNameChange} />
                                <SelectField
                                    value={getOr('NORMAL', 'style', props.dataEntryForm)}
                                    floatingLabelText="Form display style"
                                    onChange={this.handleStyleChange}
                                >
                                    <MenuItem value={'NORMAL'} primaryText={this.getTranslation('normal')} />
                                    <MenuItem value={'COMFORTABLE'} primaryText={this.getTranslation('comfortable')} />
                                    <MenuItem value={'COMPACT'} primaryText={this.getTranslation('compact')} />
                                    <MenuItem value={'NONE'} primaryText={this.getTranslation('none')} />
                                </SelectField>
                            </div>
                            <div style={styles.formSection}>
                                {props.dataEntryForm && props.dataEntryForm.id ? (
                                    <FlatButton
                                        primary
                                        label={this.getTranslation('delete')}
                                        style={styles.deleteButton}
                                        onClick={this.handleDeleteClick}
                                    />
                                ) : undefined}
                            </div>
                        </Paper>
                    </div>
                    <div className="right">
                        {this.renderPalette()}
                    </div>
                </div>
            </div>
        );
    }
}

EditDataEntryForm.propTypes = {
    params: PropTypes.object,
    onFormChange: PropTypes.func,
    onStyleChange: PropTypes.func,
    onFormDelete: PropTypes.func,
};

EditDataEntryForm.defaulRFFtProps = {
    onFormChange: noop,
    onStyleChange: noop,
    onFormDelete: noop,
};

EditDataEntryForm.contextTypes = {
    d2: PropTypes.any,
};

const mapDispatchToPropsForProgram = (dispatch, { program }) => bindActionCreators({
    onFormChange: curry(programDataEntryFormChanged)('htmlCode'),
    onFormNameChange: (e) => programDataEntryFormChanged('name', e.target.value),
    onStyleChange: curry(programDataEntryFormChanged)('style'),
    onFormDelete: programDataEntryFormRemove.bind(undefined, program.id),
}, dispatch);

const programDataEntryForm = compose(
    mapPropsStream(props$ => props$
        .combineLatest(
            eventProgramStore,
            (props, {program, availableAttributes }) => ({
                ...props,
                program,
                dataEntryForm: program.dataEntryForm,
                elements: pteaToAttributes({ programTrackedEntityAttributes: program.programTrackedEntityAttributes, availableAttributes}), //getProgramStageDataElementsByStageId(state)(programStage.id),
                formTitle: program.displayName
            })
        )
    ),
    connect(undefined, mapDispatchToPropsForProgram)
);

export const CustomRegistrationDataEntryForm = programDataEntryForm(EditDataEntryForm);
