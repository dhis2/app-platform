import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import DoneAllIcon from 'material-ui/svg-icons/action/done-all';
import DoneIcon from 'material-ui/svg-icons/action/done';
import ClearIcon from 'material-ui/svg-icons/content/clear';

const Toolbar = ({ selectAll, selectSimilar, deselectAll, areAllSelected, areNoneSelected }, { d2 }) => {
    const translate = s => d2.i18n.getTranslation(s);
    return (
        <div
            style={{
                alignSelf: 'flex-end',
                height: 60,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <FlatButton
                primary
                labelPosition="before"
                disabled={areNoneSelected}
                style={{ height: 45 }}
                icon={<ClearIcon />}
                label={translate("deselect_all")}
                onClick={deselectAll}
            />
            <FlatButton
                primary
                labelPosition="before"
                style={{ height: 45 }}
                icon={<DoneIcon />}
                label={translate("select_similar")}
                onClick={selectSimilar}
            />
            <FlatButton
                primary
                labelPosition="before"
                disabled={areAllSelected}
                style={{ height: 45 }}
                icon={<DoneAllIcon />}
                label={translate("select_all")}
                onClick={selectAll}
            />
        </div>
    );
}

Toolbar.contextTypes = {
    d2: PropTypes.object,
};

export default Toolbar;
