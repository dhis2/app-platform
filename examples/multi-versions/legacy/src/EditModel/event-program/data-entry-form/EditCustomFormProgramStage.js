import Action from 'd2-ui/lib/action/Action';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import { compose, getOr, noop, curry } from 'lodash/fp';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import Paper from 'material-ui/Paper/Paper';
import SelectField from 'material-ui/SelectField/SelectField';
import TextField from 'material-ui/TextField/TextField';
import PropTypes from 'prop-types';
import React from 'react';
import mapPropsStream from 'recompose/mapPropsStream';
import { Observable } from 'rxjs';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import eventProgramStore from '../eventProgramStore';
import { getProgramStageDataElementsByStageId } from "../notifications/selectors";
import { dataEntryFormChanged, dataEntryFormRemove } from './actions';
import CKEditor from './CKEditor';
import { bindFuncsToKeys, processFormData, insertElement as insElem } from "./dataEntryFormUtils";
import PaletteSection from './PaletteSection';

const programStageDataElementWithProgramStageId = programStageId => programStageDataElement => ({
    id: `${programStageId}.${programStageDataElement.id}`,
    displayName: programStageDataElement.displayName
})

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

        const dataEntryForm = props.dataEntryForm;

        this.state = {
            usedIds: [],
            filter: '',
            expand: 'data_elements',
            insertFn: {},
        };

        this.disposables = new Set();
        const { programStage, dataElements } = props;
        // Load flags
        this.disposables.add(Observable.fromPromise(context.d2.Api.getApi().get('system/flags'))
            .subscribe(flags => {
                // Operands with ID's that contain a dot ('.') are combined dataElementId's and categoryOptionId's
                // The API returns "dataElementId.categoryOptionId", which are transformed to the format expected by
                // custom forms: "dataElementId-categoryOptionId-val"
                this.operands = dataElements
                    .map(programStageDataElementWithProgramStageId(programStage.id))
                    .filter(op => op.id.indexOf('.') !== -1)
                    .reduce((out, op) => {
                        const id = `${op.id.split('.').join('-')}-val`;
                        out[id] = op.displayName; // eslint-disable-line
                        return out;
                    }, {});

                this.flags = flags.reduce((out, flag) => {
                    out[flag.path] = flag.name; // eslint-disable-line
                    return out;
                }, {});

                // Create inserter functions for all insertable elements
                // This avoids having to bind the functions during rendering
                const boundOps = bindFuncsToKeys(this.operands, this.insertElement, this);
                const boundFlags = bindFuncsToKeys(this.flags, this.insertFlag, this);
                const insertFn = { ...boundOps, ...boundFlags}

                const { usedIds, outHtml } = processFormData(getOr('', 'htmlCode', dataEntryForm), this.operands);
                const formHtml = dataEntryForm ? outHtml : '';

                this.setState({
                    usedIds,
                    insertFn,
                    formHtml,
                    dataEntryForm,
                    formTitle: this.props.formTitle,
                });
            }));

        // Create element filtering action
        this.filterAction = Action.create('filter');
        this.disposables.add(this.filterAction
            .map(({ data, complete, error }) => ({ data: data[1], complete, error }))
            .debounceTime(75)
            .subscribe((args) => {
                const filter = args.data
                    .split(' ')
                    .filter(x => x.length);
                this.setState({ filter });
            }));

        this.getTranslation = this.context.d2.i18n.getTranslation.bind(this.context.d2.i18n);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleStyleChange = this.handleStyleChange.bind(this);
        this.setEditorReference = this.setEditorReference.bind(this);
    }

    componentWillUnmount() {
        this.disposables.forEach(disposable => disposable.unsubscribe());
    }

    //Used for when the form is deleted, to update the form
    componentWillReceiveProps({ dataEntryForm }) {
        if (this.props.dataEntryForm && (!dataEntryForm || !dataEntryForm.id )) {
            this._editor.setData('');
        }
    }

    handleDeleteClick() {
        this.props.onFormDelete();
    }

    handleStyleChange(e, i, value) {
        if (this.state.dataEntryForm.style !== value) {
            this.props.onStyleChange(value);
        }
    }

    handleEditorChanged = (editorData) => {
        // prevent changes when not active
        if (!this.props.isActive) {
            return;
        }

        //prevent creation of new dataEntryForm when empty
        if(!editorData && !this.props.dataEntryForm) {
            return;
        }
        const { usedIds, outHtml} = processFormData(editorData, this.operands);
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
        return insElem(id, this.operands[id], this._editor);
    }

    insertFlag(img) {
        this._editor.insertHtml(`<img src="../dhis-web-commons/flags/${img}" />`, 'unfiltered_html');
        const range = this._editor.getSelection().getRanges()[0];
        range.moveToElementEditablePosition(range.endContainer, true);
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
                            keySet={this.operands}
                            label="data_elements"
                            filter={this.state.filter}
                            expand={this.state.expand}
                            expandClick={() => { this.setState({ expand: 'data_elements' }); }}
                            usedIds={this.state.usedIds}
                            insertFn={this.state.insertFn}
                        />
                        <PurePaletteSection
                            keySet={this.flags}
                            label="flags"
                            filter={this.state.filter}
                            expand={this.state.expand}
                            expandClick={() => { this.setState({ expand: 'flags' }); }}
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
    elements: PropTypes.array,
};

EditDataEntryForm.defaultProps = {
    onFormChange: noop,
    onStyleChange: noop,
    onFormDelete: noop,
};

EditDataEntryForm.contextTypes = {
    d2: PropTypes.any,
};

const mapDispatchToPropsForProgramStage = (dispatch, { programStage }) => bindActionCreators({
    onFormChange: curry(dataEntryFormChanged)(programStage.id)('htmlCode'),
    onStyleChange: curry(dataEntryFormChanged)(programStage.id)('style'),
    onFormDelete: dataEntryFormRemove.bind(undefined, programStage.id),
}, dispatch);

const programStageDataEntryForm = compose(
    mapPropsStream(props$ => props$
        .combineLatest(
            eventProgramStore,
            ({programStage, ...props}, state) => ({
                ...props,
                programStage,
                dataEntryForm: state.dataEntryFormForProgramStage[programStage.id],
                dataElements: getProgramStageDataElementsByStageId(state)(programStage.id),
                formTitle: programStage.displayName
            })
        )
    ),
    connect(undefined, mapDispatchToPropsForProgramStage)
);

export default programStageDataEntryForm(EditDataEntryForm);
