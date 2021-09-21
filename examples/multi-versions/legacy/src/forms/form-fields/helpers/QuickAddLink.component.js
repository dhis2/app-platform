import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton/IconButton';
import AddCircleOutlineIcon from 'material-ui/svg-icons/content/add-circle-outline';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import { getSectionForType } from '../../../config/maintenance-models';

export default function QuickAddLink(props) {
    const { referenceType, onRefreshClick } = props;

    const sectionForReferenceType = getSectionForType(referenceType);

    const styles = {
        quickAddWrap: {
            display: 'flex',
        },
        hidden: {
            display: 'none',
        },
    };

    if (!sectionForReferenceType) {
        return <div style={styles.hidden} />;
    }

    return (
        <div style={styles.quickAddWrap}>
            <Link
                to={`/edit/${sectionForReferenceType}/${referenceType}/add`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <IconButton tooltip="Add new" tooltipPosition="top-left">
                    <AddCircleOutlineIcon />
                </IconButton>
            </Link>
            <IconButton tooltip="Refresh values" tooltipPosition="top-left" onClick={onRefreshClick}>
                <RefreshIcon />
            </IconButton>
        </div>
    );
}

QuickAddLink.propTypes = {
    referenceType: PropTypes.string.isRequired,
    onRefreshClick: PropTypes.func.isRequired,
};
