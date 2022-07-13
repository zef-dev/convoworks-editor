import template from './notifications-dropdown.tmpl.html';

/* @ngInject */
export default function notificationsDropdown($log, $window, $timeout, NotificationsService)
{
    return {
        restrict: 'E',
        template,
        link: function($scope, $element, $attributes)
        {
            $log.log('notificationsDropdown linked');

            const MARK_AS_READ_DELAY = 100;
            let mark_as_read_timeout = null;

            $scope.notifications = [];

            _init();

            $scope.getUnreadCount = () => $scope.notifications.filter(n => !n.read).length;

            $scope.getNotificationIcon = (type) => {
                switch (type.toLowerCase()) {
                    case "info":
                        return 'fa fa-info-circle';
                    case "success":
                        return 'fa fa-check-circle';
                    case "warning":
                        return 'fa fa-exclamation-circle';
                    case "danger":
                        return 'fa fa-times-circle';
                    default:
                        return '';
                }
            }

            $scope.deleteNotification = ($event, notification) => {
                $event.preventDefault();
                $event.stopPropagation();

                NotificationsService.deleteNotification(notification);
            }

            $scope.markAsRead = (notification) => {
                if (notification.read) {
                    return;
                }
                
                if (mark_as_read_timeout) {
                    $timeout.cancel(mark_as_read_timeout);
                    mark_as_read_timeout = null;
                }

                mark_as_read_timeout = $timeout(() => {
                    NotificationsService.markAsRead(notification);
                }, MARK_AS_READ_DELAY);
            }

            $window.addEventListener('storage', (event) => {
                if (!event || !event.key) {
                    return;
                }

                if (!event.key.includes(`serviceNotifications_${$scope.serviceId}`)) {
                    return;
                }

                _init();
            })

            function _init()
            {
                $scope.notifications = NotificationsService.getNotifications();
            }
        }
    }
}