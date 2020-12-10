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
        }
    };
}