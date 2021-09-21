import React from 'react';
import PropTypes from 'prop-types';
import { hideIfNotAuthorizedToCreate } from './NotificationList';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import { SpeedDial, BubbleList, BubbleListItem } from 'react-speed-dial';

class TrackerNotificationAddButton extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            items: [
                {
                    id: 'PROGRAM_NOTIFICATION',
                    primaryText: context.d2.i18n.getTranslation(
                        'program_notification'
                    ),
                    rightAvatar: (
                        <Avatar
                            className="material-icons"
                            icon={<FontIcon>event</FontIcon>}
                        />
                    ),
                },
                {
                    id: 'PROGRAM_STAGE_NOTIFICATION',
                    primaryText: context.d2.i18n.getTranslation(
                        'program_stage_notification'
                    ),
                    rightAvatar: (
                        <Avatar
                            className="material-icons"
                            icon={<FontIcon>event_note</FontIcon>}
                        />
                    ),
                },
            ],
            open: false,
        };
    }

    handleOpen = ({ isOpen }) => {
        this.setState({
            ...this.state,
            open: isOpen,
        });
    };

    handleItemClick = (item, event) => {
        this.setState({
            ...this.state,
            open: false,
        });

        this.props.onAddClick(item);
    };

    render() {
        return (
            <SpeedDial
                hasBackdrop={true}
                isOpen={this.state.open}
                onChange={this.handleOpen}
            >
                <BubbleList>
                    {this.state.items.map((item, index) =>
                        <BubbleListItem
                            key={item.id}
                            {...item}
                            onClick={this.handleItemClick.bind(this, item.id)}
                        />
                    )}
                </BubbleList>
            </SpeedDial>
        );
    }
}

TrackerNotificationAddButton.propTypes = {
    onAddClick: PropTypes.func.isRequired,
};

const TrackerNotificationAddButtonWithContext = hideIfNotAuthorizedToCreate(
    addD2Context(TrackerNotificationAddButton)
);

export default TrackerNotificationAddButtonWithContext;
