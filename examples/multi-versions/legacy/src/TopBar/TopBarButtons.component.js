import React from 'react';
import IconButton from 'material-ui/IconButton/IconButton';
import { goToRoute } from '../router-utils';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import { withProps, compose, renderNothing } from 'recompose';

function goToGroupEditor() {
    goToRoute('/group-editor');
}

function TopBarButton({ icon, toolTipText, onClick, disabled }, { d2 }) {
    const styles = {
        buttonStyle: {
            color: 'rgba(0,0,0,0.6)',
        },
        disabledButtonStyle: {
            color: 'rgba(0,0,0,0.2)',
        },
    };

    return (
        <IconButton
            iconClassName="material-icons"
            tooltip={d2.i18n.getTranslation(toolTipText)}
            tooltipPosition="bottom-left"
            onClick={onClick}
            iconStyle={disabled ? styles.disabledButtonStyle : styles.buttonStyle}
            disabled={disabled}
        >
            {icon}
        </IconButton>
    );
}

const GroupEditorButton = compose(
    withProps({
        icon: <span>&#xE428;</span>,
        toolTipText: 'metadata_group_editor',
        onClick: goToGroupEditor,
    }),
    addD2Context,
)(TopBarButton);

function TopBarButtons(props, { d2 }) {
    const showGroupEditor = () => d2.currentUser.canCreate(d2.models.dataElementGroup) || d2.currentUser.canCreate(d2.models.indicatorGroup);

    return (
        <div>
            {showGroupEditor() ? <GroupEditorButton disabled={props.disabled} /> : renderNothing()}
        </div>
    );
}

export default addD2Context(TopBarButtons);
