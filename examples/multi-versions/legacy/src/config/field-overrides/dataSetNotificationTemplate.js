
import DeliveryChannels from './program-notification-template/DeliveryChannels';
import RelativeScheduledDays from './program-notification-template/RelativeScheduledDays';
import RecipentUserGroup from './data-set-notification-template/RecipentUserGroup';
import DataSetNotificationSubjectAndMessageTemplateFields from './data-set-notification-template/DataSetNotificationSubjectAndMessageTemplateFields';

export default new Map([
    ['deliveryChannels', {
        component: DeliveryChannels,
    }],
    ['relativeScheduledDays', {
        component: RelativeScheduledDays,
    }],
    ['dataSetNotificationTrigger', {
        required: true,
        fieldOptions: {
            options: [
                'DATA_SET_COMPLETION',
                'SCHEDULED_DAYS',
            ],
        },
    }],
    ['messageTemplate', {
        component: DataSetNotificationSubjectAndMessageTemplateFields,
    }],
    ['notificationRecipient', {
        required: true,
    }],
    ['recipientUserGroup', {
        component: RecipentUserGroup,
    }],
]);
