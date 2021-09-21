import React, { Component } from 'react';
import { debounce, endsWith, sortBy } from 'lodash/fp';
import PropTypes from 'prop-types';
import Button from 'd2-ui/lib/button/Button';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import Icon from './Icon';
import filterIcons from './filterIcons';

export default class IconPickerDialog extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            open: false,
            iconKey: props.iconKey,
            selectedIconKey: props.iconKey,
            icons: null,
            iconTypeFilter: 'all',
            textFilter: '',
        };
        this.iconsCache = {
            all: null,
            positive: null,
            negative: null,
            outline: null,
        };

        this.debouncedUpdateTextFilter = debounce(375, this.updateTextFilter);
    }

    fetchIconLibrary = () => {
        this.context.d2.Api.getApi().get('/icons')
            .then((icons) => {
                const sortedIcons = sortBy('key', icons).map((icon) => {
                    // The '_positive', '_negative' and '_outline' suffixes are stripped for the searchKeys
                    // to make sure that search queries for 'negative' only return icons that actually have
                    // 'negative' in the relevant parts of the icon key.
                    icon.searchKey = icon.key.substring(0, icon.key.lastIndexOf('_'));
                    return icon;
                });
                this.iconsCache = {
                    all: sortedIcons,
                    positive: sortedIcons.filter(icon => endsWith('_positive', icon.key)),
                    negative: sortedIcons.filter(icon => endsWith('_negative', icon.key)),
                    outline: sortedIcons.filter(icon => endsWith('_outline', icon.key)),
                };
                this.setState({ icons: sortedIcons });
            });
    }

    handleOpen = () => {
        this.setState({ open: true });

        if (!this.icons) {
            this.fetchIconLibrary();
        }
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleCancel = () => {
        this.setState({
            selectedIconKey: this.props.iconKey //if cancelling revert back to original icon
        });
        this.handleClose();
    }

    handleConfirm = () => {
        this.setState({ iconKey: this.state.selectedIconKey });
        this.props.updateStyleState({ icon: this.state.selectedIconKey });
        this.handleClose();
    }

    handleIconSelect = (iconKey) => {
        this.setState({ selectedIconKey: iconKey });
    };

    handleTypeFilterClick = (type) => {
        this.setState({
            iconTypeFilter: type,
            icons: filterIcons(this.iconsCache[type], this.state.textFilter),
        });
    }

    handleTextFilterChange = (event) => {
        this.setState({ textFilter: event.target.value });
        this.debouncedUpdateTextFilter();
    }

    updateTextFilter = () => {
        const icons = this.iconsCache[this.state.iconTypeFilter];
        this.setState({
            icons: filterIcons(icons, this.state.textFilter),
        });
    }

    renderIconButtonImage = (iconKey) => {
        const contextPath = this.context.d2.system.systemInfo.contextPath;
        const altText = this.context.d2.i18n.getTranslation('current_icon');
        const fallbackIconPath = `${contextPath}/api/icons/dhis2_logo_outline/icon.svg`
        return (
            <img
                src={`${contextPath}/api/icons/${iconKey}/icon.svg`}
                alt={altText}
                className="icon-picker__icon-button-image"
                style={{ backgroundColor: 'white', overflow: 'hidden' }}
                onError={({ target }) => {
                    target.onerror = "";
                    target.src=fallbackIconPath;
                    return true;
                }}
            />
        );
    };

    renderIconButton = () => {
        const { iconKey } = this.state;
        const buttons = [];

        buttons.push(
            <Button
                onClick={this.handleOpen}
                style={{
                    backgroundColor: '#ff9800',
                    color: '#fff',
                    textAlign: 'center',
                    position: 'relative',
                    minWidth: 129,
                    height: 36,
                    lineHeight: 2.5,
                    marginTop: 10,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                }}
            >
                {iconKey &&
                    this.renderIconButtonImage(iconKey)
                }

                <span style={{ padding: '0 16px' }}>
                    {iconKey
                        ? this.context.d2.i18n.getTranslation('change_icon')
                        : this.context.d2.i18n.getTranslation('add_icon')
                    }
                </span>
            </Button>
        );

        if (iconKey) {
            buttons.push(
                <Button
                    onClick={this.handleDeselect}
                    style={{
                        backgroundColor: '#ccc',
                        color: 'black',
                        marginLeft: 20,
                        textAlign: 'center',
                        position: 'relative',
                        minWidth: 129,
                        height: 36,
                        lineHeight: 2.5,
                        marginTop: 10,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                    }}
                >
                    {this.context.d2.i18n.getTranslation('deselect_icon')}
                </Button>
            )
        }

        return buttons;
    }

    handleDeselect = () => {
        this.setState({ iconKey: '' });
        this.props.updateStyleState({ icon: '' });
    }

    renderActions = () => (
        [
            <RaisedButton
                label={this.context.d2.i18n.getTranslation('select')}
                primary
                onClick={this.handleConfirm}
            />,
            <FlatButton
                label={this.context.d2.i18n.getTranslation('cancel')}
                onClick={this.handleCancel}
            />,
        ]
    )

    renderTypeFilter = () => (
        <div className="icon-picker__filter-button-wrap">
            {
                ['all', 'positive', 'negative', 'outline'].map(type => (
                    <FlatButton
                        key={type}
                        label={this.context.d2.i18n.getTranslation(`icons_${type}`)}
                        primary={type === this.state.iconTypeFilter}
                        /* eslint-disable */
                        onClick={() => this.handleTypeFilterClick(type)}
                        /* eslint-enable */
                    />
                ))
            }
        </div>
    )

    renderTextFilter = () => (
        <TextField
            type="search"
            floatingLabelText={this.context.d2.i18n.getTranslation('icon_search')}
            value={this.state.textFilter}
            onChange={this.handleTextFilterChange}
        />
    )

    renderIconLibrary = () => {
        const { icons, selectedIconKey } = this.state;
        if (!icons) {
            return (
                <div className="icon-picker__list-loader">
                    <CircularProgress />
                </div>
            );
        }

        return (
            <div className="icon-picker__icon-list">
                {icons.map(icon => (
                    <Icon
                        icon={icon}
                        key={icon.key}
                        selectedIconKey={selectedIconKey}
                        handleClick={this.handleIconSelect}
                    />
                ))}
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderIconButton()}
                <Dialog
                    title={this.context.d2.i18n.getTranslation('select_icon')}
                    actions={this.renderActions()}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    className="icon-picker"
                    contentClassName="icon-picker__content"
                    titleClassName="icon-picker__title"
                    bodyClassName="icon-picker__body"
                    actionsContainerClassName="icon-picker__actions"
                    autoScrollBodyContent
                >
                    <div className="icon-picker__filter-bar">
                        {this.renderTypeFilter()}
                        {this.renderTextFilter()}
                    </div>
                    <div className="icon-picker__scroll-box">
                        {this.renderIconLibrary()}
                    </div>
                </Dialog>
            </div>
        );
    }
}

IconPickerDialog.propTypes = {
    iconKey: PropTypes.string.isRequired,
    updateStyleState: PropTypes.func.isRequired,
};

IconPickerDialog.contextTypes = {
    d2: PropTypes.object,
};
