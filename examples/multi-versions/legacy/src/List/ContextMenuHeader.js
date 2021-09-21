import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

export default class ContextMenuHeader extends Component {
    static propTypes = {
        actions: PropTypes.array,
    };

    state = {
        open: false,
    };

    handleOpen = event => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    handleAction = (action) => {
        this.handleRequestClose()
        action();
    }

    render() {
        const actions = this.props.actions.map(action => (
            <MenuItem
                primaryText={action.title}
                key={action.title}
                leftIcon={
                    <FontIcon className="material-icons">{action.icon}</FontIcon>
                }
                onClick={() => this.handleAction(action.action)}
            />
        ));
        return (
            <div>
                <IconButton onClick={this.handleOpen}>
                    <FontIcon color="gray" className="material-icons">
                        settings
                    </FontIcon>
                </IconButton>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onRequestClose={this.handleRequestClose}
                >
                    <Menu>
                        {actions}
                    </Menu>
                </Popover>
            </div>
        );
    }
}
