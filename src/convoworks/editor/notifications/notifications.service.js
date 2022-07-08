/* @ngInject */
export default function NotificationsService($log, $window, localStorageService, StringService)
{
    // API
    this.getNotifications = getNotifications;
    this.addNotification = addNotification;
    this.deleteNotification = deleteNotification;
    
    this.markAsRead = markAsRead;

    // IMPL
    function getNotifications(serviceId)
    {
        const notifications = _getNotifications(serviceId);

        $log.log('NotificationsService got notifications for service', serviceId, notifications);

        return notifications.sort((a, b) => a.time_created < b.time_created)
    }

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

    function deleteNotification(serviceId, notification)
    {
        _setNotifications(serviceId, _getNotifications(serviceId).filter(n => n.id !== notification.id));
    }

    function markAsRead(serviceId, notification)
    {
        const notifications = _getNotifications(serviceId);

        const index = notifications.findIndex(n => n.id === notification.id);

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
        _dispatchEvent(serviceId);
    }

    function _dispatchEvent(serviceId)
    {
        let e = new StorageEvent('storage');
        e.initStorageEvent('storage', true, true, localStorageService.deriveKey(`serviceNotifications_${serviceId}`));
        $window.dispatchEvent(e);
    }
}