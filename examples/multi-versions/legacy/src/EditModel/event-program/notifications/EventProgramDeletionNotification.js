import { connect } from 'react-redux';
import { isDeletingSelector, objectNameToBeDeletedSelector } from './selectors';
import DeletingMessage from './DeletingMessage';

const EventProgramDeletionNotification = connect(state => ({
    isDeleting: isDeletingSelector(state),
    name: objectNameToBeDeletedSelector(state),
}))(DeletingMessage);

export default EventProgramDeletionNotification;
