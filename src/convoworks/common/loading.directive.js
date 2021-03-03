import template from './loading.tmpl.html';

/* @ngInject */
export default function loadingIndicator( $http, $log) {

    $log.log('loadingIndicator init');

    return {
        restrict: 'E',
        template : template,
        link: function (scope, elm, attrs) {

            $log.log( 'loadingIndicator link', elm);

            scope.$watch( function () {
                return $http.pendingRequests.length > 0;
            }, function (v) {
                if (v) {
                    elm.find('.sk-cube-grid').show();
                } else {
                    elm.find('.sk-cube-grid').hide();
                }
            });
        }
    };
}
