import React from 'react';
import log from 'loglevel';

import Dialog from 'material-ui/Dialog/Dialog';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import Checkbox from 'material-ui/Checkbox/Checkbox';
import DropDown from '../forms/form-fields/drop-down';

import snackActions from '../Snackbar/snack.actions';

import modelToEditStore from './modelToEditStore';


const styles = {
    dialogContent: {
        maxWidth: 'none',
    },
    dialogDiv: {
        overflowX: 'auto',
        overflowY: 'hidden',
    },
    table: {
        borderSpacing: 0,
        borderCollapse: 'collapse',
        margin: '32px auto',
    },
    th: {
        whiteSpace: 'nowrap',
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        padding: 6,
    },
    thDataElements: {
        whiteSpace: 'nowrap',
        border: '1px solid #e0e0e0',
        background: '#f0f0f0',
        textAlign: 'left',
        padding: 6,
    },
    td: {
        whiteSpace: 'nowrap',
        padding: 2,
        border: '1px solid #e0e0e0',
        minWidth: 105,
    },
    tdDataElement: {
        whiteSpace: 'nowrap',
        padding: 6,
        border: '1px solid #e0e0e0',
    },
};

class GreyFieldDialog extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            categories: [],
        };

        this.closeDialog = this.closeDialog.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);

        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

    componentWillReceiveProps(props) {
        const d2 = this.context.d2;

        if (props.sectionModel) {
            const dataElements = props.sectionModel.dataElements.toArray();
            if (dataElements.length < 1) {
                log.info(`Section ${props.sectionModel.displayName} contains no data elements`);
                snackActions.show({ message: this.getTranslation('this_section_has_no_data_elements'), action: 'ok' });
                this.props.onRequestClose();
                return;
            }

            let cocMap = {};

            const categoryArrayToMap = (categories) => {
                let appendage = null;

                const reduceAppendage = (prev, categoryOption) => {
                    const out = prev;
                    out[categoryOption.id] = appendage;
                    return out;
                };

                while (categories.length > 0) {
                    appendage = categories.pop().categoryOptions.toArray().reduce(reduceAppendage, {});
                }
                return appendage;
            };

            const assignCocs = (cocMap, options, coc) => {
                if (options.length > 0) {
                    return Object.keys(cocMap).reduce((prev, key) => {
                        const out = prev;
                        const keyPos = options.indexOf(key);
                        if (keyPos !== -1) {
                            options.splice(keyPos, 1);
                            out[key] = assignCocs(cocMap[key], options, coc);
                            return out;
                        }
                        out[key] = cocMap[key];
                        return out;
                    }, {});
                }
                return coc;
            };

            // Use the categoryCombos associated with the section to get categories and their category options
            d2.models.categoryCombos.list({
                filter: `id:in:[${props.sectionModel.categoryCombos.toArray().map(coc => coc.id)}]`,
                paging: false,
                fields: [
                    'id,displayName',
                    'categories[id,displayName,categoryOptions[id,displayName]]',
                    'categoryOptionCombos[id,displayName',
                    'categoryOptions[id,displayName]]',
                ].join(','),
            })
            .then((categoryCombos) => {
                categoryCombos.forEach((categoryCombo) => {
                    // Build a nested map of categories:
                    // { cat1_opt1 : { cat2_opt1: { cat3_opt1: null, cat3_opt2: null }, cat2_opt2: {...}, ... }, ... }
                    //
                    // Then convert to JSON and back as a fast way to remove any references within the structure
                    Object.assign(
                        cocMap,
                        JSON.parse(JSON.stringify(categoryArrayToMap(categoryCombo.categories.toArray())))
                    );

                    // Fill in the leaf nodes in the cocMap with the actual coc's
                    categoryCombo.categoryOptionCombos.toArray().forEach((coc) => {
                        const optionPath = coc.categoryOptions.toArray().map(o => o.id);
                        cocMap = assignCocs(cocMap, optionPath, { id: coc.id, displayName: coc.displayName });
                    });
                });

                const greyedFields = props.sectionModel.greyedFields.reduce((prev, gf) => {
                    if (prev.hasOwnProperty(gf.dataElement.id)) {
                        prev[gf.dataElement.id].push(gf.categoryOptionCombo.id);
                        return prev;
                    }

                    const out = prev;
                    out[gf.dataElement.id] = [gf.categoryOptionCombo.id];
                    return out;
                }, {});

                this.setState({
                    currentCategoryCombo: categoryCombos.toArray()[0].id,
                    categoryCombos,
                    optionCount: categoryCombos.toArray()
                        .reduce((oc, cc) => {
                            oc[cc.id] = cc.categories.toArray().map(c => c.categoryOptions.size);
                            return oc;
                        }, {}),
                    cocMap,
                    greyedFields,
                });
            });
        }
    }

    closeDialog() {
        this.props.onRequestClose();
    }

    handleSaveClick() {
        const greyedFields = [];
        Object.keys(this.state.greyedFields).forEach((dataElement) => {
            this.state.greyedFields[dataElement].forEach((coc) => {
                greyedFields.push({
                    dataElement: { id: dataElement },
                    categoryOptionCombo: { id: coc },
                });
            });
        });

        const section = Object.assign(this.props.sectionModel, { greyedFields });

        section
            .save()
            .then((res) => {
                log.info('Section updated', res);
                snackActions.show({ message: this.getTranslation('section_saved') });
                this.props.onRequestSave(section);
            })
            .catch((err) => {
                log.error('Failed to save section:', err);
                snackActions.show({ message: this.getTranslation('failed_to_save_section'), action: 'ok' });
            });
    }

    renderTableHeader() {
        let prevRowColCount = 1;

        return this.state.currentCategoryCombo && (
            this.state.categoryCombos.get(this.state.currentCategoryCombo).categories.toArray().map((cat, catNum) => {
                const colSpan = this.state.optionCount[this.state.currentCategoryCombo]
                    .slice(catNum + 1)
                    .reduce((product, optionCount) => optionCount * product, 1);

                const isLastHeader = catNum === this.state.categoryCombos.get(this.state.currentCategoryCombo).categories.size - 1;
                const row = (
                    <tr key={catNum}>
                        <th style={styles.thDataElements}>{isLastHeader && this.getTranslation('data_element')}</th>
                        {
                            // For each column in the previous row...
                            Array(...Array(prevRowColCount)).map((e, rep) =>
                                // ... render the columns for this row
                                 cat.categoryOptions.toArray().map((opt, optNum) => (
                                     <th
                                         key={`${optNum}.${rep}`}
                                         colSpan={colSpan}
                                         style={styles.th}
                                     >{opt.displayName === 'default' ? '' : opt.displayName}</th>
                                    )))
                        }
                    </tr>
                );
                prevRowColCount *= cat.categoryOptions.size;
                return row;
            })
        );
    }

    renderCheckbox(dataElement, fieldArray, fieldNum) {
        const resolveCoc = (cocMap, fields) => {
            if (fields.length === 0) {
                return cocMap;
            }

            const field = fields.shift();
            return resolveCoc(cocMap[field], fields);
        };

        const coc = resolveCoc(this.state.cocMap, fieldArray);

        const isGreyed =
            this.state.greyedFields.hasOwnProperty(dataElement.id) &&
            this.state.greyedFields[dataElement.id].indexOf(coc.id) !== -1;

        const toggleBoggle = ((dataElementId, categoryOptionComboId, event, disable) => {
            this.setState((state) => {
                const greyedCocs = (state.greyedFields[dataElementId] || []).slice();
                if (disable) {
                    if (greyedCocs.includes(categoryOptionComboId)) {
                        greyedCocs.splice(greyedCocs.indexOf(categoryOptionComboId), 1);
                    }
                } else if (!greyedCocs.includes(categoryOptionComboId)) {
                    greyedCocs.push(categoryOptionComboId);
                }

                const greyedFields = Object.keys(state.greyedFields)
                    .reduce((prev, deId) => {
                        const out = prev;
                        out[deId] = deId === dataElementId ? greyedCocs : state.greyedFields[deId];
                        return out;
                    }, {});

                if (greyedCocs.length > 0 && !greyedFields.hasOwnProperty(dataElementId)) {
                    greyedFields[dataElementId] = greyedCocs;
                }

                return { greyedFields };
            });
        }).bind(this, dataElement.id, coc.id);

        return (
            <td key={fieldNum} style={styles.td}>
                <Checkbox
                    checked={!isGreyed}
                    label={isGreyed ? this.getTranslation('disabled') : this.getTranslation('enabled')}
                    labelPosition="right"
                    labelStyle={{ whiteSpace: 'nowrap' }}
                    onCheck={toggleBoggle}
                />
            </td>
        );
    }

    renderDataElements() {
        const getCocFields = () => this.state.categoryCombos.get(this.state.currentCategoryCombo).categories
                .toArray()
                .reduce((prev, cat) => {
                    if (prev.length > 0) {
                        const out = [];
                        prev.forEach((p) => {
                            cat.categoryOptions.toArray().forEach((opt) => {
                                const pout = p.slice();
                                pout.push(opt.id);
                                out.push(pout);
                            });
                        });
                        return out;
                    }

                    cat.categoryOptions.toArray().forEach((opt) => {
                        prev.push([opt.id]);
                    });
                    return prev;
                }, []);

        const currentSectionDataElementIds = this.props.sectionModel.dataElements.toArray().map(de => de.id);
        return this.state.currentCategoryCombo ?
            modelToEditStore.state.dataSetElements
                .filter(dse => currentSectionDataElementIds.includes(dse.dataElement.id))
                .filter(dse => (dse.categoryCombo ? dse.categoryCombo.id : dse.dataElement.categoryCombo.id) === this.state.currentCategoryCombo)
                .sort((a, b) => currentSectionDataElementIds.indexOf(a.dataElement.id) - currentSectionDataElementIds.indexOf(b.dataElement.id))
                .map((dse, deNum) => {
                    const cocFields = getCocFields();
                    return (
                        <tr key={deNum} style={{ background: deNum % 2 === 0 ? 'none' : '#f0f0f0' }}>
                            <td style={styles.tdDataElement}>{dse.dataElement.displayName}</td>
                            {cocFields.map((fields, fieldNum) => this.renderCheckbox(dse.dataElement, fields, fieldNum))}
                        </tr>
                    );
                }) : null;
    }

    render() {
        const title = this.props.sectionModel.displayName;
        const {
            open,
            ...extraProps
        } = this.props;

        let uniqueCatComboIds = [],
            sectionDataElementIds = [],
            categoryCombosForSection = [];

        if (this.props.sectionModel) {
            // Get data element ids for the current section
            sectionDataElementIds = this.props.sectionModel.dataElements.toArray().map(de => de.id);

            // Get unique cat combos for data elements in current section
            categoryCombosForSection = modelToEditStore.state.dataSetElements
                .filter(dse => sectionDataElementIds.includes(dse.dataElement.id))
                .map(dse => dse.categoryCombo || dse.dataElement.categoryCombo)
                .reduce((catCombos, catCombo) => {
                    if (!uniqueCatComboIds.includes(catCombo.id)) {
                        uniqueCatComboIds.push(catCombo.id);
                        catCombos.push(catCombo);
                    }
                    return catCombos;
                }, [])
                .sort((a, b) => a.displayName.localeCompare(b.displayName));
        }

        return (
            <Dialog
                autoScrollBodyContent
                autoDetectWindowHeight
                title={`${this.getTranslation('manage_grey_fields')}: ${title}`}
                style={{ maxWidth: 'none' }}
                contentStyle={styles.dialogContent}
                open={open && this.props.sectionModel.dataElements.size > 0}
                {...extraProps}
                actions={[
                    <FlatButton
                        label={this.getTranslation('cancel')}
                        onTouchTap={this.closeDialog}
                        style={{ marginRight: 16 }}
                    />,
                    <RaisedButton
                        primary
                        label={this.getTranslation('save')}
                        onTouchTap={this.handleSaveClick}
                    />,
                ]}
                onRequestClose={this.closeDialog}
            >
                {this.props.sectionModel && this.props.sectionModel.categoryCombos && this.props.sectionModel.categoryCombos.size > 1 ? (
                    <DropDown
                        options={categoryCombosForSection.map(cc => ({
                            value: cc.id,
                            text: cc.displayName === 'default' ? this.getTranslation('none') : cc.displayName,
                        }))}
                        labelText={this.getTranslation('category_combo')}
                        value={this.state.currentCategoryCombo}
                        onChange={e => this.setState({
                            currentCategoryCombo: e.target.value,
                        })}
                        style={{ width: '33%' }}
                        isRequired
                    />
                ) : null}
                <div style={styles.dialogDiv}>
                    <table style={styles.table}>
                        <tbody>
                            {this.renderTableHeader()}
                            {this.state.currentCategoryCombo && this.props.sectionModel && this.renderDataElements()}
                        </tbody>
                    </table>
                </div>
            </Dialog>
        );
    }
}

GreyFieldDialog.contextTypes = { d2: React.PropTypes.any.isRequired };
GreyFieldDialog.propTypes = {
    open: React.PropTypes.bool.isRequired,
    sectionModel: React.PropTypes.any.isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    onRequestSave: React.PropTypes.func.isRequired,
};

export default GreyFieldDialog;
