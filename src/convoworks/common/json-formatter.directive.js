import JSONFormatter from 'json-formatter-js';

/* @ngInject */
export default function jsonFormatter($log) {
    return {
        restrict: 'E',
        scope: { 'data': '=' },
        link: function($scope, $element, $attributes) {
            $scope.$watch('data', (value) => {
                if (!value) {
                    value = {};
                }

                $log.log('heh', value);
                
                const formatter = new JSONFormatter(value);
                $element.append(formatter.render());
            }, true);
        }
    }
}