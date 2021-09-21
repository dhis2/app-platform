import React from 'react';
import Rx from 'rxjs';
import log from 'loglevel';

import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import SelectField from 'material-ui/SelectField/SelectField';
import MenuItem from 'material-ui/MenuItem/MenuItem';
import Paper from 'material-ui/Paper/Paper';
import TextField from 'material-ui/TextField/TextField';
import CheckBox from 'material-ui/Checkbox/Checkbox';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import Action from 'd2-ui/lib/action/Action';

import snackActions from '../Snackbar/snack.actions';
import modelToEditStore from './modelToEditStore';
import { goToRoute } from '../router-utils';



const inputPattern = /<input.*?\/>/gi;
const dataElementCategoryOptionIdPattern = /id="(\w*?)-(\w*?)-val"/;
const dataElementPattern = /dataelementid="(\w{11})"/;
const indicatorPattern = /indicatorid="(\w{11})"/;

function clampPaletteWidth(width) {
    return Math.min(750, Math.max(width, 250));
}


// TODO?: Automatic labels <span label-id="{id}-{id}"></span> / <span label-id="{id}"></span>

const styles = {
    heading: {
        paddingBottom: 18,
    },
    formContainer: {},
    formPaper: {
        width: '100%',
        margin: '0 auto 2rem',
        padding: '1px 4rem 4rem',
        position: 'relative',
    },
    formSection: {
        marginTop: 28,
    },
    cancelButton: {
        marginLeft: '2rem',
    },
    deleteButton: {
        marginLeft: '2rem',
    },
    paletteHeader: {},
    paletteFilter: {
        position: 'absolute',
        top: -16,
        width: '100%',
        padding: '8px 8px 16px',
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

        this.state = {
            usedIds: [],
            filter: '',
            paletteWidth: clampPaletteWidth(window.innerWidth / 3),
            expand: 'data_elements',
            insertGrey: false,
        };

        // Load form data, operands, indicators and flags
        Promise.all([
            context.d2.models.dataSets.get(props.params.modelId, {
                fields: 'id,displayName,dataEntryForm[id,style,htmlCode],indicators[id,displayName]',
            }),
            // TODO: Use d2.models when dataElementOperands are properly supported
            context.d2.Api.getApi().get('dataElementOperands', {
                paging: false,
                totals: true,
                fields: 'id,dimensionItem,displayName',
                dataSet: props.params.modelId,
            }),
            context.d2.Api.getApi().get('system/flags'),
        ]).then(([
            dataSet,
            ops,
            flags,
        ]) => {
            // Operands with ID's that contain a dot ('.') are combined dataElementId's and categoryOptionId's
            // The API returns "dataElementId.categoryOptionId", which are transformed to the format expected by
            // custom forms: "dataElementId-categoryOptionId-val"
            this.operands = ops.dataElementOperands
                .filter(op => op.dimensionItem.indexOf('.') !== -1)
                .reduce((out, op) => {
                    const id = `${op.dimensionItem.split('.').join('-')}-val`;
                    out[id] = op.displayName; // eslint-disable-line
                    return out;
                }, {});

            // Data element totals have only a single ID and thus no dot ('.')
            this.totals = ops.dataElementOperands
                .filter(op => op.dimensionItem.indexOf('.') === -1)
                .reduce((out, op) => {
                    out[op.id] = op.displayName; // eslint-disable-line
                    return out;
                }, {});

            this.indicators = dataSet.indicators.toArray()
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .reduce((out, i) => {
                    out[i.id] = i.displayName; // eslint-disable-line
                    return out;
                }, {});

            this.flags = flags.reduce((out, flag) => {
                out[flag.path] = flag.name; // eslint-disable-line
                return out;
            }, {});

            // Create inserter functions for all insertable elements
            // This avoids having to bind the functions during rendering
            this.insertFn = {};
            Object.keys(this.operands).forEach((x) => {
                this.insertFn[x] = this.insertElement.bind(this, x);
            });
            Object.keys(this.totals).forEach((x) => {
                this.insertFn[x] = this.insertElement.bind(this, x);
            });
            Object.keys(this.indicators).forEach((x) => {
                this.insertFn[x] = this.insertElement.bind(this, x);
            });
            Object.keys(this.flags).forEach((flag) => {
                this.insertFn[flag] = this.insertFlag.bind(this, flag);
            });

            // Create element filtering action
            this.filterAction = Action.create('filter');
            this.filterAction
                .map(({ data, complete, error }) => ({ data: data[1], complete, error }))
                .debounceTime(75)
                .subscribe((args) => {
                    const filter = args.data
                        .split(' ')
                        .filter(x => x.length);
                    this.setState({ filter });
                });

            const formHtml = dataSet.dataEntryForm ? this.processFormData(dataSet.dataEntryForm) : '';

            this.setState({
                formTitle: dataSet.displayName,
                formHtml,
                formStyle: dataSet.dataEntryForm && dataSet.dataEntryForm.style || 'NORMAL',
            }, () => {
                this._editor = window.CKEDITOR.replace('designTextarea', {
                    plugins: [
                        'a11yhelp', 'basicstyles', 'bidi', 'blockquote',
                        'clipboard', 'colorbutton', 'colordialog', 'contextmenu',
                        'dialogadvtab', 'div', 'elementspath', 'enterkey',
                        'entities', 'filebrowser', 'find', 'floatingspace',
                        'font', 'format', 'horizontalrule', 'htmlwriter',
                        'image', 'indentlist', 'indentblock', 'justify',
                        'link', 'list', 'liststyle', 'magicline',
                        'maximize', 'forms', 'pastefromword', 'pastetext',
                        'preview', 'removeformat', 'resize', 'selectall',
                        'showblocks', 'showborders', 'sourcearea', 'specialchar',
                        'stylescombo', 'tab', 'table', 'tabletools',
                        'toolbar', 'undo', 'wsc', 'wysiwygarea',
                    ].join(','),
                    removePlugins: 'scayt,wsc,about',
                    allowedContent: true,
                    extraPlugins: 'div',
                    height: 500,
                });
                this._editor.setData(this.state.formHtml);

                Rx.Observable.fromEventPattern((x) => {
                    this._editor.on('change', x);
                })
                    .debounceTime(250)
                    .subscribe(() => {
                        this.processFormData.call(this, this._editor.getData());
                    });
            });
        });

        this.getTranslation = this.context.d2.i18n.getTranslation.bind(this.context.d2.i18n);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleStyleChange = this.handleStyleChange.bind(this);

        this.startResize = this.startResize.bind(this);
        this.doResize = this.doResize.bind(this);
        this.endResize = this.endResize.bind(this);
    }

    componentWillUnmount() {
        if (this._editor) {
            this._editor.destroy();
        }
    }

    handleSaveClick() {
        const payload = {
            style: this.state.formStyle,
            htmlCode: this._editor.getData(),
        };
        this.context.d2.Api.getApi().post(['dataSets', this.props.params.modelId, 'form'].join('/'), payload)
            .then(() => {
                log.info('Form saved successfully');
                snackActions.show({ message: this.getTranslation('form_saved') });
                goToRoute('list/dataSetSection/dataSet');
            })
            .catch((e) => {
                log.warn('Failed to save form:', e);
                snackActions.show({
                    message: `${this.getTranslation('failed_to_save_form')}${e.message ? `: ${e.message}` : ''}`,
                    action: this.context.d2.i18n.getTranslation('ok'),
                });
            });
    }

    handleCancelClick() {
        goToRoute('list/dataSetSection/dataSet');
    }

    handleDeleteClick() {
        snackActions.show({
            message: this.getTranslation('dataentryform_confirm_delete'),
            action: 'confirm',
            onActionTouchTap: () => {
                this.context.d2.Api.getApi()
                    .delete(['dataEntryForms', modelToEditStore.state.dataEntryForm.id].join('/'))
                    .then(() => {
                        snackActions.show({ message: this.getTranslation('form_deleted') });
                        goToRoute('list/dataSetSection/dataSet');
                    })
                    .catch((err) => {
                        log.error('Failed to delete form:', err);
                        snackActions.show({ message: this.getTranslation('failed_to_delete_form'), action: 'ok' });
                    });
            },
        });
    }

    handleStyleChange(e, i, value) {
        this.setState({
            formStyle: value,
        });
    }

    startResize(e) {
        this._startPos = e.clientX;
        this._startWidth = this.state.paletteWidth;
        window.addEventListener('mousemove', this.doResize);
        window.addEventListener('mouseup', this.endResize);
    }

    doResize(e) {
        if (!e.buttons) {
            // If no buttons are pressed it probably simply means we missed a mouseUp event - so stop resizing
            this.endResize();
        }
        e.preventDefault();
        e.stopPropagation();
        const width = clampPaletteWidth(this._startWidth + (this._startPos - e.clientX));
        window.requestAnimationFrame(() => {
            this.setState({
                paletteWidth: width,
            });
        });
    }

    endResize() {
        window.removeEventListener('mousemove', this.doResize);
        window.removeEventListener('mouseup', this.endResize);
    }

    generateHtml(id, styleAttr, disabledAttr) {
        const style = styleAttr ? ` style=${styleAttr}` : '';
        const disabled = disabledAttr || this.state.insertGrey ? ' disabled="disabled"' : '';

        if (id.indexOf('-') !== -1) {
            const label = this.operands && this.operands[id];
            const attr = `name="entryfield" title="${label}" value="[ ${label} ]"${style}${disabled}`.trim();
            return `<input id="${id}" ${attr}/>`;
        } else if (this.totals.hasOwnProperty(id)) {
            const label = this.totals[id];
            const attr = `name="total" readonly title="${label}" value="[ ${label} ]"${style}${disabled}`.trim();
            return `<input dataelementid="${id}" id="total${id}" name="total" ${attr}/>`;
        } else if (this.indicators.hasOwnProperty(id)) {
            const label = this.indicators[id];
            const attr = `name="indicator" readonly title="${label}" value="[ ${label} ]"${style}${disabled}`.trim();
            return `<input indicatorid="${id}" id="indicator${id}" ${attr}/>`;
        }

        log.warn('Failed to generate HTML for ID:', id);
        return '';
    }

    processFormData(formData) {
        const inHtml = formData.hasOwnProperty('htmlCode') ? formData.htmlCode : formData || '';
        let outHtml = '';

        const usedIds = [];

        let inputElement = inputPattern.exec(inHtml);
        let inPos = 0;
        while (inputElement !== null) {
            outHtml += inHtml.substr(inPos, inputElement.index - inPos);
            inPos = inputPattern.lastIndex;

            const inputHtml = inputElement[0];
            const inputStyle = (/style="(.*?)"/.exec(inputHtml) || ['', ''])[1];
            const inputDisabled = /disabled/.exec(inputHtml) !== null;

            const idMatch = dataElementCategoryOptionIdPattern.exec(inputHtml);
            const dataElementTotalMatch = dataElementPattern.exec(inputHtml);
            const indicatorMatch = indicatorPattern.exec(inputHtml);
            if (idMatch) {
                const id = `${idMatch[1]}-${idMatch[2]}-val`;
                usedIds.push(id);
                outHtml += this.generateHtml(id, inputStyle, inputDisabled);
            } else if (dataElementTotalMatch) {
                const id = dataElementTotalMatch[1];
                usedIds.push(id);
                outHtml += this.generateHtml(id, inputStyle, inputDisabled);
            } else if (indicatorMatch) {
                const id = indicatorMatch[1];
                usedIds.push(id);
                outHtml += this.generateHtml(id, inputStyle, inputDisabled);
            } else {
                outHtml += inputHtml;
            }

            inputElement = inputPattern.exec(inHtml);
        }
        outHtml += inHtml.substr(inPos);

        this.setState({ usedIds });

        return outHtml;
    }

    insertElement(id) {
        if (this.state.usedIds.indexOf(id) !== -1) {
            return;
        }

        this._editor.insertHtml(this.generateHtml(id), 'unfiltered_html');
        this.setState(state => ({ usedIds: state.usedIds.concat(id) }));
        // Move the current selection to just after the newly inserted element
        const range = this._editor.getSelection().getRanges()[0];
        range.moveToElementEditablePosition(range.endContainer, true);
    }

    insertFlag(img) {
        this._editor.insertHtml(`<img src="../dhis-web-commons/flags/${img}" />`, 'unfiltered_html');
        const range = this._editor.getSelection().getRanges()[0];
        range.moveToElementEditablePosition(range.endContainer, true);
    }

    renderPaletteSection(keySet, label) {
        const filteredItems = Object.keys(keySet)
            .filter(key => !this.state.filter.length || this.state.filter.every(
                filter => keySet[key].toLowerCase().indexOf(filter.toLowerCase()) !== -1
            ));

        const cellClass = label === this.state.expand ? 'cell expanded' : 'cell';

        const expandClick = () => {
            this.setState({ expand: label });
        };

        return (
            <div className={cellClass}>
                <div style={styles.paletteHeader} className="header" onClick={expandClick}>
                    <div className="arrow">&#9656;</div>
                    {this.getTranslation(label)}:
                    <div className="count">{filteredItems.length}</div>
                </div>
                <div className="items">
                    {
                        filteredItems
                            .sort((a, b) => keySet[a] ? keySet[a].localeCompare(keySet[b]) : a.localeCompare(b))
                            .map((key) => {
                                // Active items are items that are not already added to the form
                                const isActive = this.state.usedIds.indexOf(key) === -1;
                                const className = isActive ? 'item active' : 'item inactive';
                                const name = keySet[key].name || keySet[key];
                                return (
                                    <div key={key} className={className} title={name}>
                                        <a onClick={this.insertFn[key]}>{name}</a>
                                    </div>
                                );
                            })
                    }
                </div>
            </div>
        );
    }

    renderPalette() {
        const toggleGrey = (e, value) => {
            this.setState({ insertGrey: value });
        };

        return (
            <div className="paletteContainer" style={{ width: this.state.paletteWidth }}>
                <div className="resizeHandle" onMouseDown={this.startResize} />
                <div className="palette">
                    <div style={styles.paletteFilter}>
                        <TextField
                            floatingLabelText={this.getTranslation('filter_elements')}
                            style={styles.paletteFilterField}
                            onChange={this.filterAction}
                        />
                    </div>
                    <div className="elements">
                        {this.renderPaletteSection(this.operands, 'data_elements')}
                        {this.renderPaletteSection(this.totals, 'totals')}
                        {this.renderPaletteSection(this.indicators, 'indicators')}
                        {this.renderPaletteSection(this.flags, 'flags')}
                    </div>
                    <CheckBox
                        label={this.getTranslation('insert_grey_fields')}
                        labelPosition="right"
                        style={styles.greySwitch}
                        onCheck={toggleGrey}
                        checked={this.state.insertGrey}
                    />
                </div>
            </div>
        );
    }

    render() {
        return this.state.formHtml === undefined ? <LoadingMask /> : (
            <div style={Object.assign({}, styles.formContainer, { marginRight: this.state.paletteWidth })}>
                <Heading style={styles.heading}>
                    {this.state.formTitle} {this.getTranslation('data_entry_form')}
                </Heading>
                {this.renderPalette()}
                <textarea id="designTextarea" name="designTextarea" />
                <Paper style={styles.formPaper}>
                    <div style={styles.formSection}>
                        <SelectField
                            value={this.state.formStyle}
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
                        <RaisedButton label={this.getTranslation('save')} primary onClick={this.handleSaveClick} />
                        <FlatButton
                            label={this.getTranslation('cancel')}
                            style={styles.cancelButton}
                            onClick={this.handleCancelClick}
                        />
                        {modelToEditStore.state.dataEntryForm && modelToEditStore.state.dataEntryForm.id ? (
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
        );
    }
}
EditDataEntryForm.propTypes = {
    params: React.PropTypes.object,
};
EditDataEntryForm.contextTypes = {
    d2: React.PropTypes.any,
};

export default EditDataEntryForm;
