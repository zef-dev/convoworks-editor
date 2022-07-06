/* @ngInject */
export default function NotificationsService($log, localStorageService, StringService)
{
    // API
    this.addNotification = addNotification;
    this.getNotifications = getNotifications;
    
    this.markAsRead = markAsRead;

    // IMPL
    function addNotification(serviceId, type, title, details)
    {
        _setNotifications(serviceId, [
            {
                id: StringService.generateUUIDV4(),
                type,
                title,
                details,
                read: false,
                time_created: Math.floor(new Date().getTime() / 1000)
            },
            ..._getNotifications(serviceId)
        ]);
    }

    function getNotifications(serviceId)
    {
        const notifications = _getNotifications(serviceId);

        $log.log('NotificationsService got notifications for service', serviceId, notifications);

        return notifications.sort((a, b) => a.time_created < b.time_created)
    }

    function markAsRead(serviceId, notificationId)
    {
        const notifications = _getNotifications();

        const index = notifications.findIndex(n => n.id === notificationId);

        if (index === -1) {
            return;
        }

        notifications[index] = {
            ...notifications[index],
            read: true
        };

        _setNotifications(serviceId, notifications);
    }

    // PRIVATE
    function _getNotifications(serviceId)
    {
        return localStorageService.get(`serviceNotifications_${serviceId}`) || [];
    }

    function _setNotifications(serviceId, notifications)
    {
        localStorageService.set(`serviceNotifications_${serviceId}`, notifications);
    }
}