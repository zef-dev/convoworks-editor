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
                        return 'glyphicon glyphicon-ok';
                    case "danger":
                        return 'glyphicon glyphicon-remove-circle';
                    case "warning":
                        return 'glyphicon glyphicon-exclamation-sign';
                    case "info":
                    default:
                        return '';
                }
            }
        }
    };
}
