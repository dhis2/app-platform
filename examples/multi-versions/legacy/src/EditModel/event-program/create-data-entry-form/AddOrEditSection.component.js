import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import RenderTypeSelectField, {
    PROGRAM_STAGE_SECTION_RENDER_TYPES,
    DEFAULT_PROGRAM_STAGE_RENDER_TYPE,
    MOBILE, DESKTOP,
} from '../render-types';

const styles = {
    container: {
        textAlign: 'right',
        width: '100%',
    },
};

const initialState = {
    section: {
        id: null,
        name: '',
        description: '',
        renderType: {
            MOBILE: {
                type: DEFAULT_PROGRAM_STAGE_RENDER_TYPE,
            },
            DESKTOP: {
                type: DEFAULT_PROGRAM_STAGE_RENDER_TYPE,
            },
        },
    },
};

class AddOrEditSection extends Component {
    constructor(props) {
        super(props);
        this.state = { ...initialState };
    }

    componentDidUpdate(prevProps) {
        if (this.props.editingSection && !prevProps.editingSection) {
            this.showDialogForEditingModel(this.props.editingSection);
        }
    }

    onNameChanged = (event, sectionName) => {
        this.setState({ section: { ...this.state.section, name: sectionName } });
    };

    onDescriptionChanged = (event, sectionDescription) => {
        this.setState({ section: { ...this.state.section, description: sectionDescription } });
    };

    onRenderTypeChanged = (newSectionState) => {
        this.setState({ section: newSectionState });
    };

    getTranslation = key =>
        this.context.d2.i18n.getTranslation(key);

    getSaveData() {
        const { section } = this.state;
        return {
            ...section,
            renderType: {
                MOBILE: {
                    type: section.renderType,
                },
                DESKTOP: {
                    type: section.renderType,
                },
            },
        };
    }

    showDialogForEditingModel(editingSection) {
        const { id, name, description, renderType } = editingSection;
        this.setState({
            section: {
                id,
                name,
                description,
                renderType: {
                    MOBILE: {
                        type: renderType ? renderType.MOBILE.type : DEFAULT_PROGRAM_STAGE_RENDER_TYPE,
                    },
                    DESKTOP: {
                        type: renderType ? renderType.DESKTOP.type : DEFAULT_PROGRAM_STAGE_RENDER_TYPE,
                    },
                },
            },
        });
    }

    closeDialog = () => {
        this.props.clearEditingSection();
        this.setState({ ...initialState });
    };

    openDialog = () => {
        this.setState({ dialogOpen: true });
    };

    confirmAddNewSection = () => {
        this.closeDialog();
        this.props.onSectionAdded(this.state.section);
    };

    confirmUpdateSection = () => {
        const { section } = this.state;
        this.closeDialog();
        this.props.onSectionUpdated(section.id, section);
    }

    focusOnSectionName = (input) => {
        if (input) {
            setTimeout(() => { input.focus(); }, 20);
        }
    };

    render = () => {
        const { id, name, description } = this.state.section;

        let titleTxt;
        let confirmHandler;
        let confirmTxt;
        if (id) {
            titleTxt = this.getTranslation('update_section');
            confirmHandler = this.confirmUpdateSection;
            confirmTxt = this.getTranslation('update');
        } else {
            titleTxt = this.getTranslation('add_new_section');
            confirmHandler = this.confirmAddNewSection;
            confirmTxt = this.getTranslation('add');
        }

        const actions = [
            <FlatButton
                primary
                label={this.getTranslation('cancel')}
                onTouchTap={this.closeDialog}
            />,
            <FlatButton
                primary
                label={confirmTxt}
                disabled={!name}
                onTouchTap={confirmHandler}
            />,
        ];

        return (
            <div style={styles.container}>
                <Dialog
                    title={titleTxt}
                    actions={actions}
                    open={this.props.open}
                    onRequestClose={this.closeDialog}
                    autoScrollBodyContent
                >
                    <TextField
                        ref={this.focusOnSectionName}
                        hintText={this.getTranslation('name')}
                        onChange={this.onNameChanged}
                        value={name}
                        fullWidth
                    />
                    <TextField
                        hintText={this.getTranslation('description')}
                        onChange={this.onDescriptionChanged}
                        value={description}
                        fullWidth
                        multiLine
                        rows={2}
                        rowsMax={4}
                    />
                    <RenderTypeSelectField
                        device={MOBILE}
                        target={this.state.section}
                        options={PROGRAM_STAGE_SECTION_RENDER_TYPES}
                        inDialog
                        changeHandler={this.onRenderTypeChanged}
                    />
                    <RenderTypeSelectField
                        device={DESKTOP}
                        target={this.state.section}
                        options={PROGRAM_STAGE_SECTION_RENDER_TYPES}
                        inDialog
                        changeHandler={this.onRenderTypeChanged}
                    />
                </Dialog>
            </div>
        );
    }
}

AddOrEditSection.propTypes = {
    onSectionAdded: PropTypes.func.isRequired,
    onSectionUpdated: PropTypes.func.isRequired,
    editingSection: PropTypes.object,
    clearEditingSection: PropTypes.func.isRequired,
};

AddOrEditSection.defaultProps = {
    editingSection: null,
};

AddOrEditSection.contextTypes = {
    d2: PropTypes.object,
};

export default AddOrEditSection;
