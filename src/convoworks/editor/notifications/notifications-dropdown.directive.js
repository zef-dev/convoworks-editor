import template from './notifications-dropdown.tmpl.html';

/* @ngInject */
export default function notificationsDropdown($log, NotificationsService)
{
    return {
        restrict: 'E',
        scope: {
            serviceId: '='
        },
        template,
        link: function($scope, $element, $attributes)
        {
            $log.log('notificationsDropdown linked');

            let loading = false;

            $scope.notifications = [];

            _init();

            $scope.isLoading = () => loading;

            function _init()
            {
                loading = true;

                $scope.notifications = NotificationsService.getNotifications($scope.serviceId);

                loading = false;
            }
        }
    }
}