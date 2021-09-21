import React from 'react';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import FontIcon from 'material-ui/FontIcon/FontIcon';
import Paper from 'material-ui/Paper/Paper';
import { withAuth } from "../utils/Auth";

const SharingNotification = React.createClass({
    propTypes: {
        modelType: React.PropTypes.string,
        style: React.PropTypes.object,
    },

    mixins: [Translate],

    render() {
        const modelDef = this.props.getModelDefinitionByName(this.props.modelType);
        const createPublic = this.props.getCurrentUser().canCreatePublic(modelDef);
        const createPrivate = this.props.getCurrentUser().canCreatePrivate(modelDef);
        const notificationStyle = Object.assign({}, this.props.style, {
            background: 'none',
            margin: '14px 0 0 -4px',
        });
        const notificationTextStyle = {
            verticalAlign: 'super',
            lineHeight: '24px',
            paddingLeft: '.5rem',
        };
        let toRender = null;

        if (createPublic) {
            toRender = (
                <Paper style={notificationStyle} zDepth={0}>
                    <FontIcon className="material-icons">lock_open</FontIcon><span style={notificationTextStyle}>{this.getTranslation('object_will_created_public')}</span>
                </Paper>
            );
        } else if (createPrivate) {
            toRender = (
                <Paper style={notificationStyle} zDepth={0}>
                    <FontIcon className="material-icons">lock</FontIcon><span style={notificationTextStyle}>{this.getTranslation('object_will_created_private')}</span>
                </Paper>
                );
        }

        return toRender;
    },
});

export default withAuth(SharingNotification);
