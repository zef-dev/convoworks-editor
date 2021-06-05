import template from './alert-indicator.tmpl.html';

/* @ngInject */
export default function alertIndicator( AlertService, $log) {

    $log.log('alertIndicator init');

    return {
        restrict: 'E',
        template : template,
        link: function ( $scope, $elem) {

            $log.log( 'alertIndicator link');

            $scope.getAlerts     =   AlertService.getAlerts;
            $scope.closeAlert    =   AlertService.closeAlert;

            $scope.hasIcon = function(type)
            {
                switch (type) {
                    case "success":
                    case "danger":
                    case "warning":
                        return true;
                    case "info":
                    default:
                        return false;
                }
            }

            $scope.getAlertIconClass = function(type)
            {
                switch (type) {
                    case "success":
                        return 'fa fa-check';
                    case "danger":
                        return 'fa fa-times-circle';
                    case "warning":
                        return 'fa fa-exclamation-circle';
                    case "info":
                    default:
                        return '';
                }
            }
        }
    };
}
