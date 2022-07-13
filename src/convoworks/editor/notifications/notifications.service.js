/* @ngInject */
export default function NotificationsService($log, $window, localStorageService, StringService)
{
    let service_id = null;

    // API
    this.setServiceId = setServiceId;

    this.addSuccess = addSuccess;
    this.addInfo = addInfo;
    this.addWarning = addWarning;
    this.addDanger = addDanger;
    
    this.getNotifications = getNotifications;
    this.deleteNotification = deleteNotification;
    
    this.markAsRead = markAsRead;

    // IMPL
    function setServiceId(serviceId) {
        service_id = serviceId;
    }

    function addSuccess(title, details)
    {
        this._addNotification('Success', title, details);
    }

    function addInfo(title, details)
    {
        this._addNotification('Info', title, details);
    }

    function addWarning(title, details)
    {
        this._addNotification('Warning', title, details);
    }

    function addDanger(title, details)
    {
        this._addNotification('Danger', title, details);
    }

    function getNotifications()
    {
        const notifications = _getNotifications(service_id);

        $log.log('NotificationsService got notifications for service', service_id, notifications);

        return notifications.sort((a, b) => a.time_created < b.time_created)
    }

    function deleteNotification(notification)
    {
        _setNotifications(service_id, _getNotifications(service_id).filter(n => n.id !== notification.id));
    }

    function markAsRead(notification)
    {
        const notifications = _getNotifications(service_id);

        const index = notifications.findIndex(n => n.id === notification.id);

        if (index === -1) {
            return;
        }

        notifications[index] = {
            ...notifications[index],
            read: true
        };

        _setNotifications(service_id, notifications);
    }

    // PRIVATE
    function _addNotification(type, title, details)
    {
        _setNotifications(service_id, [
            {
                id: StringService.generateUUIDV4(),
                type,
                title,
                details,
                read: false,
                time_created: Math.floor(new Date().getTime() / 1000)
            },
            ..._getNotifications(service_id)
        ]);
    }

    function _getNotifications()
    {
        if (!service_id) {
            $log.error('NotificationsService service_id not yet initialized.');
            return [];
        }

        return localStorageService.get(`serviceNotifications_${service_id}`) || [];
    }

    function _setNotifications(notifications)
    {
        if (!service_id) {
            $log.error('NotificationsService service_id not yet initialized.');
            return [];
        }

        localStorageService.set(`serviceNotifications_${service_id}`, notifications);
        _dispatchEvent(service_id);
    }

    function _dispatchEvent()
    {
        let e = new StorageEvent('storage');
        e.initStorageEvent('storage', true, true, localStorageService.deriveKey(`serviceNotifications_${service_id}`));
        $window.dispatchEvent(e);
    }
}